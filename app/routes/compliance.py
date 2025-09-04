from fastapi import APIRouter, UploadFile, File, Form, Request
from app.services.compliance_service import to_pdfa, linearize_pdf
from app.utils import save_upload_stream, sanitize_filename, run_with_timeout
from app.config import TMP_DIR
from app.errors import ok_json
from app.guards import pdfa_guard

router = APIRouter()

@router.post("/pdfa")
async def pdfa(
    request: Request,
    file: UploadFile = File(...),
    level: str = Form("PDF/A-2B"),
    outfile: str = Form("pdfa.pdf")
):
    p = await save_upload_stream(file)
    out = TMP_DIR / sanitize_filename(outfile or "pdfa.pdf")
    async with pdfa_guard():
        await run_with_timeout(to_pdfa, str(p), str(out), level=level)
    return ok_json(request, {"outfile": str(out)})

@router.post("/linearize")
async def linearize(
    request: Request,
    file: UploadFile = File(...),
    outfile: str = Form("linearized.pdf")
):
    p = await save_upload_stream(file)
    out = TMP_DIR / sanitize_filename(outfile or "linearized.pdf")
    await run_with_timeout(linearize_pdf, str(p), str(out))
    return ok_json(request, {"outfile": str(out)})
