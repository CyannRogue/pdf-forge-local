import img2pdf, os, shutil
from pdf2image import convert_from_path
from app.errors import dependency_missing
from app.config import TMP_DIR


def images_to_pdf(image_paths, out_path):
    with open(out_path, "wb") as f:
        f.write(img2pdf.convert(image_paths))


def pdf_to_images(pdf_path, dpi=200):
    # Ensure poppler is available (pdftoppm or pdftocairo)
    if not (shutil.which("pdftoppm") or shutil.which("pdftocairo")):
        raise dependency_missing(["poppler-utils"])
    pages = convert_from_path(pdf_path, dpi=dpi)
    out = []
    base = os.path.splitext(os.path.basename(pdf_path))[0]
    for i, page in enumerate(pages, 1):
        p = str(TMP_DIR / f"{base}_p{i}.png")
        page.save(p, "PNG")
        out.append(p)
    return out
