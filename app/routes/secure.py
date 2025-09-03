from fastapi import APIRouter, UploadFile, File, Form
from app.services.secure_service import encrypt_pdf, decrypt_pdf

router = APIRouter()

@router.post("/encrypt")
async def encrypt(file: UploadFile = File(...), password: str = Form(...), outfile: str = Form("locked.pdf")):
    p = f"/tmp/{file.filename}"
    with open(p, "wb") as w:
        w.write(await file.read())
    out = f"/tmp/{outfile}"
    encrypt_pdf(p, out, password)
    return {"outfile": out}

@router.post("/decrypt")
async def decrypt(file: UploadFile = File(...), password: str = Form(...), outfile: str = Form("unlocked.pdf")):
    p = f"/tmp/{file.filename}"
    with open(p, "wb") as w:
        w.write(await file.read())
    out = f"/tmp/{outfile}"
    decrypt_pdf(p, out, password)
    return {"outfile": out}
