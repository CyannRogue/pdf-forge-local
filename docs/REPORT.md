# Project Report — PDF Forge Local (v0.3.0)

## Scope
Local-only PDF suite. No cloud calls. All processing on-device/server.

## Feature Set
- Organize: merge, split, extract/delete, reorder pages.
- Convert: PDF ↔ images; images → PDF.
- OCR: searchable PDFs (Tesseract via `ocrmypdf`).
- Secure: encrypt/decrypt.
- Extract: text, tables (to CSV).
- Format: watermark, page numbers, compression.
- Metadata: get/set document info, list/add bookmarks.
- Forms: list fields, fill, optional flatten.
- Redact: text and box-based redaction (PyMuPDF apply_redactions()).
- Compliance: PDF/A (Ghostscript), linearize.

## Architecture
See `docs/ARCHITECTURE.md`.

## Non-Functional
Offline-by-default; temp outputs in `/tmp` or `PDF_FORGE_TMP`; minimal logging; explicit routes per operation.

## Tooling
Dockerfile, CI (pytest), Makefile targets, Postman collection, minimal web UI at `/ui`.

## Risks & Notes
- OCR depends on language packs for quality.
- PDF/A conversion success varies by input; sanitize via pikepdf if needed.
- Redaction implemented with PyMuPDF removes underlying content; validate for regulated use.
