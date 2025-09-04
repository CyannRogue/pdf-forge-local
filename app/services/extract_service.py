import csv

import pdfplumber
from pdfminer.high_level import extract_text

from app.config import TMP_DIR
from app.errors import bad_request


def extract_text_simple(pdf_path: str) -> str:
    return extract_text(pdf_path)


def extract_tables(pdf_path: str, max_pages: int = 10, basename: str = "table"):
    outputs = []
    if max_pages < 1:
        raise bad_request("max_pages must be >= 1", {"max_pages": max_pages})
    if max_pages > 500:
        max_pages = 500
    idx = 1
    with pdfplumber.open(pdf_path) as pdf:
        for page_no, page in enumerate(pdf.pages, start=1):
            if page_no > max_pages:
                break
            tables = page.extract_tables()
            for tbl in tables or []:
                out = str(TMP_DIR / f"{basename}_{page_no}_{idx}.csv")
                with open(out, "w", newline="", encoding="utf-8") as f:
                    writer = csv.writer(f)
                    for row in tbl:
                        writer.writerow(
                            [
                                (c or "").strip() if isinstance(c, str) else c
                                for c in row
                            ]
                        )
                outputs.append(out)
                idx += 1
    return outputs
