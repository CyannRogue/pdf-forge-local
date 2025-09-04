# Security Model

- Local-only processing; no external network calls by design.
- Temp directory: `/tmp` (override via `PDF_FORGE_TMP`).
- Passwords are accepted via form fields and never logged.
- Redaction uses PyMuPDF `add_redact_annot` + `apply_redactions()` + `save(clean=True, garbage=3)` to remove underlying content.
- PDF/A conversion uses Ghostscript; verify outputs if compliance is critical.
- Consider running in a container with a bind-mounted temp dir for isolation.
- Filenames are sanitized to basenames and restricted to `[A-Za-z0-9_.-]` characters; outputs are always written inside `PDF_FORGE_TMP`.
- Standardized error responses include `request_id` for incident correlation.
- Rate limiting: OCR and PDF/A operations are guarded with semaphores. When saturated, API returns `429` with `Retry-After` header and standard error JSON including `detail.retry_after`.
