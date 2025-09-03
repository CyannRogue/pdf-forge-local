from fastapi import APIRouter, UploadFile, File, Form
from typing import Optional
from app.services.extract_service import extract_text_simple, extract_tables

router = APIRouter()

@router.post("/text")
async def extract_text(file: UploadFile = File(...)):
    p = f"/tmp/{file.filename}"
    with open(p, "wb") as w:
        w.write(await file.read())
    txt = extract_text_simple(p)
    return {"text": txt[:100000]}

@router.post("/tables")
async def tables(
    file: UploadFile = File(...),
    max_pages: int = Form(10),
    outfile_prefix: str = Form("table")
):
    p = f"/tmp/{file.filename}"
    with open(p, "wb") as w:
        w.write(await file.read())
    outputs = extract_tables(p, max_pages=max_pages, basename=outfile_prefix)
    return {"tables": outputs}
