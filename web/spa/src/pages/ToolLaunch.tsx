import { useEffect } from 'react'
import { useParams } from 'react-router-dom'

export default function ToolLaunch() {
  const { id } = useParams()
  useEffect(() => {
    const t = (id || '').toLowerCase()
    window.location.replace(`/ui?tool=${encodeURIComponent(t)}`)
  }, [id])
  return null
}

