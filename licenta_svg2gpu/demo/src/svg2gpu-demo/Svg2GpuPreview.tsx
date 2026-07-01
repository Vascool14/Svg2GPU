import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react"
import { Svg2GPU } from "svg2gpu"
import type { SvgDemoFixture } from "./svgFixtures"
import { measureCompileFixture, runCompileChecks, summarizeChecks } from "./demoChecks"

type RenderStatus =
  | { kind: "pending"; message: string }
  | { kind: "ready"; message: string }
  | { kind: "error"; message: string }

type FrameMetrics = {
  fps: number
  avgMs: number
  worstMs: number
  samples: number
}

type Svg2GpuPreviewProps = {
  fixture: SvgDemoFixture
}

const EMPTY_METRICS: FrameMetrics = {
  fps: 0,
  avgMs: 0,
  worstMs: 0,
  samples: 0,
}

const FRAME_WINDOW_SIZE = 90

function formatMs(value: number): string {
  return `${value.toFixed(value >= 10 ? 1 : 2)} ms`
}

function formatFps(value: number): string {
  return value > 0 ? value.toFixed(1) : "--"
}

function clampZoom(value: number): number {
  return Math.min(8, Math.max(1, Number(value.toFixed(1))))
}

function useRollingFrameMetrics(enabled: boolean, sample: () => void): FrameMetrics {
  const [metrics, setMetrics] = useState<FrameMetrics>(EMPTY_METRICS)

  useEffect(() => {
    if (!enabled) return

    let frameId = 0
    let previousFrame = performance.now()
    let lastPublish = previousFrame
    const frameDeltas: number[] = []
    const sampleCosts: number[] = []

    const tick = (now: number) => {
      const sampleStart = performance.now()
      sample()
      const sampleMs = performance.now() - sampleStart
      const frameDelta = now - previousFrame

      previousFrame = now
      if (frameDelta > 0) frameDeltas.push(frameDelta)
      sampleCosts.push(sampleMs)

      if (frameDeltas.length > FRAME_WINDOW_SIZE) frameDeltas.shift()
      if (sampleCosts.length > FRAME_WINDOW_SIZE) sampleCosts.shift()

      const elapsed = now - lastPublish
      if (elapsed >= 500 && frameDeltas.length > 0) {
        const totalFrameMs = frameDeltas.reduce((sum, value) => sum + value, 0)
        const totalSampleMs = sampleCosts.reduce((sum, value) => sum + value, 0)
        setMetrics({
          fps: (frameDeltas.length * 1000) / totalFrameMs,
          avgMs: totalSampleMs / Math.max(1, sampleCosts.length),
          worstMs: Math.max(...sampleCosts),
          samples: sampleCosts.length,
        })
        lastPublish = now
      }

      frameId = requestAnimationFrame(tick)
    }

    frameId = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(frameId)
    }
  }, [enabled, sample])

  return metrics
}

function StatusPill({ passed }: { passed: boolean }) {
  return (
    <span
      className={`rounded px-2 py-1 text-xs font-semibold ${
        passed ? "bg-emerald-500/15 text-emerald-200" : "bg-rose-500/15 text-rose-200"
      }`}
    >
      {passed ? "PASS" : "FAIL"}
    </span>
  )
}

function MetricTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-md bg-white/[0.04] px-2 py-1.5">
      <div className="truncate text-[0.68rem] uppercase tracking-[0.08em] text-white/38">{label}</div>
      <div className="mt-0.5 truncate text-sm font-semibold text-white">{value}</div>
    </div>
  )
}

function PaneToggle({
  enabled,
  disabled,
  label,
  onChange,
}: {
  enabled: boolean
  disabled?: boolean
  label: string
  onChange: (enabled: boolean) => void
}) {
  return (
    <label className="inline-flex items-center gap-2 rounded-md bg-white/[0.04] px-2.5 py-1.5 text-xs font-semibold text-white/70">
      <input
        type="checkbox"
        checked={enabled}
        disabled={disabled}
        onChange={event => onChange(event.currentTarget.checked)}
        className="h-3.5 w-3.5 accent-sky-400 disabled:opacity-50"
      />
      <span>{label}</span>
    </label>
  )
}

function PausedPane({ label }: { label: string }) {
  return (
    <div className="absolute inset-0 grid place-items-center bg-[#030507] px-6 text-center text-sm font-medium text-white/45">
      {label}
    </div>
  )
}

function PaneMetrics({
  enabled,
  metrics,
  costLabel,
  extraLabel,
  extraValue,
}: {
  enabled: boolean
  metrics: FrameMetrics
  costLabel: string
  extraLabel: string
  extraValue: string
}) {
  return (
    <div className="grid grid-cols-2 gap-2">
      <MetricTile label="FPS" value={enabled ? formatFps(metrics.fps) : "Paused"} />
      <MetricTile label={costLabel} value={metrics.samples > 0 ? formatMs(metrics.avgMs) : "--"} />
      <MetricTile label="Worst" value={metrics.samples > 0 ? formatMs(metrics.worstMs) : "--"} />
      <MetricTile label={extraLabel} value={extraValue} />
    </div>
  )
}

