import { useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { TOOLS } from '../data/tools'
import { getIcon } from '../data/iconMap'

export default function ToolLaunch() {
  const { id = '' } = useParams()
  const tool = useMemo(() => TOOLS.find(t => t.id.toLowerCase() === id.toLowerCase()), [id])
  if (!tool) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-16">
        <h1 className="text-2xl font-bold">Tool not found</h1>
        <p className="mt-2 text-slate-300">The requested tool does not exist.</p>
        <Link className="inline-block mt-4 px-3 py-2 rounded-md bg-[var(--accent)] text-[var(--accent-fg)]" to="/">Back to Home</Link>
      </div>
    )
  }
  const Icon = getIcon(tool.icon)
  return (
    <div className="max-w-4xl mx-auto px-6 py-14">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-[var(--accent)]/20 flex items-center justify-center">
          <Icon size={20} className="text-[var(--accent)]" aria-hidden="true" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">{tool.title}</h1>
          <p className="text-slate-300 mt-2">{tool.desc}</p>
        </div>
      </div>

      <div className="mt-6">
        <a className="inline-block px-4 py-2 rounded-md bg-[var(--accent)] text-[var(--accent-fg)]" href={`/ui?tool=${encodeURIComponent(tool.id)}`}>Open in Workbench</a>
        <Link className="ml-3 text-slate-300 underline focus-ring" to="/">Back</Link>
      </div>

      <div className="mt-10 rounded-2xl p-6 bg-[#161a22] border border-[#2a3142]">
        <h3 className="font-semibold mb-2">How it works</h3>
        <ol className="list-decimal ml-5 text-slate-300 space-y-1">
          <li>Open in Workbench</li>
          <li>Upload a PDF (or images for conversion tools)</li>
          <li>Follow the panel instructions for this tool</li>
        </ol>
      </div>
    </div>
  )
}
