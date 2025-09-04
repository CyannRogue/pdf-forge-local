import { getIcon } from '../data/iconMap'
import type { Tool } from '../data/tools'

export function ToolCard({ tool, onOpen }: { tool: Tool; onOpen: (t: Tool) => void }) {
  const Icon = getIcon(tool.icon)
  const disabled = tool.enabled === false || tool.launch.path.startsWith('#')
  return (
    <div className="bg-[#161a22] border border-[#2a3142] rounded-xl p-4 flex flex-col gap-3 focus-ring" tabIndex={0} aria-label={`${tool.title} tool`}>
      <div className="flex items-center gap-3">
        <Icon size={20} className="text-[var(--accent)]" aria-hidden="true" />
        <div className="font-medium">{tool.title}</div>
      </div>
      <div className="text-sm text-slate-300">{tool.desc}</div>
      <div className="mt-auto">
        <button
          className="px-3 py-2 rounded-md bg-[var(--accent)] text-[var(--accent-fg)] disabled:opacity-50"
          onClick={() => !disabled && onOpen(tool)}
          disabled={disabled}
        >
          {disabled ? 'Coming soon' : 'Open'}
        </button>
      </div>
    </div>
  )
}

