export default function BarSimplePreview() {
  const bars = [90, 150, 120, 200, 170]

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
      <div className="rounded-lg bg-black/25 p-4 sm:p-6">
        <svg viewBox="0 0 560 280" className="h-auto w-full" role="img" aria-label="Simple bar chart preview">
          <line x1="40" y1="20" x2="40" y2="240" stroke="rgba(255,255,255,0.25)" strokeWidth="2" />
          <line x1="40" y1="240" x2="530" y2="240" stroke="rgba(255,255,255,0.25)" strokeWidth="2" />

          {bars.map((height, index) => {
            const x = 70 + index * 90
            const y = 240 - height

            return <rect key={x} x={x} y={y} width="52" height={height} rx="6" fill="#2e9dfe" />
          })}
        </svg>
      </div>
    </div>
  )
}
