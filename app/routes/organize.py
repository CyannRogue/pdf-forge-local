from fastapi import APIRouter, UploadFile, File, Form
from typing import List
from app.services.organize_service import merge_pdfs, split_pdf, extract_pages, delete_pages

router = APIRouter()

@router.post("/merge")
async def merge(files: List[UploadFile] = File(...), outfile: str = Form("merged.pdf")):
    paths = []
    for f in files:
        p = f"/tmp/{f.filename}"
        with open(p, "wb") as w:
            w.write(await f.read())
        paths.append(p)
    out = f"/tmp/{outfile}"
    merge_pdfs(paths, out)
    return {"outfile": out}

@router.post("/split")
async def split(file: UploadFile = File(...), ranges: str = Form(...)):
    """
    ranges example: "1-3,7,10-12" or multiple groups separated by ';' for multiple outputs.
    """
    p = f"/tmp/{file.filename}"
    with open(p, "wb") as w:
        w.write(await file.read())
    outputs = split_pdf(p, ranges)
    return {"outputs": outputs}

@router.post("/extract-pages")
async def extract(file: UploadFile = File(...), ranges: str = Form(...), outfile: str = Form("extract.pdf")):
    p = f"/tmp/{file.filename}"
    with open(p, "wb") as w:
        w.write(await file.read())
    out = f"/tmp/{outfile}"
    extract_pages(p, ranges, out)
    return {"outfile": out}

@router.post("/delete-pages")
async def delete(file: UploadFile = File(...), ranges: str = Form(...), outfile: str = Form("pruned.pdf")):
    p = f"/tmp/{file.filename}"
    with open(p, "wb") as w:
        w.write(await file.read())
    out = f"/tmp/{outfile}"
    delete_pages(p, ranges, out)
    return {"outfile": out}
