const TYPEDOC_BASE = `${import.meta.env.BASE_URL}typedoc`;

const CONTENTS = [
    ["overview", "1. What svg2gpu is"],
    ["install", "2. Install and import"],
    ["first-render", "3. First render"],
    ["lifecycle", "4. Renderer lifecycle"],
    ["compile", "5. Compile without drawing"],
    ["scene", "6. Scene data"],
    ["options", "7. Options that matter"],
    ["transforms", "8. Transforms and styles"],
    ["demo", "9. Demo patterns"],
    ["limits", "10. Limits and next steps"],
] as const;

function CodeBlock({ children }: { children: string }) {
    return (
        <pre className="code-component overflow-auto rounded-md border bg-[#050607] p-4 text-sm leading-6 text-[#d9e7f7]">
            <code>{children}</code>
        </pre>
    );
}

function DocLink({ href, children }: { href: string; children: React.ReactNode }) {
    return (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--primary)] underline-offset-4 hover:underline"
        >
            {children}
        </a>
    );
}

function Section({
    id,
    eyebrow,
    title,
    children,
}: {
    id: string;
    eyebrow: string;
    title: string;
    children: React.ReactNode;
}) {
    return (
        <section id={id} className="scroll-mt-28 border-t py-12 first:border-t-0 first:pt-0">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.12em] text-[var(--primary)]">
                {eyebrow}
            </p>
            <h2 className="mb-5 text-3xl font-semibold tracking-normal text-[var(--text)]">
                {title}
            </h2>
            <div className="grid gap-5 text-[var(--text-thin)]">{children}</div>
        </section>
    );
}

