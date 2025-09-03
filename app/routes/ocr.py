from fastapi import APIRouter, UploadFile, File, Form
from app.services.ocr_service import ocr_pdf

router = APIRouter()

@router.post("/searchable")
async def make_searchable(file: UploadFile = File(...), lang: str = Form("eng"), outfile: str = Form("searchable.pdf")):
    p = f"/tmp/{file.filename}"
    with open(p, "wb") as w:
        w.write(await file.read())
    out = f"/tmp/{outfile}"
    ocr_pdf(p, out, lang=lang)
    return {"outfile": out}
