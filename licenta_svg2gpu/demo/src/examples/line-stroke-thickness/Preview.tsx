export default function LineStrokeThicknessPreview() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
      <p className="text-sm text-white/70">Line preview with multiple stroke widths.</p>

      <div className="rounded-lg bg-black/25 p-4 sm:p-6">
        <svg viewBox="0 0 560 280" className="h-auto w-full" role="img" aria-label="Line stroke thickness preview">
          <line x1="40" y1="40" x2="530" y2="40" stroke="#2e9dfe" strokeWidth="2" strokeLinecap="round" />
          <line x1="40" y1="120" x2="530" y2="120" stroke="#2e9dfe" strokeWidth="6" strokeLinecap="round" />
          <line x1="40" y1="210" x2="530" y2="210" stroke="#2e9dfe" strokeWidth="12" strokeLinecap="round" />

          <text x="40" y="30" fill="rgba(255,255,255,0.75)" fontSize="14">2px</text>
          <text x="40" y="110" fill="rgba(255,255,255,0.75)" fontSize="14">6px</text>
          <text x="40" y="200" fill="rgba(255,255,255,0.75)" fontSize="14">12px</text>
        </svg>
      </div>
    </div>
  )
}
