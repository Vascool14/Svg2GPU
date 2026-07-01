export default function LineSimplePreview() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">

      <div className="rounded-lg bg-black/25 p-4 sm:p-6">
        <svg viewBox="0 0 560 280" className="h-auto w-full" role="img" aria-label="Line chart preview">
          <line x1="40" y1="20" x2="40" y2="240" stroke="rgba(255,255,255,0.25)" strokeWidth="2" />
          <line x1="40" y1="240" x2="530" y2="240" stroke="rgba(255,255,255,0.25)" strokeWidth="2" />

          <polyline
            points="40,220 110,190 180,170 250,145 320,115 390,140 460,100 530,70"
            fill="none"
            stroke="#2e9dfe"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          <circle cx="530" cy="70" r="6" fill="#2e9dfe" />
        </svg>
      </div>
    </div>
  )
}
