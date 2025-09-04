from fastapi import APIRouter, File, Form, Request, UploadFile

from app.config import OCR_LANG_DEFAULT, REQUEST_TIMEOUT_SECS, TMP_DIR
from app.errors import ok_json
from app.guards import ocr_guard
from app.services.ocr_service import ocr_pdf
from app.utils import (ensure_pdf, run_with_timeout, sanitize_filename,
                       save_upload_stream)

router = APIRouter()


@router.post("/searchable")
async def make_searchable(
    request: Request,
    file: UploadFile = File(...),
    lang: str = Form(None),
    outfile: str = Form("searchable.pdf"),
):
    ensure_pdf(file.filename)
    p = await save_upload_stream(file)
    out = TMP_DIR / sanitize_filename(outfile or "searchable.pdf")
    use_lang = lang or OCR_LANG_DEFAULT
    async with ocr_guard():
        await run_with_timeout(ocr_pdf, str(p), str(out), lang=use_lang)
    return ok_json(request, {"outfile": str(out)})
