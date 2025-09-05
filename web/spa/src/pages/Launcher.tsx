import { useState } from 'react'
import { Link } from 'react-router-dom'

function Card({ title, desc, to }: { title: string; desc: string; to: string }) {
  return (
    <Link to={to} className="bg-[#161a22] border border-[#2a3142] rounded-2xl p-5 block hover:border-slate-500 focus-ring">
      <div className="font-semibold text-white text-lg">{title}</div>
      <div className="text-sm text-slate-300 mt-1">{desc}</div>
      <div className="mt-4 inline-block px-3 py-2 rounded-md bg-[var(--accent)] text-[var(--accent-fg)]">Open</div>
    </Link>
  )
}

export default function Launcher() {
  return (
    <div>
      <header className="px-6 py-5 border-b border-[#2a3142]">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="font-semibold">PDF Forge</div>
          <nav className="text-sm flex items-center gap-4 text-slate-300">
            <a href="/docs" className="focus-ring">Docs</a>
            <a href="/ui" className="focus-ring">Legacy Workbench</a>
          </nav>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-6 py-8">
        <section className="mb-8 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold">Every tool you need to work with PDFs in one place</h1>
          <p className="text-slate-300 mt-3 max-w-3xl mx-auto">Clean, visual, button‑driven tools. Drag‑and‑drop files and go.</p>
        </section>
        <section className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
          <Card title="Merge PDFs" desc="Combine PDFs in any order" to="/organizer" />
          <Card title="Organize Pages" desc="Reorder, delete, rotate pages" to="/organizer" />
          <Card title="Split PDF" desc="Split at selected points" to="/organizer" />
          <Card title="Compress PDF" desc="Reduce file size" to="/organizer" />
          <Card title="OCR PDF" desc="Make scanned PDFs searchable" to="/organizer" />
          <Card title="Convert" desc="Images ↔ PDF" to="/organizer" />
          <Card title="Protect / Unlock" desc="Add or remove password" to="/organizer" />
          <Card title="Redact" desc="Remove sensitive content" to="/organizer" />
          <Card title="Edit PDF" desc="Annotate and edit content" to="/editor/upload" />
          <Card title="Workflows" desc="Chain steps visually" to="/organizer" />
        </section>
      </main>
    </div>
  )
}

