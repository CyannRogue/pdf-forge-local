from fastapi import APIRouter, UploadFile, File, Form
from typing import List
from app.services.convert_service import images_to_pdf, pdf_to_images

router = APIRouter()

@router.post("/images-to-pdf")
async def images_to_pdf_ep(files: List[UploadFile] = File(...), outfile: str = Form("images.pdf")):
    paths = []
    for f in files:
        p = f"/tmp/{f.filename}"
        with open(p, "wb") as w:
            w.write(await f.read())
        paths.append(p)
    out = f"/tmp/{outfile}"
    images_to_pdf(paths, out)
    return {"outfile": out}

@router.post("/pdf-to-images")
async def pdf_to_images_ep(file: UploadFile = File(...), dpi: int = Form(200)):
    p = f"/tmp/{file.filename}"
    with open(p, "wb") as w:
        w.write(await file.read())
    outputs = pdf_to_images(p, dpi=dpi)
    return {"images": outputs}
