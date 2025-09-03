from fastapi import APIRouter, UploadFile, File, Form
from app.services.compliance_service import to_pdfa, linearize_pdf

router = APIRouter()

@router.post("/pdfa")
async def pdfa(
    file: UploadFile = File(...),
    level: str = Form("PDF/A-2B"),
    outfile: str = Form("pdfa.pdf")
):
    p = f"/tmp/{file.filename}"
    with open(p, "wb") as w: w.write(await file.read())
    out = f"/tmp/{outfile}"
    to_pdfa(p, out, level=level)
    return {"outfile": out}

@router.post("/linearize")
async def linearize(
    file: UploadFile = File(...),
    outfile: str = Form("linearized.pdf")
):
    p = f"/tmp/{file.filename}"
    with open(p, "wb") as w: w.write(await file.read())
    out = f"/tmp/{outfile}"
    linearize_pdf(p, out)
    return {"outfile": out}
