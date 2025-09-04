import io
from typing import Tuple

import pikepdf
from pypdf import PdfReader, PdfWriter
from reportlab.lib.colors import Color
from reportlab.lib.units import inch
from reportlab.pdfgen import canvas

from app.utils import sanitize_text


def _make_watermark(
    page_width: float,
    page_height: float,
    text: str,
    opacity: float,
    angle: float,
    font_size: int,
) -> bytes:
    buf = io.BytesIO()
    c = canvas.Canvas(buf, pagesize=(page_width, page_height))
    c.saveState()
    c.translate(page_width / 2, page_height / 2)
    c.rotate(angle)
    # opacity via fill alpha in reportlab: emulate with light color
    alpha = max(0.0, min(opacity, 1.0))
    color = Color(0, 0, 0, alpha=alpha)
    c.setFillColor(color)
    c.setFont("Helvetica-Bold", font_size)
    c.drawCentredString(0, 0, text)
    c.restoreState()
    c.showPage()
    c.save()
    return buf.getvalue()


def add_text_watermark(
    in_pdf: str,
    out_pdf: str,
    text: str,
    opacity: float = 0.15,
    angle: float = 45.0,
    font_size: int = 48,
):
    r = PdfReader(in_pdf)
    w = PdfWriter()
    for page in r.pages:
        pw = float(page.mediabox.width)
        ph = float(page.mediabox.height)
        wm_pdf = _make_watermark(pw, ph, sanitize_text(text), opacity, angle, font_size)
        wm_reader = PdfReader(io.BytesIO(wm_pdf))
        # Merge watermark onto page 0 of wm
        page.merge_page(wm_reader.pages[0])
        w.add_page(page)
    with open(out_pdf, "wb") as f:
        w.write(f)


def _number_position(pw: float, ph: float, position: str) -> Tuple[float, float]:
    margin = 0.5 * inch
    if position == "bottom-left":
        return (margin, margin)
    if position == "bottom-right":
        return (pw - margin, margin)
    if position == "top-left":
        return (margin, ph - margin)
    if position == "top-right":
        return (pw - margin, ph - margin)
    # default: bottom-center
    return (pw / 2, 0.5 * inch)


def add_page_numbers(
    in_pdf: str, out_pdf: str, position: str = "bottom-right", start: int = 1
):
    r = PdfReader(in_pdf)
    w = PdfWriter()
    num = start
    for page in r.pages:
        pw = float(page.mediabox.width)
        ph = float(page.mediabox.height)
        buf = io.BytesIO()
        c = canvas.Canvas(buf, pagesize=(pw, ph))
        x, y = _number_position(pw, ph, position)
        c.setFont("Helvetica", 10)
        # right-align if right positions
        if "right" in position:
            c.drawRightString(x, y, str(num))
        elif "center" in position:
            c.drawCentredString(x, y, str(num))
        else:
            c.drawString(x, y, str(num))
        c.showPage()
        c.save()
        overlay = PdfReader(io.BytesIO(buf.getvalue()))
        page.merge_page(overlay.pages[0])
        w.add_page(page)
        num += 1
    with open(out_pdf, "wb") as f:
        w.write(f)


def compress_pdf(in_pdf: str, out_pdf: str, image_quality: float = 0.6):
    quality = max(0.1, min(image_quality, 1.0))
    with pikepdf.open(in_pdf) as pdf:
        pdf.save(
            out_pdf,
            linearize=True,
            # optimize_images supported by recent pikepdf; fallbacks are acceptable runtime errors if not supported
            optimize_images=True,
            image_quality=quality,
        )
