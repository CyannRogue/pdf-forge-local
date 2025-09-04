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
  'AI Tools',
  'Accessibility',
  'Apps',
]

export const TOOLS: Tool[] = [
  // Organize
  { id: 'merge', title: 'Merge PDF', desc: 'Combine PDFs into one', icon: 'Merge', categories: ['Organize'], launch: { path: '/ui/home/#/tools/merge' } },
  { id: 'split', title: 'Split PDF', desc: 'Split PDF by ranges', icon: 'Split', categories: ['Organize'], launch: { path: '/ui/home/#/tools/split' } },
  { id: 'remove-pages', title: 'Remove Pages', desc: 'Delete selected pages', icon: 'Eraser', categories: ['Organize'], launch: { path: '/ui/home/#/tools/remove-pages' } },
  { id: 'extract-pages', title: 'Extract Pages', desc: 'Extract specific page ranges', icon: 'FileOutput', categories: ['Organize'], launch: { path: '/ui/home/#/tools/extract-pages' } },
  { id: 'organize', title: 'Organize Pages', desc: 'Reorder pages by drag & drop', icon: 'PanelsTopLeft', categories: ['Organize'], launch: { path: '/ui/home/#/tools/organize' } },
  { id: 'scan-to-pdf', title: 'Scan to PDF', desc: 'OCR for scanned PDFs', icon: 'Scan', categories: ['Organize'], launch: { path: '/ui/home/#/tools/ocr' } },
  // Optimize
  { id: 'compress', title: 'Compress PDF', desc: 'Reduce file size', icon: 'Compress', categories: ['Optimize'], launch: { path: '/ui/home/#/tools/compress' } },
  { id: 'repair', title: 'Repair PDF', desc: 'Fix PDF structure', icon: 'Wrench', categories: ['Optimize'], enabled: false, launch: { path: '#coming-soon' } },
  { id: 'ocr', title: 'OCR PDF', desc: 'Make text searchable', icon: 'ScanText', categories: ['Optimize'], launch: { path: '/ui/home/#/tools/ocr' } },
  // Convert to PDF
  { id: 'jpg-to-pdf', title: 'JPG to PDF', desc: 'Convert images to PDF', icon: 'Image', categories: ['Convert to PDF'], launch: { path: '/ui/home/#/tools/jpg-to-pdf' } },
  { id: 'word-to-pdf', title: 'Word to PDF', desc: 'DOCX to PDF', icon: 'FileText', categories: ['Convert to PDF'], enabled: false, launch: { path: '#coming-soon' } },
  { id: 'ppt-to-pdf', title: 'PPT to PDF', desc: 'Slides to PDF', icon: 'Presentation', categories: ['Convert to PDF'], enabled: false, launch: { path: '#coming-soon' } },
  { id: 'excel-to-pdf', title: 'Excel to PDF', desc: 'Sheets to PDF', icon: 'Table', categories: ['Convert to PDF'], enabled: false, launch: { path: '#coming-soon' } },
  { id: 'html-to-pdf', title: 'HTML to PDF', desc: 'Web to PDF', icon: 'Globe', categories: ['Convert to PDF'], enabled: false, launch: { path: '#coming-soon' } },
  // Convert from PDF
  { id: 'pdf-to-jpg', title: 'PDF to JPG', desc: 'Export pages as images', icon: 'Images', categories: ['Convert from PDF'], launch: { path: '/ui/home/#/tools/pdf-to-jpg' } },
  { id: 'pdf-to-word', title: 'PDF to Word', desc: 'PDF to DOCX', icon: 'FileText', categories: ['Convert from PDF'], enabled: false, launch: { path: '#coming-soon' } },
  { id: 'pdf-to-ppt', title: 'PDF to PowerPoint', desc: 'PDF to PPTX', icon: 'Presentation', categories: ['Convert from PDF'], enabled: false, launch: { path: '#coming-soon' } },
  { id: 'pdf-to-excel', title: 'PDF to Excel', desc: 'PDF to XLSX', icon: 'Table', categories: ['Convert from PDF'], enabled: false, launch: { path: '#coming-soon' } },
  { id: 'pdf-to-pdfa', title: 'PDF to PDF/A', desc: 'Convert for archiving', icon: 'FileCog', categories: ['Convert from PDF', 'Advanced'], launch: { path: '/ui/home/#/tools/pdfa' } },
  // Edit
  { id: 'rotate', title: 'Rotate PDF', desc: 'Rotate pages', icon: 'RotateCw', categories: ['Edit'], enabled: false, launch: { path: '#coming-soon' } },
  { id: 'page-numbers', title: 'Page Numbers', desc: 'Number your pages', icon: 'Hash', categories: ['Edit'], launch: { path: '/ui/home/#/tools/page-numbers' } },
  { id: 'watermark', title: 'Watermark', desc: 'Add text watermark', icon: 'BadgePlus', categories: ['Edit'], launch: { path: '/ui/home/#/tools/watermark' } },
  { id: 'crop', title: 'Crop PDF', desc: 'Trim page margins', icon: 'Crop', categories: ['Edit'], enabled: false, launch: { path: '#coming-soon' } },
  { id: 'edit', title: 'Edit PDF', desc: 'Edit content', icon: 'PenLine', categories: ['Edit'], enabled: false, launch: { path: '#coming-soon' } },
  // Security
  { id: 'unlock', title: 'Unlock', desc: 'Remove password', icon: 'LockOpen', categories: ['Security'], launch: { path: '/ui/home/#/tools/unlock' } },
  { id: 'protect', title: 'Protect', desc: 'Encrypt with password', icon: 'Shield', categories: ['Security'], launch: { path: '/ui/home/#/tools/protect' } },
  { id: 'sign', title: 'Sign PDF', desc: 'Sign documents', icon: 'Signature', categories: ['Security'], enabled: false, launch: { path: '#coming-soon' } },
  { id: 'redact', title: 'Redact', desc: 'Remove sensitive content', icon: 'Highlighter', categories: ['Security', 'Edit'], launch: { path: '/ui/home/#/tools/redact' } },
  { id: 'compare', title: 'Compare', desc: 'Compare two PDFs', icon: 'Diff', categories: ['Security'], enabled: false, launch: { path: '#coming-soon' } },
  // Advanced
  { id: 'workflows', title: 'Workflows', desc: 'Chain and save actions', icon: 'Workflow', categories: ['Advanced'], launch: { path: '/ui/home/#/tools/workflows' } },
  { id: 'extract-tables', title: 'Extract Tables', desc: 'Export tables to CSV/Excel', icon: 'Table', categories: ['Advanced'], launch: { path: '/ui/home/#/tools/extract-tables' } },
  { id: 'form-automation', title: 'Form Automation', desc: 'Fill forms from CSV/JSON', icon: 'ClipboardSignature', categories: ['Advanced'], launch: { path: '/ui/home/#/tools/form-automation' } },
  { id: 'bookmarks-manager', title: 'Bookmarks Manager', desc: 'List/add/remove bookmarks', icon: 'Bookmarks', categories: ['Advanced'], launch: { path: '/ui/home/#/tools/bookmarks-manager' } },
  // AI Tools
  { id: 'summarise', title: 'Summarise PDF', desc: 'AI summary of content', icon: 'FileText', categories: ['AI Tools'], launch: { path: '/ui/home/#/tools/summarise' } },
  { id: 'translate', title: 'Translate PDF', desc: 'AI translate full text', icon: 'Languages', categories: ['AI Tools'], launch: { path: '/ui/home/#/tools/translate' } },
  // Accessibility
  { id: 'accessible-pdf', title: 'Accessible PDF', desc: 'Convert to accessible PDF', icon: 'Accessibility', categories: ['Accessibility'], launch: { path: '/ui/home/#/tools/accessible-pdf' } },
  { id: 'read-aloud', title: 'Read Aloud', desc: 'Text-to-speech preview', icon: 'Megaphone', categories: ['Accessibility'], launch: { path: '/ui/home/#/tools/read-aloud' } },
  { id: 'high-contrast', title: 'High Contrast', desc: 'Toggle high-contrast theme', icon: 'Contrast', categories: ['Accessibility'], launch: { path: '/ui/home/#/tools/high-contrast' } },
  // Apps
  { id: 'desktop', title: 'Desktop App', desc: 'Use on your desktop', icon: 'Monitor', categories: ['Apps'], launch: { path: '/docs/USAGE.md' } },
  { id: 'mobile', title: 'Mobile', desc: 'Mobile workflows', icon: 'Smartphone', categories: ['Apps'], launch: { path: '/docs/USAGE.md' } },
]
