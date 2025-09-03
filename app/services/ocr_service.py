import subprocess


def ocr_pdf(in_pdf, out_pdf, lang="eng"):
    # Requires: pip install ocrmypdf; apt: tesseract-ocr, ghostscript
    subprocess.run(
        ["ocrmypdf", "--skip-text", f"--language={lang}", in_pdf, out_pdf],
        check=True
    )
