from fastapi import APIRouter, UploadFile, File, Form
from app.services.format_service import add_text_watermark, add_page_numbers, compress_pdf

router = APIRouter()

@router.post("/watermark")
async def watermark(
    file: UploadFile = File(...),
    text: str = Form(...),
    outfile: str = Form("watermarked.pdf"),
    opacity: float = Form(0.15),
    angle: float = Form(45.0),
    size: int = Form(48)
):
    p = f"/tmp/{file.filename}"
    with open(p, "wb") as w: w.write(await file.read())
    out = f"/tmp/{outfile}"
    add_text_watermark(p, out, text=text, opacity=opacity, angle=angle, font_size=size)
    return {"outfile": out}

@router.post("/page-numbers")
async def page_numbers(
    file: UploadFile = File(...),
    outfile: str = Form("numbered.pdf"),
    position: str = Form("bottom-right"),
    start: int = Form(1)
):
    p = f"/tmp/{file.filename}"
    with open(p, "wb") as w: w.write(await file.read())
    out = f"/tmp/{outfile}"
    add_page_numbers(p, out, position=position, start=start)
    return {"outfile": out}

@router.post("/compress")
async def compress(
    file: UploadFile = File(...),
    outfile: str = Form("compressed.pdf"),
    image_quality: float = Form(0.6)
):
    p = f"/tmp/{file.filename}"
    with open(p, "wb") as w: w.write(await file.read())
    out = f"/tmp/{outfile}"
    compress_pdf(p, out, image_quality=image_quality)
    return {"outfile": out}
