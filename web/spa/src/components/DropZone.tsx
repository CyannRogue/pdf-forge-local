import { useRef, useState } from 'react'

export function DropZone({
  label,
  multiple,
  accept,
  onFiles,
}: {
  label: string
  multiple?: boolean
  accept?: string
  onFiles: (files: FileList | File[]) => void
}) {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [over, setOver] = useState(false)

  function onDrop(e: React.DragEvent) {
    e.preventDefault()
    e.stopPropagation()
    setOver(false)
    const dt = e.dataTransfer
    if (!dt) return
    if (dt.files && dt.files.length) {
      onFiles(dt.files)
      return
    }
    // Fallback for DataTransferItemList
    // @ts-ignore
    const items: DataTransferItemList | undefined = dt.items
    if (items && items.length) {
      const files: File[] = []
      for (let i = 0; i < items.length; i++) {
        const it = items[i]
        if (it.kind === 'file') {
          const f = it.getAsFile()
          if (f) files.push(f)
        }
      }
      if (files.length) onFiles(files)
    }
  }

  return (
    <div
      className={`rounded-xl border-2 border-dashed ${over?'border-[var(--accent)] bg-[var(--accent)]/10':'border-[#2a3142] bg-[#0f1115]'} p-8 text-center cursor-pointer`}
      onDragEnter={(e) => { e.preventDefault(); e.stopPropagation(); setOver(true) }}
      onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setOver(true); try { (e.dataTransfer as any).dropEffect = 'copy' } catch {} }}
      onDragLeave={() => setOver(false)}
      onDrop={onDrop}
      onClick={() => inputRef.current?.click()}
      role="button"
      tabIndex={0}
      onKeyDown={(e)=>{ if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); inputRef.current?.click() } }}
    >
      <div className="text-slate-300">{label}</div>
      <button className="mt-3 px-3 py-2 rounded-md bg-[var(--accent)] text-[var(--accent-fg)]">Select files</button>
      <input ref={inputRef} type="file" accept={accept} multiple={multiple} hidden onChange={(e) => {
        const f = e.target.files
        if (f && f.length) onFiles(f)
      }} />
    </div>
  )
}
