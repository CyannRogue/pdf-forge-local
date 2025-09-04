from fastapi import APIRouter, UploadFile, File, Form, Request
from typing import Optional
from app.services.forms_service import list_fields, fill_fields
from app.utils import save_upload_stream, sanitize_filename
from app.config import TMP_DIR
from app.errors import ok_json

router = APIRouter()

@router.post("/list")
async def forms_list(request: Request, file: UploadFile = File(...)):
    p = await save_upload_stream(file)
    return ok_json(request, {"fields": list_fields(str(p))})

@router.post("/fill")
async def forms_fill(
    request: Request,
    file: UploadFile = File(...),
    data_json: str = Form(...),
    flatten: bool = Form(True),
    outfile: str = Form("filled.pdf")
):
    p = await save_upload_stream(file)
    out = TMP_DIR / sanitize_filename(outfile or "filled.pdf")
    fill_fields(str(p), str(out), data_json=data_json, flatten=bool(flatten))
    return ok_json(request, {"outfile": str(out)})
