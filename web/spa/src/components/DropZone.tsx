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
    setOver(false)
    if (e.dataTransfer?.files && e.dataTransfer.files.length) {
      onFiles(e.dataTransfer.files)
    }
  }

  return (
    <div
      className={`rounded-xl border-2 border-dashed ${over?'border-[var(--accent)] bg-[var(--accent)]/10':'border-[#2a3142] bg-[#0f1115]'} p-8 text-center cursor-pointer`}
      onDragOver={(e) => { e.preventDefault(); setOver(true) }}
      onDragLeave={() => setOver(false)}
      onDrop={onDrop}
      onClick={() => inputRef.current?.click()}
      role="button"
      tabIndex={0}
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

