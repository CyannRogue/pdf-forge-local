import subprocess
import pikepdf

def to_pdfa(in_pdf: str, out_pdf: str, level: str = "PDF/A-2B"):
    # Requires Ghostscript
    # Common levels: PDF/A-1B, PDF/A-2B
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
    subprocess.run(args, check=True)

def linearize_pdf(in_pdf: str, out_pdf: str):
    with pikepdf.open(in_pdf) as pdf:
        pdf.save(out_pdf, linearize=True)
