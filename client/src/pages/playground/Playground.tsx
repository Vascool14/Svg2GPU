import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import Editor from "@monaco-editor/react";
import { SVG_EXAMPLES } from "./constants";

const INITIAL_SVG = SVG_EXAMPLES[4]?.svg

type ConsoleMessage = {
    id: number;
    type: "info" | "error";
    text: string;
    time: string;
};

type GpuSceneStats = {
    batches: number;
    vertices: number;
    indices: number;
};

type Svg2GPUInstance = {
    ready: Promise<void>;
    render: () => void;
    destroy: () => void;
    getStats: () => GpuSceneStats | null;
};

type Svg2GPUConstructor = new (
    rootElementId: string,
    options: {
        svg: string;
        antialias?: boolean;
        background?: [number, number, number] | [number, number, number, number];
        fit?: "contain" | "cover" | "stretch" | "none";
        flattenTolerance?: number;
    },
) => Svg2GPUInstance;

const TERMINAL_MIN_LINES = 2;
const TERMINAL_MAX_LINES = 35;
const TERMINAL_DEFAULT_LINES = 6;
const TERMINAL_LINE_HEIGHT_PX = 18;
const TERMINAL_HISTORY_LIMIT = 200;

function validateSvg(svg: string): { valid: true } | { valid: false; error: string } {
    const trimmed = svg.trim();
    if (!trimmed) {
        return { valid: false, error: "The SVG source is empty." };
    }

    try {
        const doc = new DOMParser().parseFromString(trimmed, "image/svg+xml");
        const parserError = doc.querySelector("parsererror");
        if (parserError) {
            const details = (parserError.textContent ?? "")
                .replace(/\s+/g, " ")
                .trim()
                .slice(0, 300);
            return {
                valid: false,
                error: details || "The SVG content is not valid XML.",
            };
        }

        const root = doc.documentElement;
        if (!root || root.tagName.toLowerCase() !== "svg") {
            return { valid: false, error: 'Root element must be "<svg>".' };
        }

        return { valid: true };
    } catch (error) {
        return {
            valid: false,
            error: error instanceof Error ? error.message : "Unknown validation error.",
        };
    }
}

function normalizePreviewSvg(svg: string, showBorder: boolean): string {
    try {
        const doc = new DOMParser().parseFromString(svg, "image/svg+xml");
        const root = doc.documentElement;
        if (!root || root.tagName.toLowerCase() !== "svg") return svg;

        // root.setAttribute("width", "100%");
        // root.setAttribute("height", "100%");
        root.setAttribute("preserveAspectRatio", "xMidYMid meet");
        root.setAttribute(
            "style",
            `display:block;max-width:100%;max-height:100%;${
                showBorder ? "border:1px solid var(--primary);" : "border:none;"
            }`,
        );

        return new XMLSerializer().serializeToString(root);
    } catch {
        return svg;
    }
}

