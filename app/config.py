import os
from pathlib import Path

TMP_DIR = Path(os.environ.get("PDF_FORGE_TMP", "/tmp"))
TMP_DIR.mkdir(parents=True, exist_ok=True)