export default function Svg2GpuPreview({ fixture }: Svg2GpuPreviewProps) {
  const reactId = useId()
  const rootId = useMemo(
    () => `svg2gpu-demo-${reactId.replace(/\W+/g, "-")}`,
    [reactId],
  )
  const nativeSvgHostRef = useRef<HTMLDivElement | null>(null)
  const gpuInstanceRef = useRef<Svg2GPU | null>(null)
  const [zoom, setZoom] = useState(1)
  const [nativeEnabled, setNativeEnabled] = useState(true)
  const [gpuEnabled, setGpuEnabled] = useState(true)
  const [gpuZoomRenderMs, setGpuZoomRenderMs] = useState<number | null>(null)
  const [renderStatus, setRenderStatus] = useState<RenderStatus>({
    kind: "pending",
    message: "WebGPU renderer has not started yet.",
  })

  const compileResult = useMemo(() => measureCompileFixture(fixture), [fixture])
  const { scene } = compileResult
  const checks = useMemo(() => runCompileChecks(fixture, scene), [fixture, scene])
  const allChecksPassed = checks.every(check => check.passed)
  const zoomStyle = useMemo(
    () => ({
      width: `${zoom * 100}%`,
      height: `${zoom * 100}%`,
    }),
    [zoom],
  )

  const sampleNativeSvg = useCallback(() => {
    const svg = nativeSvgHostRef.current?.querySelector("svg")
    if (!svg) return

    svg.getBoundingClientRect()

    if ("getBBox" in svg) {
      try {
        ;(svg as SVGGraphicsElement).getBBox()
      } catch {
        // getBBox can throw while an SVG subtree is mid-layout.
      }
    }
  }, [])

  const sampleWebGpu = useCallback(() => {
    gpuInstanceRef.current?.render()
  }, [])

  const nativeMetrics = useRollingFrameMetrics(nativeEnabled, sampleNativeSvg)
  const gpuMetrics = useRollingFrameMetrics(
    gpuEnabled && renderStatus.kind === "ready",
    sampleWebGpu,
  )

  useEffect(() => {
    let cancelled = false
    let instance: Svg2GPU | null = null
    setRenderStatus({
      kind: "pending",
      message: "WebGPU renderer is starting.",
    })

    const publishStatus = (status: RenderStatus) => {
      queueMicrotask(() => {
        if (!cancelled) setRenderStatus(status)
      })
    }

    try {
      instance = new Svg2GPU(rootId, {
        svg: fixture.svg,
        antialias: true,
        background: [0.015, 0.018, 0.024, 1],
        fit: "contain",
        flattenTolerance: 0.35,
      })
      gpuInstanceRef.current = instance

      instance.ready
        .then(() => {
          if (cancelled) return
          setRenderStatus({
            kind: "ready",
            message: "Rendered through Svg2GPU WebGPU.",
          })
        })
        .catch((error: unknown) => {
          if (cancelled) return
          setRenderStatus({
            kind: "error",
            message: error instanceof Error ? error.message : "WebGPU rendering failed.",
          })
        })
    } catch (error) {
      publishStatus({
        kind: "error",
        message: error instanceof Error ? error.message : "WebGPU rendering failed.",
      })
    }

    return () => {
      cancelled = true
      if (gpuInstanceRef.current === instance) gpuInstanceRef.current = null
      instance?.destroy()
      const root = document.getElementById(rootId)
      if (root) root.innerHTML = ""
    }
  }, [fixture, rootId])

  useEffect(() => {
    if (renderStatus.kind !== "ready" || !gpuEnabled) return

    const frameId = requestAnimationFrame(() => {
      const start = performance.now()
      gpuInstanceRef.current?.resize()
      gpuInstanceRef.current?.render()
      setGpuZoomRenderMs(performance.now() - start)
    })

    return () => cancelAnimationFrame(frameId)
  }, [gpuEnabled, renderStatus.kind, zoom])

  return (
    <article className="flex min-w-0 w-full flex-col gap-4" data-demo-status={allChecksPassed ? "pass" : "fail"}>
      <header className="flex flex-col gap-3 border-b border-white/10 pb-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-normal text-white">{fixture.title}</h1>
            <p className="mt-1 max-w-3xl text-sm leading-6 text-white/62">{fixture.description}</p>
            {fixture.source ? (
              <a
                href={fixture.source.url}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-flex text-xs text-sky-200/80 underline-offset-4 hover:text-sky-100 hover:underline"
              >
                {fixture.source.name} ({fixture.source.license})
              </a>
            ) : null}
          </div>
          <div className="rounded-md border border-white/10 bg-black/25 px-3 py-2 text-sm text-white/75">
            {summarizeChecks(checks)}
          </div>
        </div>

        <label className="grid gap-2 rounded-lg border border-white/10 bg-black/20 px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <span className="text-sm font-semibold uppercase tracking-[0.1em] text-white/65">
              Synchronized Zoom
            </span>
            <span className="rounded bg-white/10 px-2 py-1 text-sm font-semibold text-white">
              {zoom.toFixed(1)}x
            </span>
          </div>
          <input
            type="range"
            min="1"
            max="8"
            step="0.1"
            value={zoom}
            onChange={event => setZoom(Number(event.currentTarget.value))}
            onKeyDown={event => {
              if (event.key === "ArrowRight" || event.key === "ArrowUp") {
                event.preventDefault()
                setZoom(current => clampZoom(current + 0.1))
              }
              if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
                event.preventDefault()
                setZoom(current => clampZoom(current - 0.1))
              }
              if (event.key === "Home") {
                event.preventDefault()
                setZoom(1)
              }
              if (event.key === "End") {
                event.preventDefault()
                setZoom(8)
              }
            }}
            className="h-2 w-full accent-sky-400"
            aria-label="Synchronized zoom"
          />
        </label>
      </header>

      <div className="grid min-h-[30rem] min-w-0 grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <section className="flex min-h-[28rem] min-w-0 flex-col overflow-hidden rounded-lg border border-white/10 bg-black/25">
          <div className="grid gap-3 border-b border-white/10 px-4 py-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-[0.1em] text-white/70">Native SVG</h2>
              <PaneToggle
                enabled={nativeEnabled}
                label="Measure"
                onChange={setNativeEnabled}
              />
            </div>
            <PaneMetrics
              enabled={nativeEnabled}
              metrics={nativeMetrics}
              costLabel="Rolling cost"
              extraLabel="Zoom"
              extraValue={`${zoom.toFixed(1)}x`}
            />
          </div>
          <div className="relative min-h-[24rem] flex-1 overflow-auto bg-[#030507]">
            <div className="relative min-h-full min-w-full" style={zoomStyle}>
              {nativeEnabled ? (
                <div
                  ref={nativeSvgHostRef}
                  className="absolute inset-0 [&_svg]:h-full [&_svg]:w-full [&_svg]:max-w-none"
                  dangerouslySetInnerHTML={{ __html: fixture.svg }}
                />
              ) : null}
            </div>
            {!nativeEnabled ? <PausedPane label="Native SVG paused" /> : null}
          </div>
        </section>

        <section className="flex min-h-[28rem] min-w-0 flex-col overflow-hidden rounded-lg border border-white/10 bg-black/25">
          <div className="grid gap-3 border-b border-white/10 px-4 py-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-[0.1em] text-white/70">Svg2GPU</h2>
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs ${
                    renderStatus.kind === "ready"
                      ? "text-emerald-300"
                      : renderStatus.kind === "error"
                        ? "text-rose-300"
                        : "text-white/45"
                  }`}
                >
                  {renderStatus.kind}
                </span>
                <PaneToggle
                  enabled={gpuEnabled}
                  disabled={renderStatus.kind === "error"}
                  label="Render"
                  onChange={setGpuEnabled}
                />
              </div>
            </div>
            <PaneMetrics
              enabled={gpuEnabled && renderStatus.kind === "ready"}
              metrics={gpuMetrics}
              costLabel="Rolling submit"
              extraLabel="Zoom redraw"
              extraValue={gpuZoomRenderMs === null ? "--" : formatMs(gpuZoomRenderMs)}
            />
          </div>
          <div className="relative min-h-[24rem] flex-1 overflow-auto bg-[#030507]">
            <div className="relative min-h-full min-w-full" style={zoomStyle}>
              <div id={rootId} className="absolute inset-0" />
            </div>
            {renderStatus.kind === "ready" && !gpuEnabled ? (
              <PausedPane label="WebGPU redraw paused" />
            ) : null}
            {renderStatus.kind === "error" ? (
              <div className="absolute inset-0 grid place-items-center px-6 text-center text-sm leading-6 text-rose-200">
                {renderStatus.message}
              </div>
            ) : null}
          </div>
        </section>
      </div>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
        <div className="rounded-lg border border-white/10 bg-black/20 p-4">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.1em] text-white/70">Scene Stats</h2>
          <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div>
              <dt className="text-xs text-white/45">Batches</dt>
              <dd className="mt-1 text-2xl font-semibold text-white">{scene.stats.batches}</dd>
            </div>
            <div>
              <dt className="text-xs text-white/45">Vertices</dt>
              <dd className="mt-1 text-2xl font-semibold text-white">{scene.stats.vertices}</dd>
            </div>
            <div>
              <dt className="text-xs text-white/45">Indices</dt>
              <dd className="mt-1 text-2xl font-semibold text-white">{scene.stats.indices}</dd>
            </div>
            <div>
              <dt className="text-xs text-white/45">Compile</dt>
              <dd className="mt-1 text-2xl font-semibold text-white">{formatMs(compileResult.durationMs)}</dd>
            </div>
          </dl>
        </div>

        <div className="rounded-lg border border-white/10 bg-black/20 p-4">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.1em] text-white/70">Demo Checks</h2>
          <div className="grid gap-2">
            {checks.map(check => (
              <div
                key={check.label}
                className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3 rounded-md bg-white/[0.035] px-3 py-2"
              >
                <StatusPill passed={check.passed} />
                <div>
                  <div className="text-sm font-medium text-white">{check.label}</div>
                  <div className="text-xs leading-5 text-white/50">{check.detail}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </article>
  )
}
