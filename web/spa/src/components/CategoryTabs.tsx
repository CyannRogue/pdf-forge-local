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
          className={`px-3 py-1.5 rounded-full border focus-ring ${
            active === c ? 'bg-[var(--accent)] text-[var(--accent-fg)] border-transparent' : 'border-[#2a3142]'
          }`}
          onClick={() => onChange(c)}
        >
          {c}
        </button>
      ))}
    </div>
  )
}