export default function Docs() {
    return (
        <main>
            <div className="grid gap-10 lg:grid-cols-[18rem_minmax(0,1fr)]">
                <aside className="lg:sticky lg:top-[calc(var(--nav-height)+1.25rem)] lg:h-[calc(100dvh-var(--nav-height)-2.5rem)] lg:overflow-auto">
                    <div className="border bg-[#0d0f12] p-4">
                        <h1 className="mb-3 text-xl font-semibold tracking-normal text-[var(--text)]">
                            What&apos;s in this content
                        </h1>
                        <nav aria-label="Docs contents" className="grid gap-1">
                            {CONTENTS.map(([id, label]) => (
                                <a
                                    key={id}
                                    href={`#${id}`}
                                    className="rounded-md px-2 py-1.5 text-sm text-[var(--text-thin)] transition-colors hover:bg-white/5 hover:text-[var(--text)]"
                                >
                                    {label}
                                </a>
                            ))}
                        </nav>
                        <div className="mt-5 border-t pt-4 text-sm leading-6 text-[var(--text-thin)]">
                            API reference:
                            <div className="mt-2 grid gap-1">
                                <DocLink href={`${TYPEDOC_BASE}/classes/Svg2GPU.html`}>
                                    Svg2GPU
                                </DocLink>
                                <DocLink href={`${TYPEDOC_BASE}/classes/WebGPURenderer.html`}>
                                    WebGPURenderer
                                </DocLink>
                                <DocLink href={`${TYPEDOC_BASE}/classes/TransformParser.html`}>
                                    TransformParser
                                </DocLink>
                                <DocLink href={`${TYPEDOC_BASE}/types/GpuScene.html`}>
                                    GpuScene
                                </DocLink>
                            </div>
                        </div>
                    </div>
                </aside>

                <article className="min-w-0">
                    <header className="mb-12 max-w-4xl">
                        <p className="mb-4 text-sm font-semibold uppercase tracking-[0.14em] text-[var(--primary)]">
                            svg2gpu guide
                        </p>
                        <h1 className="mb-5 text-4xl font-semibold tracking-normal text-[var(--text)]">
                            Render SVG through WebGPU, inspect the generated scene, and keep control
                            of the rendering lifecycle.
                        </h1>
                        <p className="max-w-3xl text-lg leading-8 text-[var(--text-thin)]">
                            This guide follows the library as it exists in the source and demo: SVG
                            strings are parsed, resolved, converted to GPU geometry, then submitted
                            by a WebGPU renderer. Use the quick wrapper for application code, and use
                            the compiler output when you need diagnostics, stats, or tests.
                        </p>
                    </header>

                    <Section id="overview" eyebrow="Page 1" title="What svg2gpu is">
                        <p className="leading-8">
                            <code>svg2gpu</code> is a small SVG-to-GPU pipeline. The public
                            convenience class is{" "}
                            <DocLink href={`${TYPEDOC_BASE}/classes/Svg2GPU.html`}>Svg2GPU</DocLink>.
                            It takes an SVG string, builds a renderable scene, creates a WebGPU canvas
                            renderer, uploads buffers, and draws the result.
                        </p>
                        <p className="leading-8">
                            Internally, the path is intentionally direct:{" "}
                            <code>SVGParser.parseDocument</code> reads the SVG,{" "}
                            <code>StyleResolver.resolve</code> applies inheritance and transforms,
                            <code>GeometryBuilder.build</code> emits batches, and{" "}
                            <code>WebGPURenderer</code> draws those batches.
                        </p>
                        <CodeBlock>{`SVG string
  -> SVGParser.parseDocument(svg)
  -> StyleResolver.resolve(document.children, document.metadata)
  -> GeometryBuilder.build(resolvedScene)
  -> WebGPURenderer.setScene(scene)
  -> WebGPURenderer.render()`}</CodeBlock>
                    </Section>

                    <Section id="install" eyebrow="Page 2" title="Install and import">
                        <p className="leading-8">
                            In the demo app the package is consumed as a local file dependency, then
                            imported from <code>svg2gpu</code>. In a published package setup, the
                            import shape is the same.
                        </p>
                        <CodeBlock>{`npm install svg2gpu

import { Svg2GPU } from "svg2gpu";
import type { GpuScene } from "svg2gpu";`}</CodeBlock>
                        <p className="leading-8">
                            WebGPU requires a browser that exposes <code>navigator.gpu</code>. The
                            wrapper will reject <code>ready</code> if WebGPU is unavailable, if no
                            adapter can be found, or if a WebGPU canvas context cannot be created.
                        </p>
                    </Section>

                    <Section id="first-render" eyebrow="Page 3" title="First render">
                        <p className="leading-8">
                            Create a root element, pass its id to <code>Svg2GPU</code>, and provide
                            an SVG string. If the root is a normal element, the wrapper creates a
                            canvas inside it. If the root is already a canvas, it renders into that
                            canvas.
                        </p>
                        <CodeBlock>{`<div id="logo-preview" style={{ width: 480, height: 320 }} />

const svg = \`
<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <circle cx="50" cy="50" r="38" fill="#2e9dfe" />
  <path d="M28 54 L44 70 L74 30" fill="none" stroke="white" stroke-width="8" />
</svg>\`;

const preview = new Svg2GPU("logo-preview", {
  svg,
  antialias: true,
  background: [0.02, 0.025, 0.03, 1],
  fit: "contain",
  flattenTolerance: 0.35,
});

await preview.ready;`}</CodeBlock>
                    </Section>

                    <Section id="lifecycle" eyebrow="Page 4" title="Renderer lifecycle">
                        <p className="leading-8">
                            The wrapper exposes a compact lifecycle: <code>ready</code> for async
                            WebGPU setup, <code>update</code> for a new SVG string,{" "}
                            <code>render</code> for another draw, <code>resize</code> when the host
                            layout changes, and <code>destroy</code> when the component unmounts.
                        </p>
                        <CodeBlock>{`useEffect(() => {
  let cancelled = false;
  let instance: Svg2GPU | null = null;

  try {
    instance = new Svg2GPU(rootId, {
      svg,
      antialias: true,
      fit: "contain",
      flattenTolerance: 0.35,
    });

    instance.ready.catch((error) => {
      if (!cancelled) console.error(error);
    });
  } catch (error) {
    console.error(error);
  }

  return () => {
    cancelled = true;
    instance?.destroy();
    document.getElementById(rootId)?.replaceChildren();
  };
}, [rootId, svg]);`}</CodeBlock>
                        <p className="leading-8">
                            This is the same cleanup pattern used by the demo preview. It prevents a
                            late <code>ready</code> resolution from updating UI after the preview has
                            been replaced.
                        </p>
                    </Section>

                    <Section id="compile" eyebrow="Page 5" title="Compile without drawing">
                        <p className="leading-8">
                            Use <code>Svg2GPU.compile</code> when you want the GPU scene without
                            creating a WebGPU device. The demo uses this to measure compile cost and
                            run expectations before or alongside rendering.
                        </p>
                        <CodeBlock>{`import { Svg2GPU, type GpuScene } from "svg2gpu";

const start = performance.now();
const scene: GpuScene = Svg2GPU.compile(svg, {
  flattenTolerance: 0.35,
});

console.log("compile ms", performance.now() - start);
console.log(scene.stats);
console.log(scene.diagnostics);`}</CodeBlock>
                        <p className="leading-8">
                            The compiler path is useful in tests, build-time validation, playgrounds,
                            and dashboards that need to show vertex or batch counts before drawing.
                        </p>
                    </Section>

                    <Section id="scene" eyebrow="Page 6" title="Scene data">
                        <p className="leading-8">
                            A compiled scene contains document metadata, geometry batches,
                            diagnostics, and aggregate stats. The renderer consumes the scene, but
                            the scene is also readable application data.
                        </p>
                        <CodeBlock>{`type GpuScene = {
  metadata: SVGDocumentMetadata;
  batches: GeometryBatch[];
  diagnostics: Svg2GPUDiagnostic[];
  stats: {
    batches: number;
    vertices: number;
    indices: number;
  };
};`}</CodeBlock>
                        <p className="leading-8">
                            Each batch is grouped by primitive kind and color. In the demo checks,
                            batches are inspected for fill and stroke coverage, finite coordinates,
                            normalized alpha, and preserved colors.
                        </p>
                    </Section>

                    <Section id="options" eyebrow="Page 7" title="Options that matter">
                        <p className="leading-8">
                            The most important runtime options are rendering quality, background,
                            device pixel ratio, fitting behavior, and curve flattening.
                        </p>
                        <CodeBlock>{`new Svg2GPU("preview", {
  svg,
  antialias: true,              // enables 4x MSAA in WebGPURenderer
  background: [1, 1, 1, 0],     // RGBA floats, transparent white by default
  dpr: window.devicePixelRatio, // defaults to devicePixelRatio
  fit: "contain",              // contain | cover | stretch | none
  flattenTolerance: 0.35,       // curve approximation tolerance
});`}</CodeBlock>
                        <p className="leading-8">
                            <code>fit</code> controls the SVG viewBox-to-canvas transform.{" "}
                            <code>contain</code> preserves aspect ratio inside the canvas,{" "}
                            <code>cover</code> fills the canvas, <code>stretch</code> maps width and
                            height independently, and <code>none</code> uses SVG units directly.
                        </p>
                    </Section>

                    <Section id="transforms" eyebrow="Page 8" title="Transforms and styles">
                        <p className="leading-8">
                            The parser supports SVG primitives such as paths, circles, ellipses,
                            rectangles, polygons, polylines, lines, and groups. Group styles and
                            transforms are resolved before geometry is built, so nested SVG can be
                            authored naturally.
                        </p>
                        <CodeBlock>{`<svg viewBox="0 0 260 180" xmlns="http://www.w3.org/2000/svg">
  <g fill="#38bdf8" stroke="#e0f2fe" stroke-width="2.5" opacity="0.78">
    <rect x="22" y="28" width="56" height="44" />
    <g transform="translate(108 50) rotate(24)">
      <rect x="-26" y="-20" width="52" height="40" />
      <line x1="-42" y1="32" x2="42" y2="32" />
    </g>
  </g>
</svg>`}</CodeBlock>
                        <p className="leading-8">
                            For transform behavior, see{" "}
                            <DocLink href={`${TYPEDOC_BASE}/classes/TransformParser.html`}>
                                TransformParser
                            </DocLink>
                            . It uses the familiar SVG matrix form where a point becomes{" "}
                            <code>x&apos; = a*x + c*y + e</code> and{" "}
                            <code>y&apos; = b*x + d*y + f</code>.
                        </p>
                    </Section>

                    <Section id="demo" eyebrow="Page 9" title="Demo patterns">
                        <p className="leading-8">
                            The demo combines native SVG and WebGPU views, then samples both. The
                            WebGPU sample is just another render call, which makes it easy to measure
                            submit cost or redraw after zooming.
                        </p>
                        <CodeBlock>{`const sampleWebGpu = useCallback(() => {
  gpuInstanceRef.current?.render();
}, []);

useEffect(() => {
  if (renderStatus.kind !== "ready") return;

  const frameId = requestAnimationFrame(() => {
    const start = performance.now();
    gpuInstanceRef.current?.resize();
    gpuInstanceRef.current?.render();
    setGpuZoomRenderMs(performance.now() - start);
  });

  return () => cancelAnimationFrame(frameId);
}, [renderStatus.kind, zoom]);`}</CodeBlock>
                        <p className="leading-8">
                            The same demo uses <code>Svg2GPU.compile</code> for checks like minimum
                            batch count, minimum vertices, finite geometry, alpha range, and color
                            preservation. Those checks are a solid template for regression tests.
                        </p>
                    </Section>

                    <Section id="limits" eyebrow="Page 10" title="Limits and next steps">
                        <p className="leading-8">
                            The current renderer is intentionally focused: it turns supported SVG
                            shapes into filled and stroked triangle batches with vertex colors. Text
                            elements are reported as unsupported, and advanced paint servers such as
                            gradients or patterns should be treated as outside the stable path unless
                            implemented in the source.
                        </p>
                        <p className="leading-8">
                            For application code, start with{" "}
                            <DocLink href={`${TYPEDOC_BASE}/classes/Svg2GPU.html`}>Svg2GPU</DocLink>.
                            For custom pipelines, inspect the lower-level classes in TypeDoc:
                            <DocLink href={`${TYPEDOC_BASE}/classes/SVGParser.html`}>
                                {" "}
                                SVGParser
                            </DocLink>
                            ,{" "}
                            <DocLink href={`${TYPEDOC_BASE}/classes/StyleResolver.html`}>
                                StyleResolver
                            </DocLink>
                            ,{" "}
                            <DocLink href={`${TYPEDOC_BASE}/classes/GeometryBuilder.html`}>
                                GeometryBuilder
                            </DocLink>
                            , and{" "}
                            <DocLink href={`${TYPEDOC_BASE}/classes/WebGPURenderer.html`}>
                                WebGPURenderer
                            </DocLink>
                            .
                        </p>
                        <CodeBlock>{`// Practical checklist
// 1. Validate or sanitize SVG input before rendering user-provided content.
// 2. Await instance.ready before relying on GPU output.
// 3. Call resize() after host layout changes.
// 4. Call destroy() on unmount.
// 5. Use compile() in tests to lock down scene stats and diagnostics.`}</CodeBlock>
                    </Section>
                </article>
            </div>
        </main>
    );
}
