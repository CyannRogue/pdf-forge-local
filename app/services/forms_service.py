import json
from pypdf import PdfReader, PdfWriter

def list_fields(pdf_path: str):
    r = PdfReader(pdf_path)
    fields = r.get_fields() or {}
    out = []
    for name, f in fields.items():
        out.append({
            "name": name,
            "type": f.get("/FT"),
            "value": f.get("/V")
        })
    return out

def fill_fields(pdf_in: str, pdf_out: str, data_json: str, flatten: bool = True):
    data = json.loads(data_json)
    r = PdfReader(pdf_in)
    w = PdfWriter()
    w.append_pages_from_reader(r)
    w.update_page_form_field_values(w.pages, data)
    if flatten:
        w.remove_annotations()  # remove all widgets (flatten)
    with open(pdf_out, "wb") as f:
        w.write(f)
