import json

import fitz  # PyMuPDF

from app.errors import bad_request, unprocessable


def redact_texts(pdf_in: str, pdf_out: str, needles: list[str]):
    if not needles:
        raise unprocessable("Redaction search list is empty")
    doc = fitz.open(pdf_in)
    for page in doc:
        for text in needles:
            rects = page.search_for(text, hit_max=0)
            for r in rects:
                page.add_redact_annot(r, fill=(0, 0, 0))
        page.apply_redactions()
    doc.save(pdf_out, deflate=True, garbage=3, clean=True)
    doc.close()


def redact_boxes(pdf_in: str, pdf_out: str, boxes_json: str):
    try:
        boxes = json.loads(boxes_json)
    except Exception:
        raise bad_request("boxes_json must be a valid JSON array")
    if not isinstance(boxes, list):
        raise bad_request("boxes_json must be a JSON array")
    doc = fitz.open(pdf_in)
    for bx in boxes:
        if not all(k in bx for k in ("page", "x1", "y1", "x2", "y2")):
            raise bad_request("box missing required keys")
        if not (bx["x1"] < bx["x2"] and bx["y1"] < bx["y2"]):
            raise bad_request("Invalid box coordinates; require x1<x2 and y1<y2")
        p = bx["page"] - 1
        rect = fitz.Rect(bx["x1"], bx["y1"], bx["x2"], bx["y2"])
        page = doc[p]
        page.add_redact_annot(rect, fill=(0, 0, 0))
    for page in doc:
        page.apply_redactions()
    doc.save(pdf_out, deflate=True, garbage=3, clean=True)
    doc.close()
