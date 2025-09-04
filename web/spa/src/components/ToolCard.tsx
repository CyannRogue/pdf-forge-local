import { getIcon } from '../data/iconMap'
import type { Tool } from '../data/tools'

export function ToolCard({ tool, onOpen }: { tool: Tool; onOpen: (t: Tool) => void }) {
  const Icon = getIcon(tool.icon)
  const disabled = tool.enabled === false || tool.launch.path.startsWith('#')
  return (
    <div className="bg-[#161a22] border border-[#2a3142] rounded-2xl p-5 flex flex-col gap-4 focus-ring min-h-[180px]" tabIndex={0} aria-label={`${tool.title} tool`}>
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-[var(--accent)]/20 flex items-center justify-center">
          <Icon size={18} className="text-[var(--accent)]" aria-hidden="true" />
        </div>
        <div>
          <div className="font-semibold text-white text-lg">{tool.title}</div>
          <div className="text-sm text-slate-300 mt-1">{tool.desc}</div>
        </div>
      </div>
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
