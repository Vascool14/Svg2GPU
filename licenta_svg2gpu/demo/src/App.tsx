import { useMemo, useState } from "react"
import { EXAMPLE_COMPONENTS, ALL_EXAMPLES, type TExample } from "./ALL_EAXMPLES"

type TCategory = Extract<TExample, { categoryName: string }>
type TLeaf = Extract<TExample, { name: string; path: string }>

function isCategory(node: TExample): node is TCategory {
  return "categoryName" in node
}

function collectLeafExamples(nodes: TExample[]): TLeaf[] {
  return nodes.flatMap(node => (isCategory(node) ? collectLeafExamples(node.examples) : [node]))
}

function collectCategoryIds(nodes: TExample[], pathPrefix = "root"): string[] {
  const ids: string[] = []

  nodes.forEach((node, index) => {
    const nodeId = `${pathPrefix}-${index}`

    if (!isCategory(node)) {
      return
    }

    ids.push(nodeId)
    ids.push(...collectCategoryIds(node.examples, nodeId))
  })

  return ids
}

export default function App() {
  const leafExamples = useMemo(() => collectLeafExamples(ALL_EXAMPLES), [])
  const [activePath, setActivePath] = useState<string>("svg-basic-geometry")
  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(
    () => new Set(collectCategoryIds(ALL_EXAMPLES)),
  )

  const activeExample = leafExamples.find(example => example.path === activePath) ?? leafExamples[0]
  const ActivePreview = activeExample ? EXAMPLE_COMPONENTS[activeExample.path] : undefined

  function toggleMenu(menuId: string) {
    setExpandedMenus(prev => {
      const next = new Set(prev)

      if (next.has(menuId)) {
        next.delete(menuId)
      } else {
        next.add(menuId)
      }

      return next
    })
  }

  function renderSidebarItem(node: TExample, level: number, nodeId: string) {
    const marginLeft = `${level * 1.15}rem`

    if (isCategory(node)) {
      const isExpanded = expandedMenus.has(nodeId)

      return (
        <div key={nodeId}>
          <button
            type="button"
            className="flex w-full items-center justify-between rounded-md px-3 py-2 text-left transition-colors"
            onClick={() => toggleMenu(nodeId)}
            style={{ marginLeft }}
          >
            <span className="text-[0.98rem] font-semibold uppercase tracking-[0.1em] text-white/65">
              {node.categoryName}
            </span>
            <span
              className={`text-[16px] leading-none text-white/55 transition-transform duration-200 ${
                isExpanded ? "rotate-90 text-white/95" : ""
              }`}
              aria-hidden="true"
            >
              &#9656;
            </span>
          </button>

          <div
            className={`overflow-hidden transition-all duration-200 ${
              isExpanded ? "max-h-[40rem]" : "max-h-0"
            }`}
          >
            {node.examples.map((child, index) =>
              renderSidebarItem(child, level + 1, `${nodeId}-${index}`),
            )}
          </div>
        </div>
      )
    }

    const isActive = activePath === node.path

    return (
      <button
        key={nodeId}
        type="button"
        className={`mt-1 w-full rounded-md px-3 py-2 text-left text-[1.02rem] leading-5 transition-colors ${
          isActive
            ? "text-white"
            : "text-white/70  hover:text-white"
        }`}
        onClick={() => setActivePath(node.path)}
        style={{ marginLeft }}
      >
        <span>{node.name}</span>
      </button>
    )
  }

  return (
    <main className="min-h-dvh w-full p-3 sm:p-4 lg:p-6">
      <div className="grid min-h-[calc(100dvh-1.5rem)] grid-cols-1 gap-3 lg:min-h-[calc(100dvh-3rem)] lg:grid-cols-[clamp(15rem,22vw,18.5rem)_minmax(0,1fr)] lg:gap-5">
        <aside
          className="max-h-[42dvh] overflow-auto pr-1 lg:sticky lg:top-0 lg:max-h-[calc(100dvh-3rem)]"
          aria-label="Example list"
        >
          <div className="flex flex-col gap-0.5">
            {ALL_EXAMPLES.map((node, index) => renderSidebarItem(node, 0, `root-${index}`))}
          </div>
        </aside>

        <section className="flex min-h-[22rem] flex-col rounded-xl p-4 pt-0! sm:p-5">
          {/* <header className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h1 className="m-0 text-xl font-semibold text-[var(--text)] sm:text-2xl">
                {activeExample?.name ?? "Preview"}
              </h1>
              <p className="mt-1 text-sm text-[var(--text-thin)]">
                {activeExample?.path ?? "Select an example from the sidebar."}
              </p>
            </div>
            <span className="rounded-md border border-white/10 px-3 py-2 text-xs uppercase tracking-[0.1em] text-white/50">
              Svg2GPU Demo Lab
            </span>
          </header> */}

          <div className="flex min-h-[18rem] flex-1 items-stretch rounded-lg p-3 sm:p-4">
            {ActivePreview ? (
              <ActivePreview />
            ) : (
              <p className="m-auto text-sm text-[var(--text-thin)]">
                No preview component found for this example path.
              </p>
            )}
          </div>
        </section>
      </div>
    </main>
  )
}
