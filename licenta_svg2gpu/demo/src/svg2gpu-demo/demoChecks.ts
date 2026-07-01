import { Logger, Svg2GPU, type GpuScene } from "svg2gpu"
import type { SvgDemoFixture } from "./svgFixtures"

Logger.SHOW_DEBUG = false
Logger.SHOW_INFO = false

export type DemoCheck = {
  label: string
  passed: boolean
  detail: string
}

export type MeasuredCompileResult = {
  scene: GpuScene
  durationMs: number
}

export function compileFixture(fixture: SvgDemoFixture): GpuScene {
  return Svg2GPU.compile(fixture.svg, { flattenTolerance: 0.35 })
}

export function measureCompileFixture(fixture: SvgDemoFixture): MeasuredCompileResult {
  const start = performance.now()
  const scene = compileFixture(fixture)

  return {
    scene,
    durationMs: performance.now() - start,
  }
}

export function runCompileChecks(fixture: SvgDemoFixture, scene: GpuScene): DemoCheck[] {
  const fillBatches = scene.batches.filter(batch => batch.kind === "fill").length
  const strokeBatches = scene.batches.filter(batch => batch.kind === "stroke").length
  const alphaOk = scene.batches.every(batch => {
    const alpha = batch.color[3] ?? 1
    return alpha >= 0 && alpha <= 1
  })
  const finiteGeometry = scene.batches.every(batch =>
    Array.from(batch.vertices).every(Number.isFinite),
  )
  const uniqueColors = new Set(
    scene.batches.map(batch => batch.color.map(value => value.toFixed(4)).join(",")),
  )

  return [
    {
      label: "compile produces batches",
      passed: scene.stats.batches >= fixture.expected.minBatches,
      detail: `${scene.stats.batches} batches, expected >= ${fixture.expected.minBatches}`,
    },
    {
      label: "vertex budget is non-empty",
      passed: scene.stats.vertices >= fixture.expected.minVertices,
      detail: `${scene.stats.vertices} vertices, expected >= ${fixture.expected.minVertices}`,
    },
    {
      label: "index budget is non-empty",
      passed: scene.stats.indices >= fixture.expected.minIndices,
      detail: `${scene.stats.indices} indices, expected >= ${fixture.expected.minIndices}`,
    },
    {
      label: "fill and stroke paths exist",
      passed: fillBatches > 0 && strokeBatches > 0,
      detail: `${fillBatches} fill batches, ${strokeBatches} stroke batches`,
    },
    {
      label: "geometry is finite",
      passed: finiteGeometry,
      detail: finiteGeometry ? "all emitted coordinates are finite" : "found NaN/Infinity",
    },
    {
      label: "alpha is normalized",
      passed: alphaOk,
      detail: alphaOk ? "all batch alpha values are in [0, 1]" : "found out-of-range alpha",
    },
    {
      label: "batch colors are preserved",
      passed: uniqueColors.size > 1,
      detail: `${uniqueColors.size} unique batch colors`,
    },
  ]
}

export function summarizeChecks(checks: DemoCheck[]) {
  const passed = checks.filter(check => check.passed).length
  return `${passed}/${checks.length} checks passed`
}
