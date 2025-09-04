from fastapi import APIRouter, UploadFile, File, Form, Request
from typing import List
from app.services.convert_service import images_to_pdf, pdf_to_images
from app.config import TMP_DIR, UI_THUMBNAIL_DPI
from app.utils import save_upload_stream, sanitize_filename
from app.errors import ok_json

router = APIRouter()

@router.post("/images-to-pdf")
async def images_to_pdf_ep(request: Request, files: List[UploadFile] = File(...), outfile: str = Form("images.pdf")):
    paths = []
    for f in files:
        p = await save_upload_stream(f)
        paths.append(str(p))
    out = TMP_DIR / sanitize_filename(outfile or "images.pdf")
    images_to_pdf(paths, str(out))
    return ok_json(request, {"outfile": str(out)})

@router.post("/pdf-to-images")
async def pdf_to_images_ep(request: Request, file: UploadFile = File(...), dpi: int = Form(200)):
    p = await save_upload_stream(file)
    dpi = int(dpi or UI_THUMBNAIL_DPI)
    outputs = pdf_to_images(str(p), dpi=dpi)
    return ok_json(request, {"images": outputs})
