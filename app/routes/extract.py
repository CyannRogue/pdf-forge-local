from typing import Optional

from fastapi import APIRouter, File, Form, Request, UploadFile

from app.config import TMP_DIR
from app.errors import ok_json
from app.services.extract_service import extract_tables, extract_text_simple
from app.utils import ensure_pdf, sanitize_filename, save_upload_stream

router = APIRouter()


@router.post("/text")
async def extract_text(request: Request, file: UploadFile = File(...)):
    ensure_pdf(file.filename)
    p = await save_upload_stream(file)
    txt = extract_text_simple(str(p))
    truncated = False
    if len(txt) > 100000:
        truncated = True
        txt = txt[:100000]
    return ok_json(request, {"text": txt, "detail": {"truncated": truncated}})


@router.post("/tables")
async def tables(
    request: Request,
    file: UploadFile = File(...),
    max_pages: int = Form(10),
    outfile_prefix: str = Form("table"),
):
    ensure_pdf(file.filename)
    p = await save_upload_stream(file)
    clamped = max(1, min(int(max_pages), 500))
    outputs = extract_tables(str(p), max_pages=clamped, basename=outfile_prefix)
    detail = {}
    if max_pages > 500:
        detail = {"warning": "max_pages clamped to 500", "max_pages": 500}
    return ok_json(request, {"tables": outputs, "detail": detail})
