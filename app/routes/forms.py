from typing import Optional

from fastapi import APIRouter, File, Form, Request, UploadFile

from app.config import TMP_DIR
from app.errors import ok_json
from app.services.forms_service import fill_fields, list_fields
from app.utils import ensure_pdf, sanitize_filename, save_upload_stream

router = APIRouter()


@router.post("/list")
async def forms_list(request: Request, file: UploadFile = File(...)):
    ensure_pdf(file.filename)
    p = await save_upload_stream(file)
    return ok_json(request, {"fields": list_fields(str(p))})


@router.post("/fill")
async def forms_fill(
    request: Request,
    file: UploadFile = File(...),
    data_json: str = Form(...),
    flatten: bool = Form(True),
    outfile: str = Form("filled.pdf"),
):
    ensure_pdf(file.filename)
    p = await save_upload_stream(file)
    out = TMP_DIR / sanitize_filename(outfile or "filled.pdf")
    fill_fields(str(p), str(out), data_json=data_json, flatten=bool(flatten))
    return ok_json(request, {"outfile": str(out)})
