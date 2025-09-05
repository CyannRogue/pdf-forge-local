import { useRef } from 'react'

export function PageGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="page-grid grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
      {children}
    </div>
  )
}
