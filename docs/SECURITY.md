# Security Model

- Local-only processing; no external network calls by design.
- Temp directory: `/tmp` (override via `PDF_FORGE_TMP`).
- Passwords are accepted via form fields and never logged.
- Redaction uses PyMuPDF `add_redact_annot` + `apply_redactions()` + `save(clean=True, garbage=3)` to remove underlying content.
- PDF/A conversion uses Ghostscript; verify outputs if compliance is critical.
- Consider running in a container with a bind-mounted temp dir for isolation.
