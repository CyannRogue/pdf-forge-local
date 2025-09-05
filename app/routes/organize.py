from typing import List

from fastapi import APIRouter, File, Form, Request, UploadFile

from app.config import TMP_DIR
from app.errors import bad_request, ok_json
from app.services.organize_service import (delete_pages, extract_pages,
                                           merge_pdfs, reorder_pages,
                                           split_pdf)
from app.utils import (
    ensure_pdf,
    require_int_list_csv,
    sanitize_filename,
    save_upload_stream,
)

router = APIRouter()


@router.post("/merge")
async def merge(
    request: Request,
    files: List[UploadFile] = File(...),
    outfile: str = Form("merged.pdf"),
):
    paths = []
    for f in files:
        ensure_pdf(f.filename)
        p = await save_upload_stream(f)
        paths.append(str(p))
    out = TMP_DIR / sanitize_filename(outfile or "merged.pdf")
    merge_pdfs(paths, str(out))
    return ok_json(request, {"outfile": str(out)})


@router.post("/split")
async def split(
    request: Request, file: UploadFile = File(...), ranges: str = Form(...)
):
    """
    ranges example: "1-3,7,10-12" or multiple groups separated by ';' for multiple outputs.
    """
    ensure_pdf(file.filename)
    p = await save_upload_stream(file)
    if not ranges or not ranges.strip():
        raise bad_request("ranges is required")
    outputs = split_pdf(str(p), ranges)
    return ok_json(request, {"outputs": outputs})


@router.post("/extract-pages")
async def extract(
    request: Request,
    file: UploadFile = File(...),
    ranges: str = Form(...),
    outfile: str = Form("extract.pdf"),
):
    ensure_pdf(file.filename)
    p = await save_upload_stream(file)
    out = TMP_DIR / sanitize_filename(outfile or "extract.pdf")
    extract_pages(str(p), ranges, str(out))
    return ok_json(request, {"outfile": str(out)})


@router.post("/delete-pages")
async def delete(
    request: Request,
    file: UploadFile = File(...),
    ranges: str = Form(...),
    outfile: str = Form("pruned.pdf"),
):
    ensure_pdf(file.filename)
    p = await save_upload_stream(file)
    out = TMP_DIR / sanitize_filename(outfile or "pruned.pdf")
    delete_pages(str(p), ranges, str(out))
    return ok_json(request, {"outfile": str(out)})


@router.post("/reorder")
async def reorder(
    request: Request,
    file: UploadFile = File(...),
    order: str = Form(...),
    outfile: str = Form("reordered.pdf"),
    rotations: str = Form(""),  # Optional: e.g., "2:90,7:270"
):
    """
    order: comma-separated 1-based page indices representing the new order.
    Example: "2,3,1,4"
    """
    ensure_pdf(file.filename)
    p = await save_upload_stream(file)
    out = TMP_DIR / sanitize_filename(outfile or "reordered.pdf")
    order_list = require_int_list_csv(order)
    rot_map = {}
    if rotations and rotations.strip():
        for token in rotations.split(","):
            token = token.strip()
            if not token or ":" not in token:
                continue
            idx_s, deg_s = token.split(":", 1)
            try:
                idx = int(idx_s)
                deg = int(deg_s) % 360
                if deg % 90 != 0:
                    continue
                rot_map[idx] = deg
            except ValueError:
                continue
    reorder_pages(str(p), order_list, str(out), rotations=rot_map)
    return ok_json(request, {"outfile": str(out)})
