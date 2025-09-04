from fastapi import APIRouter, UploadFile, File, Form, Request
from app.services.secure_service import encrypt_pdf, decrypt_pdf
from app.config import TMP_DIR
from app.utils import save_upload_stream, sanitize_filename
from app.errors import ok_json, bad_request

router = APIRouter()

@router.post("/encrypt")
async def encrypt(request: Request, file: UploadFile = File(...), password: str = Form(...), outfile: str = Form("locked.pdf")):
    if not password:
        raise bad_request("password must be non-empty")
    p = await save_upload_stream(file)
    out = TMP_DIR / sanitize_filename(outfile or "locked.pdf")
    encrypt_pdf(str(p), str(out), password)
    return ok_json(request, {"outfile": str(out)})

@router.post("/decrypt")
async def decrypt(request: Request, file: UploadFile = File(...), password: str = Form(...), outfile: str = Form("unlocked.pdf")):
    if not password:
        raise bad_request("password must be non-empty")
    p = await save_upload_stream(file)
    out = TMP_DIR / sanitize_filename(outfile or "unlocked.pdf")
    decrypt_pdf(str(p), str(out), password)
    return ok_json(request, {"outfile": str(out)})
