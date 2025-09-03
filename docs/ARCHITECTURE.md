# Architecture

- **FastAPI** service exposing modular routers.
- **Services layer** encapsulates PDF ops per domain (organize, format, metadata, forms, redact, compliance, extract).
- **Libraries**
  - pypdf: page ops, metadata, forms fill/flatten.
  - pikepdf: linearize, compression.
  - PyMuPDF (fitz): redaction (content removal), search.
  - pdfplumber/pdfminer.six: text/tables extraction.
  - reportlab: overlays (watermark, numbers).
  - system: Ghostscript (PDF/A), Poppler (pdf2image), Tesseract (OCR).
- **Storage**: temp outputs in `/tmp` (override with env `PDF_FORGE_TMP`).
- **UI**: static assets served at `/ui`.
