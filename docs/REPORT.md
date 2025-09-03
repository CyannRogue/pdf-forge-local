# Project Report — PDF Forge Local

## Scope
Local-only PDF suite. No cloud calls. All processing on-device/server.

## Features (Phase 1)
- Organize: merge, split, extract/delete pages.
- Convert: PDF ↔ images; images → PDF.
- OCR: make searchable PDFs (Tesseract via `ocrmypdf`).
- Secure: encrypt/decrypt (password).
- Extract: text.

## Features (Phase 2)
- Watermarks, headers/footers, page numbers, Bates numbering.
- Metadata edit; bookmarks; outline.
- Compression (downsample images, optimize objects).
- Form fill/flatten; export/import data.
- Redaction (true remove), with audit.
- PDF/A conversion; linearization.
- Table extraction (pdfplumber/camelot).
- Compare (visual/text).

## Architecture
- API: FastAPI, modular routers and services.
- Libs: `pypdf`, `pikepdf`, `PyMuPDF`, `pdfminer.six`, `pdfplumber`, `img2pdf`, `pdf2image`, `ocrmypdf`, `reportlab`.
- Storage: temp outputs in `/tmp`. Download via `/files/download`.
- CLI: `typer` for batch operations.

## Non-Functional
- Offline-by-default.
- Deterministic outputs where feasible.
- Input validation and safe temp handling.
- Logs minimal; no data leaves environment.

## Environment
- Python 3.11.
- System deps: `tesseract-ocr`, `poppler-utils`, `ghostscript`.
- Codespaces devcontainer provided.

## Testing (initial)
- Unit: page range parser; merge and split round-trips.
- Smoke: OCR basic English page; encrypt→decrypt→open.

## Risks
- OCR quality varies by scan quality and language packs.
- Complex PDFs (broken xrefs, encrypted) may need repair; `pikepdf` can help.
- PDF→Word fidelity not guaranteed locally; out of scope Phase 1.

## Roadmap
1. Phase 1 endpoints (done).
2. Add watermarks/page numbers/compress.
3. Frontend (PDF.js) with page thumbnails & drag-drop.
4. Batch presets + watch-folder mode (CLI).
