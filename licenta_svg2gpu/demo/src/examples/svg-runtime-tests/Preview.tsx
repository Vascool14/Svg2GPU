import { ALL_SVG_FIXTURES } from "../../svg2gpu-demo/svgFixtures"
import { compileFixture, runCompileChecks } from "../../svg2gpu-demo/demoChecks"

export default function SvgRuntimeTestsPreview() {
  const results = ALL_SVG_FIXTURES.map(fixture => {
    const scene = compileFixture(fixture)
    const checks = runCompileChecks(fixture, scene)
    const passed = checks.every(check => check.passed)

    return {
      fixture,
      scene,
      checks,
      passed,
    }
  })
  const passedCount = results.filter(result => result.passed).length

  return (
    <article className="flex w-full flex-col gap-4" data-demo-status={passedCount === results.length ? "pass" : "fail"}>
      <header className="border-b border-white/10 pb-4">
        <h1 className="text-2xl font-semibold tracking-normal text-white">Runtime Compile Tests</h1>
        <p className="mt-1 max-w-3xl text-sm leading-6 text-white/62">
          Browser-side smoke checks for the parser, resolver, normalizer, tessellator, and batch builder.
        </p>
      </header>

      <section className="rounded-lg border border-white/10 bg-black/20 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-sm font-semibold uppercase tracking-[0.1em] text-white/70">
            Test Matrix
          </h2>
          <span className="rounded-md bg-white/10 px-3 py-2 text-sm text-white/75">
            {passedCount}/{results.length} fixtures passed
          </span>
        </div>

        <div className="mt-4 grid gap-3">
          {results.map(result => (
            <div key={result.fixture.title} className="rounded-lg border border-white/10 bg-white/[0.035] p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="text-base font-semibold text-white">{result.fixture.title}</h3>
                  <p className="mt-1 text-sm leading-6 text-white/55">{result.fixture.description}</p>
                </div>
                <span
                  className={`rounded px-2 py-1 text-xs font-semibold ${
                    result.passed ? "bg-emerald-500/15 text-emerald-200" : "bg-rose-500/15 text-rose-200"
                  }`}
                >
                  {result.passed ? "PASS" : "FAIL"}
                </span>
              </div>

              <dl className="mt-4 grid grid-cols-3 gap-3 border-y border-white/10 py-3">
                <div>
                  <dt className="text-xs text-white/40">Batches</dt>
                  <dd className="text-lg font-semibold text-white">{result.scene.stats.batches}</dd>
                </div>
                <div>
                  <dt className="text-xs text-white/40">Vertices</dt>
                  <dd className="text-lg font-semibold text-white">{result.scene.stats.vertices}</dd>
                </div>
                <div>
                  <dt className="text-xs text-white/40">Indices</dt>
                  <dd className="text-lg font-semibold text-white">{result.scene.stats.indices}</dd>
                </div>
              </dl>

              <ul className="mt-3 grid gap-2">
                {result.checks.map(check => (
                  <li key={check.label} className="flex items-center justify-between gap-3 text-sm">
                    <span className="text-white/70">{check.label}</span>
                    <span className={check.passed ? "text-emerald-300" : "text-rose-300"}>
                      {check.passed ? "pass" : "fail"}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </article>
  )
}
