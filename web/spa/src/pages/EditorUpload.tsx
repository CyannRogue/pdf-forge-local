import { useNavigate } from 'react-router-dom'
import { DropZone } from '../components/DropZone'

export default function EditorUpload() {
  const nav = useNavigate()
  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold mb-4">Open PDF for Editing</h1>
      <DropZone label="Drag & drop a PDF or click to select" accept="application/pdf" onFiles={(f)=>{
        const file = (Array.from(f as any)[0]) as File
        if (!file) return
        sessionStorage.setItem('editor:file:name', file.name)
        // Store file temporarily via FileReader (dataURL). Real apps should upload or use OPFS.
        const r = new FileReader(); r.onload = ()=>{ sessionStorage.setItem('editor:file:data', String(r.result)); nav('/editor/workspace') }; r.readAsDataURL(file)
      }} />
    </div>
  )
}

