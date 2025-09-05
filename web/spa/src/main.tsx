import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './styles/theme.css'
import Launcher from './pages/Launcher'
import Organizer from './pages/Organizer'
import EditorUpload from './pages/EditorUpload'
import EditorWorkspace from './pages/EditorWorkspace'

function App() {
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
