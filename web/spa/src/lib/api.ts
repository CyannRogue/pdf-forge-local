import { humanizeError } from '../components/ErrorToast'

export function api(path: string) {
  return window.location.origin + path
}

export async function postForm(path: string, fd: FormData) {
  const r = await fetch(api(path), { method: 'POST', body: fd })
  const j = await r.json().catch(() => ({}))
  if (!r.ok) throw new Error(humanizeError(j))
  return j
}

export function downloadUrl(name: string) {
  const base = name.split('/').pop() || name
  return api('/files/download?name=') + encodeURIComponent(base)
}

