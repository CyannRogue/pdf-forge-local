export type Tool = {
  id: string
  title: string
  desc: string
  icon: string
  categories: string[]
  enabled?: boolean
  launch: {
    path: string
    method?: 'GET' | 'POST'
  }
}

export const CATEGORIES = [
  'All',
  'Organize',
  'Optimize',
  'Convert to PDF',
  'Convert from PDF',
  'Edit',
  'Security',
  'Advanced',
  'Apps',
]

export const TOOLS: Tool[] = [
  // Organize
  { id: 'merge', title: 'Merge PDF', desc: 'Combine PDFs into one', icon: 'Merge', categories: ['Organize'], launch: { path: '/ui?tool=merge' } },
  { id: 'split', title: 'Split PDF', desc: 'Split PDF by ranges', icon: 'Split', categories: ['Organize'], launch: { path: '/ui?tool=split' } },
  { id: 'remove-pages', title: 'Remove Pages', desc: 'Delete selected pages', icon: 'Eraser', categories: ['Organize'], launch: { path: '/ui?tool=remove-pages' } },
  { id: 'extract-pages', title: 'Extract Pages', desc: 'Extract specific page ranges', icon: 'FileOutput', categories: ['Organize'], launch: { path: '/ui?tool=extract-pages' } },
  { id: 'organize', title: 'Organize Pages', desc: 'Reorder pages by drag & drop', icon: 'PanelsTopLeft', categories: ['Organize'], launch: { path: '/ui?tool=organize' } },
  { id: 'scan-to-pdf', title: 'Scan to PDF', desc: 'OCR for scanned PDFs', icon: 'Scan', categories: ['Organize'], launch: { path: '/ui?tool=ocr' } },
  // Optimize
  { id: 'compress', title: 'Compress PDF', desc: 'Reduce file size', icon: 'Compress', categories: ['Optimize'], launch: { path: '/ui?tool=compress' } },
  { id: 'repair', title: 'Repair PDF', desc: 'Fix PDF structure', icon: 'Wrench', categories: ['Optimize'], enabled: false, launch: { path: '#coming-soon' } },
  { id: 'ocr', title: 'OCR PDF', desc: 'Make text searchable', icon: 'ScanText', categories: ['Optimize'], launch: { path: '/ui?tool=ocr' } },
  // Convert to PDF
  { id: 'jpg-to-pdf', title: 'JPG to PDF', desc: 'Convert images to PDF', icon: 'Image', categories: ['Convert to PDF'], launch: { path: '/ui?tool=jpg-to-pdf' } },
  { id: 'word-to-pdf', title: 'Word to PDF', desc: 'DOCX to PDF', icon: 'FileText', categories: ['Convert to PDF'], enabled: false, launch: { path: '#coming-soon' } },
  { id: 'ppt-to-pdf', title: 'PPT to PDF', desc: 'Slides to PDF', icon: 'Presentation', categories: ['Convert to PDF'], enabled: false, launch: { path: '#coming-soon' } },
  { id: 'excel-to-pdf', title: 'Excel to PDF', desc: 'Sheets to PDF', icon: 'Table', categories: ['Convert to PDF'], enabled: false, launch: { path: '#coming-soon' } },
  { id: 'html-to-pdf', title: 'HTML to PDF', desc: 'Web to PDF', icon: 'Globe', categories: ['Convert to PDF'], enabled: false, launch: { path: '#coming-soon' } },
  // Convert from PDF
  { id: 'pdf-to-jpg', title: 'PDF to JPG', desc: 'Export pages as images', icon: 'Images', categories: ['Convert from PDF'], launch: { path: '/ui?tool=pdf-to-jpg' } },
  { id: 'pdf-to-word', title: 'PDF to Word', desc: 'PDF to DOCX', icon: 'FileText', categories: ['Convert from PDF'], enabled: false, launch: { path: '#coming-soon' } },
  { id: 'pdf-to-ppt', title: 'PDF to PowerPoint', desc: 'PDF to PPTX', icon: 'Presentation', categories: ['Convert from PDF'], enabled: false, launch: { path: '#coming-soon' } },
  { id: 'pdf-to-excel', title: 'PDF to Excel', desc: 'PDF to XLSX', icon: 'Table', categories: ['Convert from PDF'], enabled: false, launch: { path: '#coming-soon' } },
  { id: 'pdf-to-pdfa', title: 'PDF to PDF/A', desc: 'Convert for archiving', icon: 'FileCog', categories: ['Convert from PDF', 'Advanced'], launch: { path: '/ui?tool=pdfa' } },
  // Edit
  { id: 'rotate', title: 'Rotate PDF', desc: 'Rotate pages', icon: 'RotateCw', categories: ['Edit'], enabled: false, launch: { path: '#coming-soon' } },
  { id: 'page-numbers', title: 'Page Numbers', desc: 'Number your pages', icon: 'Hash', categories: ['Edit'], launch: { path: '/ui?tool=page-numbers' } },
  { id: 'watermark', title: 'Watermark', desc: 'Add text watermark', icon: 'BadgePlus', categories: ['Edit'], launch: { path: '/ui?tool=watermark' } },
  { id: 'crop', title: 'Crop PDF', desc: 'Trim page margins', icon: 'Crop', categories: ['Edit'], enabled: false, launch: { path: '#coming-soon' } },
  { id: 'edit', title: 'Edit PDF', desc: 'Edit content', icon: 'PenLine', categories: ['Edit'], enabled: false, launch: { path: '#coming-soon' } },
  // Security
  { id: 'unlock', title: 'Unlock', desc: 'Remove password', icon: 'LockOpen', categories: ['Security'], launch: { path: '/ui?tool=unlock' } },
  { id: 'protect', title: 'Protect', desc: 'Encrypt with password', icon: 'Shield', categories: ['Security'], launch: { path: '/ui?tool=protect' } },
  { id: 'sign', title: 'Sign PDF', desc: 'Sign documents', icon: 'Signature', categories: ['Security'], enabled: false, launch: { path: '#coming-soon' } },
  { id: 'redact', title: 'Redact', desc: 'Remove sensitive content', icon: 'Highlighter', categories: ['Security', 'Edit'], launch: { path: '/ui?tool=redact' } },
  { id: 'compare', title: 'Compare', desc: 'Compare two PDFs', icon: 'Diff', categories: ['Security'], enabled: false, launch: { path: '#coming-soon' } },
  // Advanced
  { id: 'workflows', title: 'Workflows', desc: 'Automate tasks', icon: 'Workflow', categories: ['Advanced'], enabled: false, launch: { path: '#coming-soon' } },
  // Apps
  { id: 'desktop', title: 'Desktop App', desc: 'Use on your desktop', icon: 'Monitor', categories: ['Apps'], launch: { path: '/docs/USAGE.md' } },
  { id: 'mobile', title: 'Mobile', desc: 'Mobile workflows', icon: 'Smartphone', categories: ['Apps'], launch: { path: '/docs/USAGE.md' } },
]

