import json
import fitz  # PyMuPDF

def redact_texts(pdf_in: str, pdf_out: str, needles: list[str]):
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
    boxes = json.loads(boxes_json)
    doc = fitz.open(pdf_in)
    for bx in boxes:
        p = bx["page"] - 1
        rect = fitz.Rect(bx["x1"], bx["y1"], bx["x2"], bx["y2"])
        page = doc[p]
        page.add_redact_annot(rect, fill=(0, 0, 0))
    for page in doc:
        page.apply_redactions()
    doc.save(pdf_out, deflate=True, garbage=3, clean=True)
    doc.close()
