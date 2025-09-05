import { useMemo, useRef, useState } from 'react'
import { DropZone } from '../components/DropZone'
import { ErrorToast, useToasts } from '../components/ErrorToast'
import { PageGrid } from '../components/PageGrid'
import { PageThumbnail } from '../components/PageThumbnail'
import { downloadUrl, postForm } from '../lib/api'

type Uploaded = { name: string; file: File }

export default function Organizer() {
  const [files, setFiles] = useState<Uploaded[]>([])
  const [thumbs, setThumbs] = useState<string[]>([])
  const [dividers, setDividers] = useState<Set<number>>(new Set()) // split after page i
  const [sourceForThumbs, setSourceForThumbs] = useState<File | null>(null)
  const [busy, setBusy] = useState(false)
  const [pwd, setPwd] = useState('')
  const { toasts, push } = useToasts()

  async function onSelect(fs: FileList | File[]) {
    const list = Array.from(fs as any).filter(Boolean) as File[]
    const uploads = list.map((f) => ({ name: f.name, file: f }))
    setFiles(uploads)
    if (uploads.length === 1) {
      await buildThumbs(uploads[0].file)
    } else if (uploads.length > 1) {
      push('Multiple PDFs ready. Use Merge or Organize. Generate preview…')
      // Create thumbs from the first file by default
      await buildThumbs(uploads[0].file)
    }
  }

  async function buildThumbs(file: File) {
    setBusy(true)
    try {
      const fd = new FormData(); fd.append('file', file); fd.append('dpi', '140')
      const j = await postForm('/convert/pdf-to-images', fd)
      const images: string[] = j.images || []
      setThumbs(images.map((p: string) => downloadUrl(p)))
      setSourceForThumbs(file)
      push('Preview ready')
    } catch (e:any) {
      push(e.message || 'Failed to generate preview', 'error')
    } finally {
      setBusy(false)
    }
  }

  async function merge() {
    if (!files.length) return
    setBusy(true)
    try {
      const fd = new FormData()
      files.forEach((u) => fd.append('files', u.file))
      fd.append('outfile', 'merged.pdf')
      const j = await postForm('/organize/merge', fd)
      push('Merged ✓', 'success')
      window.open(downloadUrl(j.outfile), '_blank')
      // Use merged file for organizing next
      const mergedBlob = new File([new Blob()], j.outfile, { type: 'application/pdf' })
    } catch (e:any) {
      push(e.message, 'error')
    } finally {
      setBusy(false)
    }
  }

  async function organize() {
    if (!sourceForThumbs) return
    setBusy(true)
    try {
      const order = Array.from(document.querySelectorAll('[data-page]')).map((el:any) => Number(el.dataset.page))
      const fd = new FormData()
      fd.append('file', sourceForThumbs)
      fd.append('order', order.join(','))
      fd.append('outfile', 'reordered.pdf')
      const j = await postForm('/organize/reorder', fd)
      push('Organized ✓', 'success')
      window.open(downloadUrl(j.outfile), '_blank')
    } catch (e:any) {
      push(e.message, 'error')
    } finally {
      setBusy(false)
    }
  }

  async function splitAt(divs: number[]) {
    if (!sourceForThumbs) return
    setBusy(true)
    try {
      // Convert divider positions to ranges string
      const pages = thumbs.length
      const cuts = [...divs].sort((a,b)=>a-b)
      const ranges: string[] = []
      let start = 1
      for (const d of cuts) { ranges.push(`${start}-${d}`); start = d+1 }
      ranges.push(`${start}-${pages}`)
      const fd = new FormData()
      fd.append('file', sourceForThumbs)
      fd.append('ranges', ranges.join(';'))
      const j = await postForm('/organize/split', fd)
      push(`Split into ${j.outputs?.length || 0} files ✓`, 'success')
    } catch (e:any) { push(e.message, 'error') } finally { setBusy(false) }
  }

  async function compress(level: 'low'|'medium'|'high') {
    if (!sourceForThumbs) return
    setBusy(true)
    try {
      const q = level==='low'?0.8:level==='medium'?0.6:0.4
      const fd = new FormData(); fd.append('file', sourceForThumbs); fd.append('image_quality', String(q)); fd.append('outfile','compressed.pdf')
      const j = await postForm('/format/compress', fd)
      push('Compressed ✓', 'success'); window.open(downloadUrl(j.outfile), '_blank')
    } catch (e:any) { push(e.message,'error') } finally { setBusy(false) }
  }

  async function ocr() {
    if (!sourceForThumbs) return
    setBusy(true)
    try {
      const fd = new FormData(); fd.append('file', sourceForThumbs); fd.append('outfile','searchable.pdf')
      const j = await postForm('/ocr/searchable', fd)
      push('OCR complete ✓', 'success'); window.open(downloadUrl(j.outfile), '_blank')
    } catch (e:any) { push(e.message,'error') } finally { setBusy(false) }
  }

  async function protect(unlock=false) {
    if (!sourceForThumbs) return
    if (!unlock && !pwd) { push('Enter a password to protect','error'); return }
    setBusy(true)
    try {
      const fd = new FormData(); fd.append('file', sourceForThumbs)
      if (unlock) { fd.append('password', pwd || ''); fd.append('outfile','unlocked.pdf'); const j = await postForm('/secure/decrypt', fd); window.open(downloadUrl(j.outfile),'_blank'); push('Unlocked ✓','success') }
      else { fd.append('password', pwd); fd.append('outfile','locked.pdf'); const j = await postForm('/secure/encrypt', fd); window.open(downloadUrl(j.outfile),'_blank'); push('Protected ✓','success') }
    } catch(e:any) { push(e.message,'error') } finally { setBusy(false) }
  }

  async function imagesToPdf(fs: FileList | File[]) {
    const imgs = Array.from(fs as any) as File[]
    if (!imgs.length) return
    setBusy(true)
    try {
      const fd = new FormData(); imgs.forEach((f)=>fd.append('files', f)); fd.append('outfile','images.pdf')
      const j = await postForm('/convert/images-to-pdf', fd)
      push('Created PDF ✓','success'); window.open(downloadUrl(j.outfile),'_blank')
    } catch(e:any) { push(e.message,'error') } finally { setBusy(false) }
  }

  // drag reorder
  function enableDrag(container: HTMLElement) {
    container.addEventListener('dragover', (e) => {
      e.preventDefault()
      const dragging = container.querySelector('.dragging') as HTMLElement
      if (!dragging) return
      const after = getAfter(container, e.clientY)
      if (!after) container.appendChild(dragging); else container.insertBefore(dragging, after)
    })
  }
  function getAfter(container: HTMLElement, y: number) {
    const nodes = [...container.querySelectorAll('.draggable:not(.dragging)')] as HTMLElement[]
    return nodes.reduce((closest, child) => {
      const box = child.getBoundingClientRect(); const offset = y - box.top - box.height/2
      return (offset < 0 && offset > closest.offset) ? { offset, element: child } : closest
    }, { offset: Number.NEGATIVE_INFINITY } as any).element
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <h1 className="text-3xl font-bold mb-4">Document Organizer</h1>
      <DropZone label="Drag & drop PDFs here or click to select" accept="application/pdf" multiple onFiles={onSelect} />

      {sourceForThumbs && (
        <div className="mt-6 flex items-center gap-2">
          <button className="px-3 py-2 rounded-md bg-[var(--accent)] text-[var(--accent-fg)]" onClick={organize} disabled={busy}>Organize</button>
          <button className="px-3 py-2 rounded-md bg-[#21293a] border border-[#2a3142]" onClick={()=>splitAt([Math.ceil(thumbs.length/2)])} disabled={busy}>Split (half)</button>
          <button className="px-3 py-2 rounded-md bg-[#21293a] border border-[#2a3142]" onClick={()=>splitAt(Array.from(dividers))} disabled={busy || dividers.size===0}>Split (selected)</button>
          <div className="ml-4 flex items-center gap-1 text-sm">
            <span>Compress:</span>
            <button className="px-2 py-1 bg-[#21293a] border border-[#2a3142] rounded" onClick={()=>compress('low')}>Low</button>
            <button className="px-2 py-1 bg-[#21293a] border border-[#2a3142] rounded" onClick={()=>compress('medium')}>Med</button>
            <button className="px-2 py-1 bg-[#21293a] border border-[#2a3142] rounded" onClick={()=>compress('high')}>High</button>
          </div>
          <button className="ml-4 px-3 py-2 rounded-md bg-[#21293a] border border-[#2a3142]" onClick={ocr} disabled={busy}>Run OCR</button>
          <div className="ml-4 flex items-center gap-2 text-sm">
            <input type="password" placeholder="Password" className="px-2 py-1 rounded bg-[#0f1115] border border-[#2a3142]" value={pwd} onChange={(e)=>setPwd(e.target.value)} />
            <button className="px-2 py-1 bg-[#21293a] border border-[#2a3142] rounded" onClick={()=>protect(false)} disabled={busy}>Protect</button>
            <button className="px-2 py-1 bg-[#21293a] border border-[#2a3142] rounded" onClick={()=>protect(true)} disabled={busy}>Unlock</button>
          </div>
        </div>
      )}

      {!!files.length && (
        <div className="mt-4 flex items-center gap-2">
          <button className="px-3 py-2 rounded-md bg-[#21293a] border border-[#2a3142]" onClick={merge} disabled={busy}>Merge PDFs</button>
        </div>
      )}

      <div className="mt-6" id="pageContainer" ref={(el)=>{ if (el) enableDrag(el)}}>
        <PageGrid>
          {thumbs.map((src, i) => (
            <div key={i} className="draggable relative" draggable data-page={i+1} onDragStart={(e)=> (e.currentTarget as any).classList.add('dragging')} onDragEnd={(e)=> (e.currentTarget as any).classList.remove('dragging')}>
              <PageThumbnail src={src} page={i+1} onDelete={()=>{
                setThumbs((arr)=>arr.filter((_,idx)=>idx!==i))
              }} />
              {i < thumbs.length-1 && (
                <button
                  aria-label="Toggle split here"
                  className={`absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-10 rounded ${dividers.has(i+1)?'bg-[var(--accent)]':'bg-[#2a3142]'}`}
                  onClick={(e)=>{ e.stopPropagation(); setDividers((s)=>{ const n = new Set(s); if (n.has(i+1)) n.delete(i+1); else n.add(i+1); return n }) }}
                />
              )}
            </div>
          ))}
        </PageGrid>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-2">Images → PDF</h2>
        <DropZone label="Drop images to create a PDF" accept="image/*" multiple onFiles={imagesToPdf} />
      </div>

      <ErrorToast toasts={toasts} />
    </div>
  )
}
