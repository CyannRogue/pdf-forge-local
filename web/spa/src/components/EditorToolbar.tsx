export function EditorToolbar({ onUndo, onRedo, onZoomIn, onZoomOut, onSave }: { onUndo?: () => void; onRedo?: () => void; onZoomIn?: () => void; onZoomOut?: () => void; onSave?: () => void }) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-[#161a22] border border-[#2a3142] rounded-md">
      <button className="px-2 py-1 bg-[#21293a] border border-[#2a3142] rounded" onClick={onUndo}>Undo</button>
      <button className="px-2 py-1 bg-[#21293a] border border-[#2a3142] rounded" onClick={onRedo}>Redo</button>
      <div className="flex-1" />
      <button className="px-2 py-1 bg-[#21293a] border border-[#2a3142] rounded" onClick={onZoomOut}>-</button>
      <button className="px-2 py-1 bg-[#21293a] border border-[#2a3142] rounded" onClick={onZoomIn}>+</button>
      <button className="px-3 py-2 bg-[var(--accent)] text-[var(--accent-fg)] rounded" onClick={onSave}>Save</button>
    </div>
  )
}

