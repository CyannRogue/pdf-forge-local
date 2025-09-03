from fastapi import APIRouter, UploadFile, File, Form
from typing import Optional
from app.services.forms_service import list_fields, fill_fields

router = APIRouter()

@router.post("/list")
async def forms_list(file: UploadFile = File(...)):
    p = f"/tmp/{file.filename}"
    with open(p, "wb") as w:
        w.write(await file.read())
    return {"fields": list_fields(p)}

@router.post("/fill")
async def forms_fill(
    file: UploadFile = File(...),
    data_json: str = Form(...),
    flatten: bool = Form(True),
    outfile: str = Form("filled.pdf")
):
    p = f"/tmp/{file.filename}"
    with open(p, "wb") as w:
        w.write(await file.read())
    out = f"/tmp/{outfile}"
    fill_fields(p, out, data_json=data_json, flatten=flatten)
    return {"outfile": out}
