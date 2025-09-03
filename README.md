# PDF Forge Local

Local-only Python toolkit to handle PDFs — convert, merge, split, OCR, secure, and extract.  
Runs offline in GitHub Codespaces or any Python 3.11+ environment.

---

## Setup

1) Open in Codespaces (GitHub → Code → “Create codespace on main”).

2) Install system packages:
```bash
sudo apt-get update && \
sudo apt-get install -y tesseract-ocr poppler-utils ghostscript
```

3. Install Python deps:

```bash
pip install -r requirements.txt
```

---

## Run

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

Codespaces → Ports → make **8000** public → open.
Interactive API docs: `/docs`

---

## CLI

```bash
python cli.py merge --out merged.pdf file1.pdf file2.pdf
```

---

## Modules

* **Organize**: merge, split, extract/delete/reorder pages.
* **Convert**: PDF ↔ images, images → PDF.
* **OCR**: scanned PDFs → searchable (Tesseract via ocrmypdf).
* **Secure**: encrypt/decrypt with passwords.
* **Extract**: text (pdfminer.six).
* **Files**: list and download outputs from `/tmp`.

- **Metadata**: get/set doc info, list/add bookmarks.
- **Forms**: list fields, fill (JSON), optional flatten.
- **Redact**: text search and box redaction (content removal).
- **Compliance**: PDF/A conversion (Ghostscript), linearize.

All processing is local. No cloud calls.

