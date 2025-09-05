import { useEffect, useRef, useState } from 'react'
import { EditorToolbar } from '../components/EditorToolbar'
import { ErrorToast, useToasts } from '../components/ErrorToast'
import { postForm, downloadUrl } from '../lib/api'
import { GlobalWorkerOptions, getDocument } from 'pdfjs-dist'
// @ts-ignore - let Vite resolve worker asset
import workerSrc from 'pdfjs-dist/build/pdf.worker.min.mjs?url'

type Box = { x: number; y: number; w: number; h: number }

export default function EditorWorkspace() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [pdfName, setPdfName] = useState<string>('document.pdf')
  const [busy, setBusy] = useState(false)
  const [boxes, setBoxes] = useState<Box[]>([])
  const { toasts, push } = useToasts()

  useEffect(() => {
    const data = sessionStorage.getItem('editor:file:data')
    const name = sessionStorage.getItem('editor:file:name') || 'document.pdf'
    setPdfName(name)
    if (!data) return
    // Render first page with pdf.js
    (async () => {
      try {
        GlobalWorkerOptions.workerSrc = workerSrc
        const blob = await (await fetch(data)).blob()
        const bytes = await blob.arrayBuffer()
        const pdf = await getDocument({ data: bytes }).promise
        const page = await pdf.getPage(1)
        const scale = 1.4
        const viewport = page.getViewport({ scale })
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')!
        canvas.width = viewport.width
        canvas.height = viewport.height
        await page.render({ canvasContext: ctx as any, viewport }).promise
      } catch (e:any) {
        push(e.message || 'Failed to render PDF','error')
      }
    })()
  }, [])

  function onCanvasClick(e: React.MouseEvent<HTMLDivElement>) {
    const rect = (e.currentTarget).getBoundingClientRect()
    const size = 80
    setBoxes((b) => [...b, { x: e.clientX-rect.left-size/2, y: e.clientY-rect.top-size/2, w: size, h: size }])
  }

  async function onSave() {
    const data = sessionStorage.getItem('editor:file:data')
    if (!data) return
    setBusy(true)
    try {
      const blob = await (await fetch(data)).blob()
      const fd = new FormData(); fd.append('file', new File([blob], pdfName, { type: 'application/pdf' }))
      fd.append('boxes_json', JSON.stringify(boxes.map((b) => ({ page: 1, x1: b.x, y1: b.y, x2: b.x+b.w, y2: b.y+b.h }))))
      fd.append('outfile','edited.pdf')
      const j = await postForm('/redact/boxes', fd) // using redact as a stand-in edit action
      push('Saved ✓','success'); window.open(downloadUrl(j.outfile),'_blank')
    } catch(e:any) { push(e.message,'error') } finally { setBusy(false) }
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-bold mb-3">PDF Editor</h1>
      <EditorToolbar onSave={onSave} />
      <div className="mt-4 grid grid-cols-1 md:grid-cols-5 gap-4">
        <aside className="md:col-span-1">
          <div className="text-sm text-slate-300">Thumbnails</div>
          <div className="mt-2 border border-[#2a3142] rounded-md p-2 text-xs text-slate-300">(Preview first page)</div>
        </aside>
        <section className="md:col-span-3">
          <div className="relative border border-[#2a3142] rounded-md bg-[#0f1115]" style={{minHeight: 400}} onClick={onCanvasClick}>
            <canvas ref={canvasRef} className="w-full h-auto" />
            {boxes.map((b,i)=> (
              <div key={i} className="absolute border-2 border-red-500 bg-red-500/20" style={{ left: b.x, top: b.y, width: b.w, height: b.h }} />
            ))}
          </div>
          <div className="text-sm text-slate-300 mt-2">Tip: click on the page to add a rectangle (example annotation).</div>
        </section>
        <aside className="md:col-span-1">
          <div className="text-sm font-semibold">Tools</div>
          <div className="mt-2 flex flex-col gap-2">
            <button className="px-3 py-2 bg-[#21293a] border border-[#2a3142] rounded" onClick={()=>setBoxes([])}>Clear annotations</button>
          </div>
        </aside>
      </div>
      <ErrorToast toasts={toasts} />
    </div>
  )
}
