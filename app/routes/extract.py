from fastapi import APIRouter, UploadFile, File
from app.services.extract_service import extract_text_simple

router = APIRouter()

@router.post("/text")
async def extract_text(file: UploadFile = File(...)):
    p = f"/tmp/{file.filename}"
    with open(p, "wb") as w:
        w.write(await file.read())
    txt = extract_text_simple(p)
    # Truncate very large outputs to keep responses reasonable
    return {"text": txt[:100000]}
