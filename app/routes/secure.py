from fastapi import APIRouter, File, Form, Request, UploadFile

from app.config import TMP_DIR
from app.errors import bad_request, ok_json
from app.services.secure_service import decrypt_pdf, encrypt_pdf
from app.utils import sanitize_filename, save_upload_stream

router = APIRouter()


@router.post("/encrypt")
async def encrypt(
    request: Request,
    file: UploadFile = File(...),
    password: str = Form(...),
    outfile: str = Form("locked.pdf"),
):
    if not password:
        raise bad_request("password must be non-empty")
    p = await save_upload_stream(file)
    out = TMP_DIR / sanitize_filename(outfile or "locked.pdf")
    encrypt_pdf(str(p), str(out), password)
    return ok_json(request, {"outfile": str(out)})


@router.post("/decrypt")
async def decrypt(
    request: Request,
    file: UploadFile = File(...),
    password: str = Form(...),
    outfile: str = Form("unlocked.pdf"),
):
    if not password:
        raise bad_request("password must be non-empty")
    p = await save_upload_stream(file)
    out = TMP_DIR / sanitize_filename(outfile or "unlocked.pdf")
    decrypt_pdf(str(p), str(out), password)
    return ok_json(request, {"outfile": str(out)})
