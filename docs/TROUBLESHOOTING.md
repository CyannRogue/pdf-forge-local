# Troubleshooting

- **Tesseract not found**: install `tesseract-ocr` (and language packs as needed).
- **Ghostscript missing**: install `ghostscript`.
- **Poppler missing**: install `poppler-utils` for `pdf2image`.
- **OCR quality poor**: increase DPI in `/convert/pdf-to-images` (e.g., 300) before OCR, or add language packs.
- **PDF/A conversion fails**: try different level (`PDF/A-1B`), sanitize input (re-save via pikepdf).
- **Complex PDFs**: try linearize or save via pikepdf to rebuild xref tables.
