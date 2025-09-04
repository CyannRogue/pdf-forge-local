export function CategoryTabs({
  categories,
  active,
  onChange,
}: {
  categories: string[]
  active: string
  onChange: (c: string) => void
}) {
  return (
    <div className="flex flex-wrap gap-2" role="tablist" aria-label="Tool categories">
      {categories.map((c) => (
        <button
          key={c}
          role="tab"
          aria-selected={active === c}
          className={`px-4 py-2 rounded-full focus-ring shadow-sm transition-colors ${
            active === c
              ? 'bg-[var(--accent)] text-[var(--accent-fg)]'
              : 'bg-[#0f1115] text-slate-200 border border-[#2a3142] hover:border-slate-500'
          }`}
          onClick={() => onChange(c)}
        >
          {c}
        </button>
      ))}
    </div>
  )
}
