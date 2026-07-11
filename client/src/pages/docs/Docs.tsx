import { LINKS } from "../../links";

const TYPEDOC_BASE = `${import.meta.env.BASE_URL}typedoc`;

function CodeBlock({ children }: { children: string }) {
    return (
        <pre className="code-component overflow-auto rounded-md border bg-[#050607] p-4 text-sm leading-6 text-[#d9e7f7]">
            <code>{children}</code>
        </pre>
    );
}

function ExternalLink({ href, children }: { href: string; children: React.ReactNode }) {
    return (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--primary)] underline underline-offset-4"
        >
            {children}
        </a>
    );
}

function Section({
    id,
    title,
    children,
}: {
    id: string;
    title: string;
    children: React.ReactNode;
}) {
    return (
        <section id={id} className="scroll-mt-28 border-t py-12 first:border-t-0 first:pt-0">
            <h2 className="mb-6 text-3xl font-semibold tracking-normal text-[var(--text)]">
                {title}
            </h2>
            <div className="grid gap-5 text-[var(--text-thin)]">{children}</div>
        </section>
    );
}

function CodePen({ id, title, href }: { id: string; title: string; href: string }) {
    return (
        <div className="overflow-hidden rounded-md border bg-[#111]">
            <iframe
                title={title}
                src={`https://codepen.io/vasculandrei/embed/${id}?default-tab=html%2Cresult&theme-id=dark`}
                className="h-[36rem] w-full border-0"
                loading="lazy"
                allowFullScreen
            />
            <p className="border-t px-4 py-3 text-sm">
                <ExternalLink href={href}>Open {title} on CodePen</ExternalLink>
            </p>
        </div>
    );
}

const options = [
    ["svg", "string", "required", "The complete SVG markup to parse and render."],
    [
        "canvas",
        "HTMLCanvasElement",
        "created for you",
        "Render into an existing canvas instead of appending one to the root element.",
    ],
    ["antialias", "boolean", "true", "Enables multisample antialiasing for smoother edges."],
    [
        "background",
        "[r, g, b, a]",
        "[1, 1, 1, 0]",
        "Canvas clear color. Every component is a number from 0 to 1.",
    ],
    [
        "fit",
        '"contain" | "cover" | "stretch" | "none"',
        '"contain"',
        "Controls how the SVG viewBox maps into the canvas.",
    ],
    [
        "dpr",
        "number",
        "devicePixelRatio",
        "Controls the canvas resolution. Lower it to trade sharpness for less GPU work.",
    ],
    [
        "flattenTolerance",
        "number",
        "0.25",
        "Controls curve approximation. Smaller values are smoother and create more geometry.",
    ],
] as const;

