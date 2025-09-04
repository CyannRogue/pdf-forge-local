from pypdf import PdfReader, PdfWriter
from app.config import TMP_DIR


def _parse_ranges(ranges: str, max_page: int):
    pages = set()
    for part in ranges.split(","):
        part = part.strip()
        if not part:
            continue
        if "-" in part:
            a, b = part.split("-")
            a, b = int(a), int(b)
            if a > b:
                a, b = b, a
            for i in range(a - 1, b):
                if 0 <= i < max_page:
                    pages.add(i)
        else:
            i = int(part) - 1
            if 0 <= i < max_page:
                pages.add(i)
    return sorted(pages)

def merge_pdfs(paths, out_path):
    writer = PdfWriter()
    for p in paths:
        r = PdfReader(p)
        for page in r.pages:
            writer.add_page(page)
    with open(out_path, "wb") as f:
        writer.write(f)

def split_pdf(path, ranges):
    r = PdfReader(path)
    maxp = len(r.pages)
    groups = [g.strip() for g in ranges.split(";")] if ";" in ranges else [ranges]
    outputs = []
    for idx, g in enumerate(groups, 1):
        pages = _parse_ranges(g, maxp)
        if not pages:
            raise ValueError("No pages selected")
        w = PdfWriter()
        for i in pages:
            w.add_page(r.pages[i])
        out = str(TMP_DIR / f"split_{idx}.pdf")
        with open(out, "wb") as f:
            w.write(f)
        outputs.append(out)
    return outputs

def extract_pages(path, ranges, out_path):
    r = PdfReader(path)
    pages = _parse_ranges(ranges, len(r.pages))
    if not pages:
        raise ValueError("No pages selected")
    w = PdfWriter()
    for i in pages:
        w.add_page(r.pages[i])
    with open(out_path, "wb") as f:
        w.write(f)

def delete_pages(path, ranges, out_path):
    r = PdfReader(path)
    remove = set(_parse_ranges(ranges, len(r.pages)))
    w = PdfWriter()
    for i, pg in enumerate(r.pages):
        if i not in remove:
            w.add_page(pg)
    with open(out_path, "wb") as f:
        w.write(f)

def reorder_pages(path: str, order: list[int], out_path: str):
    r = PdfReader(path)
    maxp = len(r.pages)
    if not order:
        raise ValueError("Order is empty")
    if any(i < 1 or i > maxp for i in order):
        raise ValueError("Order contains out of bounds indices")
    w = PdfWriter()
    for i in order:
        w.add_page(r.pages[i - 1])
    with open(out_path, "wb") as f:
        w.write(f)
