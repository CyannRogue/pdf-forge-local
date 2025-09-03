from app.services.metadata_service import set_metadata, get_metadata
from app.services.organize_service import merge_pdfs
import os

def test_set_and_get_metadata(tmp_path):
    # Create a tiny PDF
    from pypdf import PdfWriter
    p = tmp_path / "in.pdf"
    w = PdfWriter()
    w.add_blank_page(width=200, height=200)
    with open(p, "wb") as f:
        w.write(f)

    out = tmp_path / "out.pdf"
    set_metadata(str(p), str(out), title="T", author="A", subject="S", keywords="K")
    info = get_metadata(str(out))
    assert info["title"] == "T"
    assert info["author"] == "A"
    assert info["subject"] == "S"
    assert info["keywords"] == "K"
