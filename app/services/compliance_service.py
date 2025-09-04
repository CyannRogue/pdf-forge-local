import shutil
import subprocess
import pikepdf
from app.errors import dependency_missing, unprocessable

def to_pdfa(in_pdf: str, out_pdf: str, level: str = "PDF/A-2B"):
    # Requires Ghostscript
    # Common levels: PDF/A-1B, PDF/A-2B
    if not shutil.which("gs"):
        raise dependency_missing(["ghostscript"])
    level_map = {
        "PDF/A-1B": "1",
        "PDF/A-2B": "2",
    }
    ver = level_map.get(level.upper(), "2")
    args = [
        "gs", "-dPDFA", f"-dPDFACompatibilityPolicy=1",
        "-dNOPAUSE", "-dBATCH", "-sDEVICE=pdfwrite",
        f"-sOutputFile={out_pdf}",
        f"-dPDFA={ver}",
        "-dUseCIEColor",
        in_pdf
    ]
    try:
        subprocess.run(args, check=True, capture_output=True)
    except subprocess.CalledProcessError as e:
        raise unprocessable("PDF/A conversion failed", {"returncode": e.returncode})

def linearize_pdf(in_pdf: str, out_pdf: str):
    with pikepdf.open(in_pdf) as pdf:
        pdf.save(out_pdf, linearize=True)
