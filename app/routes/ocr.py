from fastapi import APIRouter, UploadFile, File, Form, Request
from app.services.ocr_service import ocr_pdf
from app.config import TMP_DIR, OCR_LANG_DEFAULT, REQUEST_TIMEOUT_SECS
from app.utils import save_upload_stream, sanitize_filename, run_with_timeout
from app.errors import ok_json
from app.guards import ocr_guard

router = APIRouter()

@router.post("/searchable")
async def make_searchable(request: Request, file: UploadFile = File(...), lang: str = Form(None), outfile: str = Form("searchable.pdf")):
    p = await save_upload_stream(file)
    out = TMP_DIR / sanitize_filename(outfile or "searchable.pdf")
    use_lang = (lang or OCR_LANG_DEFAULT)
    async with ocr_guard():
        await run_with_timeout(ocr_pdf, str(p), str(out), lang=use_lang)
    return ok_json(request, {"outfile": str(out)})
