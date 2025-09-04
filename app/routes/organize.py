from fastapi import APIRouter, UploadFile, File, Form, Request
from typing import List
from app.services.organize_service import (
    merge_pdfs, split_pdf, extract_pages, delete_pages, reorder_pages
)
from app.config import TMP_DIR
from app.errors import bad_request, ok_json
from app.utils import save_upload_stream, sanitize_filename, require_int_list_csv

router = APIRouter()

@router.post("/merge")
async def merge(request: Request, files: List[UploadFile] = File(...), outfile: str = Form("merged.pdf")):
    paths = []
    for f in files:
        p = await save_upload_stream(f)
        paths.append(str(p))
    out = TMP_DIR / sanitize_filename(outfile or "merged.pdf")
    merge_pdfs(paths, str(out))
    return ok_json(request, {"outfile": str(out)})

@router.post("/split")
async def split(request: Request, file: UploadFile = File(...), ranges: str = Form(...)):
    """
    ranges example: "1-3,7,10-12" or multiple groups separated by ';' for multiple outputs.
    """
    p = await save_upload_stream(file)
    if not ranges or not ranges.strip():
        raise bad_request("ranges is required")
    outputs = split_pdf(str(p), ranges)
    return ok_json(request, {"outputs": outputs})

@router.post("/extract-pages")
async def extract(request: Request, file: UploadFile = File(...), ranges: str = Form(...), outfile: str = Form("extract.pdf")):
    p = await save_upload_stream(file)
    out = TMP_DIR / sanitize_filename(outfile or "extract.pdf")
    extract_pages(str(p), ranges, str(out))
    return ok_json(request, {"outfile": str(out)})

@router.post("/delete-pages")
async def delete(request: Request, file: UploadFile = File(...), ranges: str = Form(...), outfile: str = Form("pruned.pdf")):
    p = await save_upload_stream(file)
    out = TMP_DIR / sanitize_filename(outfile or "pruned.pdf")
    delete_pages(str(p), ranges, str(out))
    return ok_json(request, {"outfile": str(out)})

@router.post("/reorder")
async def reorder(request: Request, file: UploadFile = File(...), order: str = Form(...), outfile: str = Form("reordered.pdf")):
    """
    order: comma-separated 1-based page indices representing the new order.
    Example: "2,3,1,4"
    """
    p = await save_upload_stream(file)
    out = TMP_DIR / sanitize_filename(outfile or "reordered.pdf")
    order_list = require_int_list_csv(order)
    reorder_pages(str(p), order_list, str(out))
    return ok_json(request, {"outfile": str(out)})
