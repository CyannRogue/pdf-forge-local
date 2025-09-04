import { useMemo, useRef, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { TOOLS } from '../data/tools'
import { getIcon } from '../data/iconMap'

function api(path: string) {
  return (window.location.origin + path)
}

type Field =
  | { kind: 'file'; name: string; label: string; accept?: string; multiple?: false }
  | { kind: 'files'; name: string; label: string; accept?: string; multiple: true }
  | { kind: 'text'; name: string; label: string; placeholder?: string; defaultValue?: string }
  | { kind: 'password'; name: string; label: string; placeholder?: string }
  | { kind: 'number'; name: string; label: string; min?: number; max?: number; step?: number; defaultValue?: number }
  | { kind: 'select'; name: string; label: string; options: string[]; defaultValue?: string }
  | { kind: 'checkbox'; name: string; label: string; defaultChecked?: boolean }
  | { kind: 'textarea'; name: string; label: string; rows?: number; placeholder?: string; defaultValue?: string }

type Spec = {
  endpoint: string
  method?: 'POST' | 'GET'
  fields: Field[]
  parseSuccess?: (j: any) => React.ReactNode
}

const SPECS: Record<string, Spec> = {
  // Organize
  'merge': {
    endpoint: '/organize/merge',
    fields: [
      { kind: 'files', name: 'files', label: 'Select PDFs', accept: 'application/pdf', multiple: true },
      { kind: 'text', name: 'outfile', label: 'Output name', defaultValue: 'merged.pdf' },
    ],
    parseSuccess: (j) => (<ResultFile name={j.outfile} />)
  },
  'split': {
    endpoint: '/organize/split',
    fields: [
      { kind: 'file', name: 'file', label: 'PDF file', accept: 'application/pdf' },
      { kind: 'text', name: 'ranges', label: 'Ranges', placeholder: '1-3; 4-6; 9' },
    ],
    parseSuccess: (j) => (<ResultList title="Outputs" files={j.outputs} />)
  },
  'compress': {
    endpoint: '/format/compress',
    fields: [
      { kind: 'file', name: 'file', label: 'PDF file', accept: 'application/pdf' },
      { kind: 'number', name: 'image_quality', label: 'Image quality (0.1–1.0)', min: 0.1, max: 1.0, step: 0.1, defaultValue: 0.6 },
      { kind: 'text', name: 'outfile', label: 'Output name', defaultValue: 'compressed.pdf' },
    ],
    parseSuccess: (j) => (<ResultFile name={j.outfile} />)
  },
  'ocr': {
    endpoint: '/ocr/searchable',
    fields: [
      { kind: 'file', name: 'file', label: 'Scanned PDF', accept: 'application/pdf' },
      { kind: 'text', name: 'lang', label: 'Language', defaultValue: 'eng' },
      { kind: 'text', name: 'outfile', label: 'Output name', defaultValue: 'searchable.pdf' },
    ],
    parseSuccess: (j) => (<ResultFile name={j.outfile} />)
  },
  'jpg-to-pdf': {
    endpoint: '/convert/images-to-pdf',
    fields: [
      { kind: 'files', name: 'files', label: 'Images', accept: 'image/*', multiple: true },
      { kind: 'text', name: 'outfile', label: 'Output name', defaultValue: 'images.pdf' },
    ],
    parseSuccess: (j) => (<ResultFile name={j.outfile} />)
  },
  'pdf-to-jpg': {
    endpoint: '/convert/pdf-to-images',
    fields: [
      { kind: 'file', name: 'file', label: 'PDF file', accept: 'application/pdf' },
      { kind: 'number', name: 'dpi', label: 'DPI', min: 72, max: 400, step: 1, defaultValue: 200 },
    ],
    parseSuccess: (j) => (<ResultList title="Images" files={j.images} />)
  },
  'page-numbers': {
    endpoint: '/format/page-numbers',
    fields: [
      { kind: 'file', name: 'file', label: 'PDF file', accept: 'application/pdf' },
      { kind: 'select', name: 'position', label: 'Position', options: ['bottom-right','bottom-left','bottom-center','top-right','top-left','top-center'], defaultValue: 'bottom-right' },
      { kind: 'number', name: 'start', label: 'Start from', min: 1, max: 9999, step: 1, defaultValue: 1 },
      { kind: 'text', name: 'outfile', label: 'Output name', defaultValue: 'numbered.pdf' },
    ],
    parseSuccess: (j) => (<ResultFile name={j.outfile} />)
  },
  'watermark': {
    endpoint: '/format/watermark',
    fields: [
      { kind: 'file', name: 'file', label: 'PDF file', accept: 'application/pdf' },
      { kind: 'text', name: 'text', label: 'Watermark text', placeholder: 'CONFIDENTIAL' },
      { kind: 'number', name: 'opacity', label: 'Opacity', min: 0.05, max: 1.0, step: 0.05, defaultValue: 0.15 },
      { kind: 'number', name: 'angle', label: 'Angle', min: 0, max: 360, step: 1, defaultValue: 45 },
      { kind: 'number', name: 'size', label: 'Font size', min: 8, max: 200, step: 1, defaultValue: 48 },
      { kind: 'text', name: 'outfile', label: 'Output name', defaultValue: 'watermarked.pdf' },
    ],
    parseSuccess: (j) => (<ResultFile name={j.outfile} />)
  },
  'unlock': {
    endpoint: '/secure/decrypt',
    fields: [
      { kind: 'file', name: 'file', label: 'Encrypted PDF', accept: 'application/pdf' },
      { kind: 'password', name: 'password', label: 'Password' },
      { kind: 'text', name: 'outfile', label: 'Output name', defaultValue: 'unlocked.pdf' },
    ],
    parseSuccess: (j) => (<ResultFile name={j.outfile} />)
  },
  'protect': {
    endpoint: '/secure/encrypt',
    fields: [
      { kind: 'file', name: 'file', label: 'PDF file', accept: 'application/pdf' },
      { kind: 'password', name: 'password', label: 'Password' },
      { kind: 'text', name: 'outfile', label: 'Output name', defaultValue: 'locked.pdf' },
    ],
    parseSuccess: (j) => (<ResultFile name={j.outfile} />)
  },
  'extract-tables': {
    endpoint: '/extract/tables',
    fields: [
      { kind: 'file', name: 'file', label: 'PDF file', accept: 'application/pdf' },
      { kind: 'number', name: 'max_pages', label: 'Max pages', min: 1, max: 500, step: 1, defaultValue: 25 },
      { kind: 'text', name: 'outfile_prefix', label: 'CSV prefix', defaultValue: 'table' },
    ],
    parseSuccess: (j) => (<ResultList title="Tables" files={j.tables} />)
  },
  'form-automation': {
    endpoint: '/forms/fill',
    fields: [
      { kind: 'file', name: 'file', label: 'PDF form', accept: 'application/pdf' },
      { kind: 'textarea', name: 'data_json', label: 'Data JSON', rows: 6, placeholder: '{"Field":"Value"}' },
      { kind: 'checkbox', name: 'flatten', label: 'Flatten fields', defaultChecked: true },
      { kind: 'text', name: 'outfile', label: 'Output name', defaultValue: 'filled.pdf' },
    ],
    parseSuccess: (j) => (<ResultFile name={j.outfile} />)
  },
  'bookmarks-manager': {
    endpoint: '/metadata/bookmarks/add',
    fields: [
      { kind: 'file', name: 'file', label: 'PDF file', accept: 'application/pdf' },
      { kind: 'text', name: 'text', label: 'Bookmark text' },
      { kind: 'number', name: 'page', label: 'Page', min: 1, max: 9999, step: 1, defaultValue: 1 },
      { kind: 'text', name: 'outfile', label: 'Output name', defaultValue: 'bookmarked.pdf' },
    ],
    parseSuccess: (j) => (<ResultFile name={j.outfile} />)
  },
  'redact': {
    endpoint: '/redact/texts',
    fields: [
      { kind: 'file', name: 'file', label: 'PDF file', accept: 'application/pdf' },
      { kind: 'text', name: 'texts', label: 'Texts (comma-separated)', placeholder: 'secret, ssn' },
      { kind: 'text', name: 'outfile', label: 'Output name', defaultValue: 'redacted.pdf' },
    ],
    parseSuccess: (j) => (<ResultFile name={j.outfile} />)
  },
  'pdfa': {
    endpoint: '/compliance/pdfa',
    fields: [
      { kind: 'file', name: 'file', label: 'PDF file', accept: 'application/pdf' },
      { kind: 'select', name: 'level', label: 'PDF/A Level', options: ['PDF/A-2B', 'PDF/A-1B'], defaultValue: 'PDF/A-2B' },
      { kind: 'text', name: 'outfile', label: 'Output name', defaultValue: 'pdfa.pdf' },
    ],
    parseSuccess: (j) => (<ResultFile name={j.outfile} />)
  },
}

function ResultFile({ name }: { name: string }) {
  if (!name) return null
  const url = api('/files/download?name=') + encodeURIComponent(name.split('/').pop() || name)
  return (
    <div className="mt-4 text-sm">Output: <a className="underline" href={url} target="_blank" rel="noreferrer">{name}</a></div>
  )
}

function ResultList({ title, files }: { title: string; files: string[] }) {
  if (!Array.isArray(files) || files.length === 0) return null
  return (
    <div className="mt-4">
      <div className="font-semibold mb-2">{title}</div>
      <ul className="space-y-1 text-sm">
        {files.map((f) => {
          const name = f.split('/').pop() || f
          const url = api('/files/download?name=') + encodeURIComponent(name)
          return <li key={f}><a className="underline" href={url} target="_blank" rel="noreferrer">{name}</a></li>
        })}
      </ul>
    </div>
  )
}

export default function ToolLaunch() {
  const { id = '' } = useParams()
  const tool = useMemo(() => TOOLS.find(t => t.id.toLowerCase() === id.toLowerCase()), [id])
  const spec = SPECS[id]
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<React.ReactNode | null>(null)
  const inputsRef = useRef<Record<string, HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null>>({})

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

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!spec) return
    setBusy(true)
    setError(null)
    setResult(null)
    try {
      const fd = new FormData()
      for (const f of spec.fields) {
        const el = inputsRef.current[f.name] as any
        if (!el) continue
        if (f.kind === 'file') {
          if (el.files && el.files[0]) fd.append(f.name, el.files[0])
        } else if (f.kind === 'files') {
          if (el.files) Array.from(el.files).forEach((file: File) => fd.append(f.name, file))
        } else if (f.kind === 'checkbox') {
          fd.append(f.name, el.checked ? 'true' : 'false')
        } else {
          fd.append(f.name, el.value)
        }
      }
      const r = await fetch(api(spec.endpoint), { method: spec.method || 'POST', body: fd })
      const j = await r.json()
      if (!r.ok) {
        const msg = j?.error?.message || 'Request failed'
        setError(`${msg}${j?.error?.code ? ` (${j.error.code})` : ''}`)
      } else {
        setResult(spec.parseSuccess ? spec.parseSuccess(j) : <pre className="text-sm whitespace-pre-wrap">{JSON.stringify(j, null, 2)}</pre>)
      }
    } catch (err: any) {
      setError(err?.message || String(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-[var(--accent)]/20 flex items-center justify-center">
          <Icon size={20} className="text-[var(--accent)]" aria-hidden="true" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">{tool.title}</h1>
          <p className="text-slate-300 mt-2">{tool.desc}</p>
        </div>
      </div>

      <div className="mt-6 flex items-center gap-3 text-sm">
        <Link className="text-slate-300 underline focus-ring" to="/">Back to Home</Link>
        {!spec && (
          <a className="px-3 py-2 rounded-md bg-[var(--accent)] text-[var(--accent-fg)]" href={`/ui?tool=${encodeURIComponent(tool.id)}`}>Open in Workbench</a>
        )}
      </div>

      {spec ? (
        <form onSubmit={onSubmit} className="mt-8 space-y-4 rounded-2xl p-6 bg-[#161a22] border border-[#2a3142]">
          {spec.fields.map((f) => (
            <div key={f.name} className="grid gap-2">
              <label className="text-sm text-slate-200" htmlFor={f.name}>{f.label}</label>
              {f.kind === 'file' && (
                <input ref={(el) => (inputsRef.current[f.name] = el)} id={f.name} type="file" accept={f.accept}
                  className="block w-full text-sm" />
              )}
              {f.kind === 'files' && (
                <input ref={(el) => (inputsRef.current[f.name] = el)} id={f.name} type="file" accept={f.accept} multiple
                  className="block w-full text-sm" />
              )}
              {f.kind === 'text' && (
                <input ref={(el) => (inputsRef.current[f.name] = el)} id={f.name} type="text" defaultValue={f.defaultValue}
                  placeholder={f.placeholder} className="px-3 py-2 rounded-md bg-[#0f1115] border border-[#2a3142]" />
              )}
              {f.kind === 'password' && (
                <input ref={(el) => (inputsRef.current[f.name] = el)} id={f.name} type="password" placeholder={f.placeholder}
                  className="px-3 py-2 rounded-md bg-[#0f1115] border border-[#2a3142]" />
              )}
              {f.kind === 'number' && (
                <input ref={(el) => (inputsRef.current[f.name] = el)} id={f.name} type="number" defaultValue={f.defaultValue as any}
                  min={f.min as any} max={f.max as any} step={f.step as any}
                  className="px-3 py-2 rounded-md bg-[#0f1115] border border-[#2a3142]" />
              )}
              {f.kind === 'select' && (
                <select ref={(el) => (inputsRef.current[f.name] = el)} id={f.name} defaultValue={f.defaultValue}
                  className="px-3 py-2 rounded-md bg-[#0f1115] border border-[#2a3142]">
                  {f.options.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              )}
              {f.kind === 'checkbox' && (
                <label className="inline-flex items-center gap-2">
                  <input ref={(el) => (inputsRef.current[f.name] = el as any)} id={f.name} type="checkbox" defaultChecked={f.defaultChecked} />
                  <span className="text-sm">{f.label}</span>
                </label>
              )}
              {f.kind === 'textarea' && (
                <textarea ref={(el) => (inputsRef.current[f.name] = el as any)} id={f.name} rows={f.rows || 6}
                  placeholder={f.placeholder} defaultValue={f.defaultValue}
                  className="px-3 py-2 rounded-md bg-[#0f1115] border border-[#2a3142] font-mono text-sm"></textarea>
              )}
            </div>
          ))}

          <div className="pt-2">
            <button disabled={busy} className="px-4 py-2 rounded-md bg-[var(--accent)] text-[var(--accent-fg)] disabled:opacity-50">
              {busy ? 'Working…' : 'Run'}
            </button>
          </div>

          {error && (
            <div className="text-sm text-red-300">{error}</div>
          )}

          {result}
        </form>
      ) : (
        <div className="mt-8 rounded-2xl p-6 bg-[#161a22] border border-[#2a3142]">
          <p className="text-slate-300">This tool opens in the Workbench UI.</p>
          <a className="inline-block mt-3 px-4 py-2 rounded-md bg-[var(--accent)] text-[var(--accent-fg)]" href={`/ui?tool=${encodeURIComponent(tool.id)}`}>Open Workbench</a>
        </div>
      )}
    </div>
  )
}
