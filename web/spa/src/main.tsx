import React, { useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './styles/theme.css'
import Launcher from './pages/Launcher'
import Organizer from './pages/Organizer'
import EditorUpload from './pages/EditorUpload'
import EditorWorkspace from './pages/EditorWorkspace'

function App() {
  // Prevent the browser from navigating away when files are dropped outside a dropzone
  useEffect(() => {
    const block = (e: DragEvent) => { e.preventDefault() }
    window.addEventListener('dragover', block)
    window.addEventListener('drop', block)
    return () => {
      window.removeEventListener('dragover', block)
      window.removeEventListener('drop', block)
    }
  }, [])

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Launcher />} />
        <Route path="/organizer" element={<Organizer />} />
        <Route path="/editor/upload" element={<EditorUpload />} />
        <Route path="/editor/workspace" element={<EditorWorkspace />} />
      </Routes>
    </BrowserRouter>
  )
}

const root = createRoot(document.getElementById('root')!)
root.render(<React.StrictMode><App /></React.StrictMode>)
