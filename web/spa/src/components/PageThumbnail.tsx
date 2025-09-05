export function PageThumbnail({ src, page, onDelete, onRotate }: { src: string; page: number; onDelete?: () => void; onRotate?: () => void }) {
  return (
    <div className="relative bg-[#161a22] border border-[#2a3142] rounded-lg p-2">
      <img src={src} alt={`Page ${page}`} className="w-full h-auto rounded" />
      <div className="absolute top-1 right-1 flex gap-1">
        {onRotate && <button aria-label="Rotate" className="px-2 py-1 text-xs bg-[#21293a] border border-[#2a3142] rounded" onClick={(e)=>{e.stopPropagation(); onRotate()}}>↻</button>}
        {onDelete && <button aria-label="Delete" className="px-2 py-1 text-xs bg-[#3a1b1b] border border-[#6b2e2e] rounded" onClick={(e)=>{e.stopPropagation(); onDelete()}}>✕</button>}
      </div>
      <div className="absolute bottom-1 left-1 text-xs px-1 py-0.5 bg-black/50 rounded">{page}</div>
    </div>
  )
}

