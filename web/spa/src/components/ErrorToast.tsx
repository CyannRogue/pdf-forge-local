import { useEffect, useState } from 'react'

export type Toast = { id: string; message: string; type?: 'error'|'success'|'info' };

export function useToasts() {
  const [toasts, setToasts] = useState<Toast[]>([])
  function push(message: string, type: Toast['type'] = 'info') {
    const t = { id: Math.random().toString(36).slice(2), message, type }
    setToasts((s) => [...s, t])
    setTimeout(() => setToasts((s) => s.filter((x) => x.id !== t.id)), 4000)
  }
  return { toasts, push }
}

export function ErrorToast({ toasts }: { toasts: Toast[] }) {
  return (
    <div className="fixed bottom-3 right-3 flex flex-col gap-2 z-[9999]" aria-live="polite" aria-atomic="true">
      {toasts.map((t) => (
        <div key={t.id} className={`px-3 py-2 rounded-md border ${t.type==='error'?'bg-[#3a1b1b] border-[#6b2e2e]':'bg-[#21293a] border-[#2a3142]'} text-white text-sm`}>{t.message}</div>
      ))}
    </div>
  )
}

export type ApiError = { error?: { code?: string; message?: string; request_id?: string } } & Record<string, any>

export function humanizeError(err: ApiError): string {
  const code = err?.error?.code || ''
  const req = err?.error?.request_id ? ` [${err.error.request_id}]` : ''
  const map: Record<string,string> = {
    BAD_REQUEST: "We couldn’t understand your request. Please try again.",
    PAYLOAD_TOO_LARGE: "This file is too large. Try splitting it first.",
    UNSUPPORTED_MEDIA_TYPE: "This file type isn’t supported. Please upload a PDF or compatible format.",
    DEPENDENCY_MISSING: "One of the required tools is not available on the server. Please contact support.",
    RATE_LIMITED: "Too many requests at once. Please wait a moment and try again.",
    INTERNAL_ERROR: "Something went wrong on the server. Please try again.",
  }
  return (map[code] || err?.error?.message || 'Request failed') + req
}

