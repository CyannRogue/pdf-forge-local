from fastapi import APIRouter, UploadFile, File, Form
from typing import Optional
from app.services.redaction_service import redact_texts, redact_boxes

router = APIRouter()

@router.post("/texts")
async def redact_by_texts(
    file: UploadFile = File(...),
    texts: str = Form(...),  # comma-separated strings to redact
    outfile: str = Form("redacted.pdf")
):
    p = f"/tmp/{file.filename}"
    with open(p, "wb") as w:
        w.write(await file.read())
    out = f"/tmp/{outfile}"
    redact_texts(p, out, [t.strip() for t in texts.split(",") if t.strip()])
    return {"outfile": out}

@router.post("/boxes")
async def redact_by_boxes(
    file: UploadFile = File(...),
    boxes_json: str = Form(...),  # [{"page":1,"x1":10,"y1":10,"x2":200,"y2":40},...]
    outfile: str = Form("redacted.pdf")
):
    p = f"/tmp/{file.filename}"
    with open(p, "wb") as w:
        w.write(await file.read())
    out = f"/tmp/{outfile}"
    redact_boxes(p, out, boxes_json)
    return {"outfile": out}
