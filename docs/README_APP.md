# PDF Forge Local — App Guide

This service exposes a local-only PDF toolkit with a REST API and a visual, button‑driven single-page web UI.

Key facts:
- Version: 0.3.0
- All processing is local; no outbound network calls.
- Feature Launcher: `/`. Organizer: `/organizer`. Editor: `/editor/upload` → `/editor/workspace`. Legacy Workbench at `/ui`. OpenAPI docs at `/docs`.

Configuration (env):
- `PDF_FORGE_TMP` (default `/tmp`) — temp/output directory.
- `MAX_UPLOAD_MB` (default `100`) — per-file upload limit.
- `LOG_LEVEL` (default `INFO`) — logging level.
- `ALLOWED_ORIGINS` (default `*`) — CORS CSV list.
- `UI_THUMBNAIL_DPI` (default `120`) — used by UI for thumbnails.
- `OCR_LANG_DEFAULT` (default `eng`) — OCR default.
- `REQUEST_TIMEOUT_SECS` (default `300`) — timeout for heavy ops.
- `OCR_CONCURRENCY` (default `2`) — max concurrent OCR tasks.
- `PDFA_CONCURRENCY` (default `2`) — max concurrent PDF/A tasks.

Error model:
All non-2xx responses return:
```
{
  "error": {
    "code": "UPPER_SNAKE",
    "message": "...",
    "detail": { ... },
    "hint": "...",
    "request_id": "uuid"
  }
}
```

Success responses include `request_id` alongside payload.

Logging:
- JSON lines to stdout with: `timestamp`, `level`, `event`, `request_id`, `route`, `elapsed_ms`, `status`.

System dependencies:
- `tesseract-ocr`, `poppler-utils`, `ghostscript`.
Missing dependencies return `422` with `code="DEPENDENCY_MISSING"` and `detail.missing`.

UI Navigation:
- `/` — Launcher with feature cards (Merge, Organize, Split, Compress, OCR, Convert, Protect/Unlock, Redact, Edit, Workflows).
- `/organizer` — Drag to reorder pages, delete, split points, compress preset buttons, OCR toggle; downloads appear after actions.
- `/editor/upload` → `/editor/workspace` — Upload then annotate (example rectangles) and Save.
- `/ui` — legacy Workbench still available.

Screenshots (suggested)
- Launcher grid, Organizer page grid with thumbnails and buttons, Editor workspace with toolbar.
