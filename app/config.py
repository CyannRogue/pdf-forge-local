import os
from pathlib import Path
from typing import List


def _csv(value: str) -> List[str]:
    return [x.strip() for x in value.split(",") if x.strip()]


PDF_FORGE_TMP = os.environ.get("PDF_FORGE_TMP", "/tmp")
TMP_DIR = Path(PDF_FORGE_TMP)
TMP_DIR.mkdir(parents=True, exist_ok=True)

MAX_UPLOAD_MB = int(os.environ.get("MAX_UPLOAD_MB", "100"))
LOG_LEVEL = os.environ.get("LOG_LEVEL", "INFO").upper()
ALLOWED_ORIGINS = os.environ.get("ALLOWED_ORIGINS", "*")
UI_THUMBNAIL_DPI = int(os.environ.get("UI_THUMBNAIL_DPI", "120"))
OCR_LANG_DEFAULT = os.environ.get("OCR_LANG_DEFAULT", "eng")
REQUEST_TIMEOUT_SECS = int(os.environ.get("REQUEST_TIMEOUT_SECS", "300"))

# Concurrency guards (for heavy ops)
OCR_CONCURRENCY = int(os.environ.get("OCR_CONCURRENCY", "2"))
PDFA_CONCURRENCY = int(os.environ.get("PDFA_CONCURRENCY", "2"))
