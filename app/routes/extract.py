from fastapi import APIRouter, UploadFile, File, Form, Request
from typing import Optional
from app.services.extract_service import extract_text_simple, extract_tables
from app.utils import save_upload_stream, sanitize_filename
from app.config import TMP_DIR
from app.errors import ok_json

router = APIRouter()

@router.post("/text")
async def extract_text(request: Request, file: UploadFile = File(...)):
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
    outfile_prefix: str = Form("table")
):
    p = await save_upload_stream(file)
    outputs = extract_tables(str(p), max_pages=max_pages, basename=outfile_prefix)
    return ok_json(request, {"tables": outputs})
