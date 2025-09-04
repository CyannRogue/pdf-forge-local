from fastapi import APIRouter, UploadFile, File, Form, Request
from typing import Optional
from app.services.redaction_service import redact_texts, redact_boxes
from app.utils import save_upload_stream, sanitize_filename
from app.config import TMP_DIR
from app.errors import ok_json

router = APIRouter()

@router.post("/texts")
async def redact_by_texts(
    request: Request,
    file: UploadFile = File(...),
    texts: str = Form(...),  # comma-separated strings to redact
    outfile: str = Form("redacted.pdf")
):
    p = await save_upload_stream(file)
    out = TMP_DIR / sanitize_filename(outfile or "redacted.pdf")
    redact_texts(str(p), str(out), [t.strip() for t in texts.split(",") if t.strip()])
    return ok_json(request, {"outfile": str(out)})

@router.post("/boxes")
async def redact_by_boxes(
    request: Request,
    file: UploadFile = File(...),
    boxes_json: str = Form(...),  # [{"page":1,"x1":10,"y1":10,"x2":200,"y2":40},...]
    outfile: str = Form("redacted.pdf")
):
    p = await save_upload_stream(file)
    out = TMP_DIR / sanitize_filename(outfile or "redacted.pdf")
    redact_boxes(str(p), str(out), boxes_json)
    return ok_json(request, {"outfile": str(out)})
