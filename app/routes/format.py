from fastapi import APIRouter, File, Form, Request, UploadFile

from app.config import TMP_DIR
from app.errors import bad_request, ok_json
from app.services.format_service import (add_page_numbers, add_text_watermark,
                                         compress_pdf)
from app.utils import ensure_pdf, sanitize_filename, save_upload_stream

router = APIRouter()


@router.post("/watermark")
async def watermark(
    request: Request,
    file: UploadFile = File(...),
    text: str = Form(...),
    outfile: str = Form("watermarked.pdf"),
    opacity: float = Form(0.15),
    angle: float = Form(45.0),
    size: int = Form(48),
):
    ensure_pdf(file.filename)
    p = await save_upload_stream(file)
    out = TMP_DIR / sanitize_filename(outfile or "watermarked.pdf")
    add_text_watermark(
        str(p),
        str(out),
        text=text,
        opacity=float(opacity),
        angle=float(angle),
        font_size=int(size),
    )
    return ok_json(request, {"outfile": str(out)})


@router.post("/page-numbers")
async def page_numbers(
    request: Request,
    file: UploadFile = File(...),
    outfile: str = Form("numbered.pdf"),
    position: str = Form("bottom-right"),
    start: int = Form(1),
):
    ensure_pdf(file.filename)
    p = await save_upload_stream(file)
    out = TMP_DIR / sanitize_filename(outfile or "numbered.pdf")
    add_page_numbers(str(p), str(out), position=position, start=int(start))
    return ok_json(request, {"outfile": str(out)})


@router.post("/compress")
async def compress(
    request: Request,
    file: UploadFile = File(...),
    outfile: str = Form("compressed.pdf"),
    image_quality: float = Form(0.6),
):
    q = float(image_quality)
    if not (0.1 <= q <= 1.0):
        raise bad_request("image_quality must be between 0.1 and 1.0")
    ensure_pdf(file.filename)
    p = await save_upload_stream(file)
    out = TMP_DIR / sanitize_filename(outfile or "compressed.pdf")
    compress_pdf(str(p), str(out), image_quality=q)
    return ok_json(request, {"outfile": str(out)})
