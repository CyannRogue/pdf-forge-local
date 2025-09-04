from fastapi import APIRouter, File, Form, Request, UploadFile

from app.config import TMP_DIR
from app.errors import ok_json
from app.guards import pdfa_guard
from app.services.compliance_service import linearize_pdf, to_pdfa
from app.utils import (ensure_pdf, run_with_timeout, sanitize_filename,
                       save_upload_stream)

router = APIRouter()


@router.post("/pdfa")
async def pdfa(
    request: Request,
    file: UploadFile = File(...),
    level: str = Form("PDF/A-2B"),
    outfile: str = Form("pdfa.pdf"),
):
    ensure_pdf(file.filename)
    p = await save_upload_stream(file)
    out = TMP_DIR / sanitize_filename(outfile or "pdfa.pdf")
    async with pdfa_guard():
        await run_with_timeout(to_pdfa, str(p), str(out), level=level)
    return ok_json(request, {"outfile": str(out)})


@router.post("/linearize")
async def linearize(
    request: Request,
    file: UploadFile = File(...),
    outfile: str = Form("linearized.pdf"),
):
    ensure_pdf(file.filename)
    p = await save_upload_stream(file)
    out = TMP_DIR / sanitize_filename(outfile or "linearized.pdf")
    await run_with_timeout(linearize_pdf, str(p), str(out))
    return ok_json(request, {"outfile": str(out)})
