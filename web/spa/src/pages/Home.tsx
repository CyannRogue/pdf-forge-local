import { useMemo, useState } from 'react'
import { CATEGORIES, TOOLS, type Tool } from '../data/tools'
import { CategoryTabs } from '../components/CategoryTabs'
import { ToolCard } from '../components/ToolCard'

function track(event: string, detail?: Record<string, unknown>) {
  // simple analytics hook (console)
  // eslint-disable-next-line no-console
  console.log('[analytics]', event, detail || {})
}

export default function Home() {
  const [q, setQ] = useState('')
  const [cat, setCat] = useState('All')

  const filtered = useMemo(() => {
    const list = TOOLS.filter((t) => cat === 'All' || t.categories.includes(cat))
    if (!q.trim()) return list
    const s = q.toLowerCase()
    return list.filter((t) => t.title.toLowerCase().includes(s) || t.desc.toLowerCase().includes(s))
  }, [q, cat])

  const onOpen = (t: Tool) => {
    track('open_tool', { id: t.id })
    window.location.assign(t.launch.path)
  }

  return (
    <div className="min-h-screen">
      <header className="px-6 py-5 border-b border-[#2a3142]">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="font-semibold">PDF Forge</div>
          <nav className="text-sm flex items-center gap-4 text-slate-300">
            <a className="focus-ring" href="/ui">Workbench</a>
            <a className="focus-ring" href="/docs">Docs</a>
            <a className="focus-ring" href="/docs/USAGE.md">Usage</a>
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <section className="mb-8">
          <h1 className="text-3xl font-bold">All PDF tools in one place</h1>
          <p className="text-slate-300 mt-2">Organize, convert, compress, secure, and edit your PDFs locally.</p>
          <div className="mt-4">
            <label htmlFor="search" className="sr-only">Search tools</label>
            <input id="search" value={q} onChange={(e) => { setQ(e.target.value); track('search', { q: e.target.value }) }}
              placeholder="Search tools..." className="w-full max-w-xl px-3 py-2 rounded-md bg-[#0f1115] border border-[#2a3142] focus-ring" />
          </div>
        </section>

        <section className="mb-6">
          <CategoryTabs categories={CATEGORIES} active={cat} onChange={(c) => { setCat(c); track('filter_category', { c }) }} />
        </section>

        <section className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {filtered.map((t) => (
            <ToolCard key={t.id} tool={t} onOpen={onOpen} />
          ))}
        </section>

        <section className="mt-12 grid gap-4 grid-cols-1 md:grid-cols-2">
          <div className="rounded-xl p-6 bg-[#161a22] border border-[#2a3142]">
            <h3 className="text-lg font-semibold">Desktop</h3>
            <p className="text-sm text-slate-300 mt-1">Run everything locally with Docker or your workstation Python.</p>
            <a className="inline-block mt-3 px-3 py-2 rounded-md bg-[var(--accent)] text-[var(--accent-fg)]" href="/docs/USAGE.md">Get started</a>
          </div>
          <div className="rounded-xl p-6 bg-[#161a22] border border-[#2a3142]">
            <h3 className="text-lg font-semibold">Mobile</h3>
            <p className="text-sm text-slate-300 mt-1">Use the lightweight Workbench from your phone’s browser.</p>
            <a className="inline-block mt-3 px-3 py-2 rounded-md bg-[var(--accent)] text-[var(--accent-fg)]" href="/ui">Open Workbench</a>
          </div>
        </section>
      </main>

      <footer className="mt-16 px-6 py-10 border-t border-[#2a3142] text-sm text-slate-300">
        <div className="max-w-6xl mx-auto grid gap-6 grid-cols-2 md:grid-cols-4">
          <div>
            <div className="font-semibold text-white">Product</div>
            <ul className="mt-2 space-y-1">
              <li><a className="focus-ring" href="/ui">Workbench</a></li>
              <li><a className="focus-ring" href="/ui/home/">Home</a></li>
            </ul>
          </div>
          <div>
            <div className="font-semibold text-white">Resources</div>
            <ul className="mt-2 space-y-1">
              <li><a className="focus-ring" href="/docs">API Docs</a></li>
              <li><a className="focus-ring" href="/docs/USAGE.md">Usage</a></li>
              <li><a className="focus-ring" href="/docs/FRONTEND.md">Frontend</a></li>
            </ul>
          </div>
          <div>
            <div className="font-semibold text-white">Solutions</div>
            <ul className="mt-2 space-y-1">
              <li><a className="focus-ring" href="/docs/SECURITY.md">Security</a></li>
              <li><a className="focus-ring" href="/docs/TROUBLESHOOTING.md">Troubleshooting</a></li>
            </ul>
          </div>
          <div>
            <div className="font-semibold text-white">Company</div>
            <ul className="mt-2 space-y-1">
              <li><a className="focus-ring" href="#">About</a></li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  )
}