export default function Docs() {
    return (
        <main>
            <article className="w-full">
                <header className="mb-14 max-w-4xl">
                    <p className="mb-3 font-mono text-sm text-[var(--primary)]">svg2gpu / guide</p>
                    <h1 className="mb-5 text-4xl font-semibold tracking-normal text-[var(--text)]">
                        Get an SVG on the GPU.
                    </h1>
                    <p className="max-w-3xl text-lg leading-8 text-[var(--text-thin)]">
                        Install the package, give it an SVG string and a place to draw, then wait
                        for WebGPU to initialize. Start with the example that matches your project.
                    </p>
                    <div className="mt-7 flex flex-wrap gap-3 text-sm">
                        <ExternalLink href={LINKS.npm}>npm package</ExternalLink>
                        <ExternalLink href={LINKS.playground}>playground</ExternalLink>
                        <ExternalLink href={LINKS.api}>API reference</ExternalLink>
                        <ExternalLink href={LINKS.github}>GitHub</ExternalLink>
                    </div>
                </header>

                <Section id="install" title="Install">
                    <CodeBlock>npm install svg2gpu</CodeBlock>
                    <p className="leading-8">
                        Rendering needs a browser with WebGPU. Parsing and compiling SVG geometry
                        can be used separately through <code>Svg2GPU.compile</code>.
                    </p>
                </Section>

                <Section id="react" title="Getting started in React">
                    <p className="leading-8">
                        Create the renderer after the host element mounts and destroy it when the
                        component unmounts. Recreate it when the SVG changes.
                    </p>
                    <CodeBlock>{`import { useEffect, useId } from "react";
import { Svg2GPU } from "svg2gpu";

export function SvgPreview({ svg }: { svg: string }) {
  const rootId = \`svg2gpu-\${useId().replace(/:/g, "")}\`;

  useEffect(() => {
    const renderer = new Svg2GPU(rootId, {
      svg,
      fit: "contain",
      antialias: true,
      background: [0.03, 0.04, 0.05, 1],
    });

    renderer.ready.catch(console.error);

    return () => renderer.destroy();
  }, [rootId, svg]);

  return <div id={rootId} style={{ width: 640, height: 480 }} />;
}`}</CodeBlock>
                    <p className="leading-8">
                        If the container changes size without a React rerender, call{" "}
                        <code>renderer.resize()</code>. For frequent SVG changes, keep the instance
                        in a ref and call <code>await renderer.update(nextSvg)</code>.
                    </p>
                </Section>

                <Section id="vanilla" title="Getting started in vanilla JavaScript">
                    <p className="leading-8">
                        Use the browser bundle directly. Pinning the version keeps the example
                        stable.
                    </p>
                    <CodeBlock>{`<div id="preview" style="width: 640px; height: 480px"></div>

<script src="https://cdn.jsdelivr.net/npm/svg2gpu@1.0.7/lib/svg2gpu.min.js"></script>
<script>
  const { Svg2GPU } = window.svg2gpu;

  const svg = \`
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="38" fill="#2e9dfe" />
    </svg>
  \`;

  const renderer = new Svg2GPU("preview", { svg });
  renderer.ready.catch(console.error);
</script>`}</CodeBlock>
                </Section>

                <Section id="options" title="Options">
                    <div className="overflow-x-auto rounded-md border">
                        <table className="w-full min-w-[48rem] border-collapse text-left text-sm">
                            <thead className="bg-white/5 text-[var(--text)]">
                                <tr>
                                    <th className="p-3">Property</th>
                                    <th className="p-3">Type</th>
                                    <th className="p-3">Default</th>
                                    <th className="p-3">What it does</th>
                                </tr>
                            </thead>
                            <tbody>
                                {options.map(([name, type, defaultValue, description]) => (
                                    <tr key={name} className="border-t align-top">
                                        <td className="p-3 font-mono text-[var(--primary)]">
                                            {name}
                                        </td>
                                        <td className="p-3 font-mono">{type}</td>
                                        <td className="p-3 font-mono">{defaultValue}</td>
                                        <td className="p-3 leading-6">{description}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <p className="leading-8">
                        <code>contain</code> keeps the whole SVG visible, <code>cover</code> fills
                        the canvas and may crop, <code>stretch</code> ignores aspect ratio, and{" "}
                        <code>none</code> uses SVG coordinates directly.
                    </p>
                    <p className="leading-8">
                        See the exact{" "}
                        <ExternalLink href={`${TYPEDOC_BASE}/types/Svg2GPUOptions.html`}>
                            Svg2GPUOptions type
                        </ExternalLink>{" "}
                        in TypeDoc.
                    </p>
                </Section>

                <Section id="methods" title="Methods and lifecycle">
                    <div className="grid gap-3 sm:grid-cols-2">
                        {[
                            [
                                "ready",
                                "Resolves when the WebGPU device, canvas and first scene are ready.",
                            ],
                            ["update(svg)", "Compiles a new SVG, uploads it and renders it."],
                            ["render()", "Draws the current scene again."],
                            ["resize()", "Matches the canvas resolution to its displayed size."],
                            [
                                "getScene()",
                                "Returns the compiled scene, including geometry and diagnostics.",
                            ],
                            ["getStats()", "Returns batch, vertex and index counts."],
                            ["destroy()", "Releases GPU resources. Call it during cleanup."],
                        ].map(([name, description]) => (
                            <div key={name} className="rounded-md border bg-white/[0.025] p-4">
                                <code className="text-[var(--primary)]">{name}</code>
                                <p className="mt-2 leading-6">{description}</p>
                            </div>
                        ))}
                    </div>
                    <p className="leading-8">
                        The full class reference is available at{" "}
                        <ExternalLink href={LINKS.api}>Svg2GPU</ExternalLink>.
                    </p>
                </Section>

                <Section id="compile" title="Compile without rendering">
                    <p className="leading-8">
                        Use the static compiler when you need geometry, diagnostics or metrics but
                        do not want to create a WebGPU device.
                    </p>
                    <CodeBlock>{`import { Svg2GPU } from "svg2gpu";

const scene = Svg2GPU.compile(svg, { flattenTolerance: 0.25 });

console.log(scene.stats);
console.log(scene.diagnostics);`}</CodeBlock>
                </Section>

                <Section id="examples" title="Live examples">
                    <p className="leading-8">
                        The first pen is the smallest working setup. The second renders a much
                        larger SVG map of Romania. Edit either example and rerun it in CodePen.
                    </p>
                    <CodePen id="emgMBRZ" title="Basic svg2gpu example" href={LINKS.basicCodePen} />
                    <CodePen id="XJpENaj" title="Romania map example" href={LINKS.romaniaCodePen} />
                </Section>

                <Section id="next" title="Where to go next">
                    <p className="leading-8">
                        Experiment in the{" "}
                        <ExternalLink href={LINKS.playground}>playground</ExternalLink>, inspect
                        precise signatures in the{" "}
                        <ExternalLink href={LINKS.typedoc}>API reference</ExternalLink>, or browse
                        the <ExternalLink href={LINKS.github}>source on GitHub</ExternalLink>.
                    </p>
                </Section>
            </article>
        </main>
    );
}
