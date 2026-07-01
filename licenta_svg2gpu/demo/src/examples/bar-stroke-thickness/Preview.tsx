export default function BarStrokeThicknessPreview() {
  const bars = [
    { height: 100, strokeWidth: 1 },
    { height: 170, strokeWidth: 3 },
    { height: 130, strokeWidth: 6 },
    { height: 210, strokeWidth: 9 },
  ]

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
      <p className="text-sm text-white/70">Bar preview with varying stroke thickness.</p>

      <div className="rounded-lg bg-black/25 p-4 sm:p-6">
        <svg viewBox="0 0 560 280" className="h-auto w-full" role="img" aria-label="Bar stroke thickness preview">
          <line x1="40" y1="20" x2="40" y2="240" stroke="rgba(255,255,255,0.25)" strokeWidth="2" />
          <line x1="40" y1="240" x2="530" y2="240" stroke="rgba(255,255,255,0.25)" strokeWidth="2" />

          {bars.map((bar, index) => {
            const x = 70 + index * 110
            const y = 240 - bar.height

            return (
              <rect
                key={x}
                x={x}
                y={y}
                width="58"
                height={bar.height}
                rx="6"
                fill="rgba(46,157,254,0.2)"
                stroke="#2e9dfe"
                strokeWidth={bar.strokeWidth}
              />
            )
          })}
        </svg>
      </div>
    </div>
  )
}