export default function Playground() {
    const reactId = useId();
    const gpuPreviewRootId = useMemo(
        () => `playground-webgpu-${reactId.replace(/\W+/g, "-")}`,
        [reactId],
    );
    const [editorSvg, setEditorSvg] = useState(INITIAL_SVG);
    const [renderedSvg, setRenderedSvg] = useState(INITIAL_SVG);
    const [selectedExampleIndex, setSelectedExampleIndex] = useState(4);
    const [isExampleMenuOpen, setIsExampleMenuOpen] = useState(false);
    const [showBorder, setShowBorder] = useState(false);
    const [terminalLines, setTerminalLines] = useState(TERMINAL_DEFAULT_LINES);
    const [consoleMessages, setConsoleMessages] = useState<ConsoleMessage[]>([]);

    const canvasViewportRef = useRef<HTMLDivElement>(null);
    const exampleMenuRef = useRef<HTMLDivElement>(null);
    const consoleRef = useRef<HTMLDivElement>(null);
    const gpuInstanceRef = useRef<Svg2GPUInstance | null>(null);
    const consoleIdRef = useRef(0);
    const dragStartYRef = useRef<number | null>(null);
    const dragStartLinesRef = useRef(TERMINAL_DEFAULT_LINES);

    const pushConsoleMessage = useCallback((type: ConsoleMessage["type"], text: string) => {
        const now = new Date();
        const time = now.toLocaleTimeString("en-GB", { hour12: false });

        setConsoleMessages((previous) => {
            const next: ConsoleMessage = {
                id: ++consoleIdRef.current,
                type,
                text,
                time,
            };

            return [...previous, next].slice(-TERMINAL_HISTORY_LIMIT);
        });
    }, []);

    const startTerminalDrag = useCallback(
        (clientY: number) => {
            dragStartYRef.current = clientY;
            dragStartLinesRef.current = terminalLines;
        },
        [terminalLines],
    );

    useEffect(() => {
        const onMouseMove = (event: MouseEvent) => {
            if (dragStartYRef.current === null) return;
            const deltaY = event.clientY - dragStartYRef.current;
            const nextLines = Math.round(
                dragStartLinesRef.current - deltaY / TERMINAL_LINE_HEIGHT_PX,
            );
            const clampedLines = Math.max(
                TERMINAL_MIN_LINES,
                Math.min(TERMINAL_MAX_LINES, nextLines),
            );
            setTerminalLines(clampedLines);
        };

        const endDrag = () => {
            dragStartYRef.current = null;
        };

        document.addEventListener("mousemove", onMouseMove);
        document.addEventListener("mouseup", endDrag);
        return () => {
            document.removeEventListener("mousemove", onMouseMove);
            document.removeEventListener("mouseup", endDrag);
        };
    }, []);

    useEffect(() => {
        const debounceTimer = window.setTimeout(() => {
            const validationResult = validateSvg(editorSvg);
            if (!validationResult.valid) {
                pushConsoleMessage(
                    "error",
                    `Rendering was not updated because the SVG is invalid: ${validationResult.error}`,
                );
                return;
            }

            setRenderedSvg(editorSvg);
        }, 200);

        return () => window.clearTimeout(debounceTimer);
    }, [editorSvg, pushConsoleMessage]);

    useEffect(() => {
        const canvasViewport = canvasViewportRef.current;
        if (!canvasViewport) return;

        let cancelled = false;
        let instance: Svg2GPUInstance | null = null;
        const root = document.getElementById(gpuPreviewRootId);
        const renderStart = performance.now();

        if (!root) {
            pushConsoleMessage("error", "WebGPU preview root was not found.");
            return;
        }

        root.innerHTML = "";

        const startRenderer = async () => {
            try {
                // @ts-expect-error The client consumes the built package artifact directly.
                const module = (await import("../../../../svg2gpu/lib/svg2gpu.mjs")) as {
                    Svg2GPU: Svg2GPUConstructor;
                };
                if (cancelled) return;

                instance = new module.Svg2GPU(gpuPreviewRootId, {
                    svg: renderedSvg,
                    antialias: true,
                    background: [1, 1, 1, 0],
                    fit: "contain",
                    flattenTolerance: 0.35,
                });
                gpuInstanceRef.current = instance;

                await instance.ready;
                if (cancelled) return;

                const elapsed = Math.max(0, Math.round(performance.now() - renderStart));
                const stats = instance.getStats();
                const statsSummary = stats
                    ? `, ${stats.batches} batches, ${stats.vertices} vertices, ${stats.indices} indices`
                    : "";
                pushConsoleMessage("info", `rendered ${elapsed}ms${statsSummary}`);
            } catch (error) {
                if (!cancelled) {
                    pushConsoleMessage(
                        "error",
                        error instanceof Error ? error.message : "WebGPU rendering failed.",
                    );
                }
            }
        };

        startRenderer();

        const draw = () => {
            if (!gpuInstanceRef.current || gpuInstanceRef.current !== instance) return;
            try {
                gpuInstanceRef.current.render();
            } catch (error) {
                pushConsoleMessage(
                    "error",
                    error instanceof Error ? error.message : "WebGPU redraw failed.",
                );
            }
        };

        const resizeObserver = new ResizeObserver(draw);
        resizeObserver.observe(canvasViewport);

        const originalSidePadding = getComputedStyle(document.documentElement).getPropertyValue(
            "--side-padding",
        );
        document.documentElement.style.setProperty("--side-padding", "1.8rem");

        return () => {
            cancelled = true;
            resizeObserver.disconnect();
            if (gpuInstanceRef.current === instance) {
                gpuInstanceRef.current = null;
            }
            instance?.destroy();
            root.innerHTML = "";
            document.documentElement.style.setProperty("--side-padding", originalSidePadding);
        };
    }, [gpuPreviewRootId, renderedSvg, pushConsoleMessage]);

    useEffect(() => {
        const onPointerDown = (event: MouseEvent) => {
            const target = event.target as Node | null;
            if (!exampleMenuRef.current || !target) return;
            if (!exampleMenuRef.current.contains(target)) {
                setIsExampleMenuOpen(false);
            }
        };

        document.addEventListener("mousedown", onPointerDown);
        return () => document.removeEventListener("mousedown", onPointerDown);
    }, []);

    useEffect(() => {
        const node = consoleRef.current;
        if (!node) return;
        node.scrollTop = node.scrollHeight;
    }, [consoleMessages]);

    const svgPreviewMarkup = normalizePreviewSvg(renderedSvg, showBorder);
    const hasExamples = SVG_EXAMPLES.length > 0;
    const selectedExample = hasExamples ? SVG_EXAMPLES[selectedExampleIndex] : null;

    return (
        <main
            className="flex h-screen w-full gap-3"
            style={{
                padding: "calc(var(--nav-height) + 1rem) 1rem 1rem 1rem",
            }}
        >
            <div className="min-w-0 flex-[1.4] overflow-hidden border bg-[#1e1e1e] flex flex-col">
                <div className="border-b p-1">
                    <div className="flex items-center gap-3">
                        <p className="mr-auto text-sm pl-2">SVG Editor</p>

                        <div
                            className="relative w-[15rem] max-w-[60%] min-w-[8rem]"
                            ref={exampleMenuRef}
                        >
                            <button
                                type="button"
                                disabled={!hasExamples}
                                onClick={() => setIsExampleMenuOpen((prev) => !prev)}
                                className="w-full rounded-(--radius) border bg-(--bg) px-3 py-[0.32rem] text-left text-sm text-(--text) transition-colors duration-200 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
                                aria-haspopup="listbox"
                                aria-expanded={isExampleMenuOpen}
                            >
                                <span className="flex items-center justify-between gap-3">
                                    <span className="truncate">
                                        {selectedExample ? selectedExample.name : "No examples"}
                                    </span>
                                    <svg
                                        viewBox="0 0 20 20"
                                        fill="none"
                                        className={`h-4 w-4 shrink-0 text-[var(--text-thin)] transition-transform duration-200 ${
                                            isExampleMenuOpen ? "rotate-180" : ""
                                        }`}
                                    >
                                        <path
                                            d="M5 8L10 13L15 8"
                                            stroke="currentColor"
                                            strokeWidth="1.8"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                </span>
                            </button>

                            {hasExamples && isExampleMenuOpen ? (
                                <div
                                    role="listbox"
                                    className="absolute left-0 right-0 top-[calc(100%+0.6rem)] z-20 max-h-56 overflow-auto rounded-[var(--radius)] border bg-[#121212] shadow-[0_12px_28px_rgba(0,0,0,0.55)]"
                                >
                                    {SVG_EXAMPLES.map((example, index) => {
                                        const isActive = index === selectedExampleIndex;
                                        return (
                                            <div
                                                key={`${example.name}-${index}`}
                                                role="option"
                                                aria-selected={isActive}
                                                tabIndex={0}
                                                onClick={() => {
                                                    setSelectedExampleIndex(index);
                                                    setEditorSvg(example.svg);
                                                    setIsExampleMenuOpen(false);
                                                }}
                                                onKeyDown={(event) => {
                                                    if (event.key !== "Enter" && event.key !== " ")
                                                        return;
                                                    event.preventDefault();
                                                    setSelectedExampleIndex(index);
                                                    setEditorSvg(example.svg);
                                                    setIsExampleMenuOpen(false);
                                                }}
                                                className={`cursor-pointer border-b px-3 py-[0.32rem] text-sm transition-colors duration-150 last:border-b-0 ${
                                                    isActive
                                                        ? "bg-(--bg) text-(--text)"
                                                        : "text-(--text-thin) hover:bg-white/5 hover:text-(--text)"
                                                }`}
                                            >
                                                {example.name}
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : null}
                        </div>
                    </div>
                </div>

                <div className="min-h-0 flex-1">
                    <Editor
                        language="xml"
                        value={editorSvg}
                        height="100%"
                        width="100%"
                        theme="vs-dark"
                        options={{
                            automaticLayout: true,
                            lineNumbersMinChars: 4,
                            tabSize: 2,
                            minimap: { enabled: false },
                            fontSize: 14,
                            wordWrap: "on",
                            scrollBeyondLastColumn: 0,
                            scrollBeyondLastLine: false,
                            padding: { top: 12, bottom: 12 },
                        }}
                        onChange={(value) => setEditorSvg(value ?? "")}
                    />
                </div>

                <div
                    className="border-t bg-[#0f1012]"
                    onMouseDown={(event) => {
                        event.preventDefault();
                        startTerminalDrag(event.clientY);
                    }}
                >
                    <div className="cursor-row-resize flex items-center justify-between border-b bg-(--bg) px-3 py-1.5">
                        Console
                        <div className="font-mono text-[10px] text-[var(--text-thin)]">
                            {terminalLines} lines
                        </div>
                    </div>
                    <div
                        ref={consoleRef}
                        className="overflow-y-auto px-3 py-2 font-mono text-xs"
                        style={{ height: `${terminalLines * TERMINAL_LINE_HEIGHT_PX}px` }}
                    >
                        {consoleMessages.length === 0 ? (
                            <div className="leading-[18px] text-[var(--primary)]">
                                awaiting input...
                            </div>
                        ) : (
                            consoleMessages.map((message) => (
                                <div
                                    key={message.id}
                                    className={`leading-[18px] ${
                                        message.type === "error"
                                            ? "text-red-400"
                                            : "text-[var(--primary)]"
                                    }`}
                                >
                                    [{message.time}] {message.text}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            <div className="flex min-w-0 flex-1 flex-col gap-3">
                <div className="flex min-h-0 flex-1 flex-col overflow-hidden border">
                    <div className="flex items-center justify-between border-b px-3 py-2 text-sm text-(--text-thin) bg-(--bg-darker)">
                        <span>SVG Preview</span>
                        <label className="inline-flex items-center gap-2 select-none">
                            <span className="text-xs">Show border</span>
                            <input
                                type="checkbox"
                                checked={showBorder}
                                onChange={(e) => setShowBorder(e.target.checked)}
                                className="peer sr-only"
                            />
                            <span className="cursor-pointer relative h-6 w-11 rounded-full bg-zinc-600 transition-colors duration-200 peer-checked:bg-[#34C759] peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[#34C759]/70 after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow-sm after:transition-transform after:duration-200 after:content-[''] peer-checked:after:translate-x-5" />
                        </label>
                    </div>
                    <div className="min-h-0 flex-1 overflow-hidden">
                        <div
                            className="h-full w-full flex justify-center overflow-hidden"
                            dangerouslySetInnerHTML={{ __html: svgPreviewMarkup }}
                        />
                    </div>
                </div>

                <div className="flex min-h-0 flex-1 flex-col overflow-hidden border">
                    <div className="border-b px-3 py-2 text-sm text-(--text-thin) bg-(--bg-darker)">
                        WebGPU Preview
                    </div>
                    <div
                        ref={canvasViewportRef}
                        className="relative min-h-0 flex-1 overflow-hidden justify-center flex"
                    >
                        <div id={gpuPreviewRootId} className="h-full aspect-[1] flex justify-center mx-auto" />
                    </div>
                </div>
            </div>
        </main>
    );
}
