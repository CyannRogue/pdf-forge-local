import shutil
import subprocess
from app.errors import dependency_missing, unprocessable


def ocr_pdf(in_pdf, out_pdf, lang="eng"):
    # Requires: pip install ocrmypdf; apt: tesseract-ocr, ghostscript
    missing = []
    if not shutil.which("tesseract"):
        missing.append("tesseract")
    if not shutil.which("ocrmypdf"):
        missing.append("ocrmypdf")
    if not shutil.which("gs"):
        missing.append("ghostscript")
    if missing:
        raise dependency_missing(missing)
    try:
        subprocess.run(
            ["ocrmypdf", "--skip-text", f"--language={lang}", in_pdf, out_pdf],
            check=True,
            capture_output=True,
        )
    except subprocess.CalledProcessError as e:
        raise unprocessable("OCR failed", {"returncode": e.returncode})
