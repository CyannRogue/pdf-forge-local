from typing import Any, Dict, List

from pypdf import PdfReader, PdfWriter


def get_metadata(pdf_path: str) -> Dict[str, Any]:
    r = PdfReader(pdf_path)
    info = r.metadata or {}
    return {
        "title": info.get("/Title"),
        "author": info.get("/Author"),
        "subject": info.get("/Subject"),
        "keywords": info.get("/Keywords"),
        "creator": info.get("/Creator"),
        "producer": info.get("/Producer"),
    }


def set_metadata(pdf_in: str, pdf_out: str, **kwargs):
    r = PdfReader(pdf_in)
    w = PdfWriter()
    for p in r.pages:
        w.add_page(p)
    md = {
        k: v
        for k, v in {
            "/Title": kwargs.get("title"),
            "/Author": kwargs.get("author"),
            "/Subject": kwargs.get("subject"),
            "/Keywords": kwargs.get("keywords"),
        }.items()
        if v is not None
    }
    if md:
        w.add_metadata(md)
    with open(pdf_out, "wb") as f:
        w.write(f)


def list_bookmarks(pdf_path: str) -> List[dict]:
    r = PdfReader(pdf_path)
    outline = r.outline if hasattr(r, "outline") else []
    result = []

    def walk(items, level=0):
        for it in items or []:
            if isinstance(it, list):
                walk(it, level + 1)
            else:
                title = getattr(it, "title", None)
                page = (
                    r.get_destination_page_number(it) + 1 if title is not None else None
                )
                result.append({"title": title, "page": page, "level": level})

    walk(outline, 0)
    return result


def add_bookmark(pdf_in: str, pdf_out: str, text: str, page: int):
    r = PdfReader(pdf_in)
    w = PdfWriter()
    for p in r.pages:
        w.add_page(p)
    # 1-based to 0-based
    w.add_outline_item(text=text, page_number=page - 1)
    with open(pdf_out, "wb") as f:
        w.write(f)
