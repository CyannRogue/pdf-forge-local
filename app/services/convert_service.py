import img2pdf, os
from pdf2image import convert_from_path


def images_to_pdf(image_paths, out_path):
    with open(out_path, "wb") as f:
        f.write(img2pdf.convert(image_paths))


def pdf_to_images(pdf_path, dpi=200):
    pages = convert_from_path(pdf_path, dpi=dpi)
    out = []
    base = os.path.splitext(os.path.basename(pdf_path))[0]
    for i, page in enumerate(pages, 1):
        p = f"/tmp/{base}_p{i}.png"
        page.save(p, "PNG")
        out.append(p)
    return out
