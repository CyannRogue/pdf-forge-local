from typing import Optional

from fastapi import APIRouter, File, Form, Request, UploadFile

from app.config import TMP_DIR
from app.errors import ok_json
from app.services.metadata_service import (add_bookmark, get_metadata,
                                           list_bookmarks, set_metadata)
from app.utils import ensure_pdf, sanitize_filename, save_upload_stream

router = APIRouter()


@router.post("/get")
async def meta_get(request: Request, file: UploadFile = File(...)):
    ensure_pdf(file.filename)
    p = await save_upload_stream(file)
    return ok_json(request, {"info": get_metadata(str(p))})


@router.post("/set")
async def meta_set(
    request: Request,
    file: UploadFile = File(...),
    title: Optional[str] = Form(None),
    author: Optional[str] = Form(None),
    subject: Optional[str] = Form(None),
    keywords: Optional[str] = Form(None),
    outfile: str = Form("meta.pdf"),
):
    ensure_pdf(file.filename)
    p = await save_upload_stream(file)
    out = TMP_DIR / sanitize_filename(outfile or "meta.pdf")
    set_metadata(
        str(p), str(out), title=title, author=author, subject=subject, keywords=keywords
    )
    return ok_json(request, {"outfile": str(out)})


@router.post("/bookmarks/list")
async def bookmarks_list(request: Request, file: UploadFile = File(...)):
    ensure_pdf(file.filename)
    p = await save_upload_stream(file)
    return ok_json(request, {"bookmarks": list_bookmarks(str(p))})


@router.post("/bookmarks/add")
async def bookmarks_add(
    request: Request,
    file: UploadFile = File(...),
    text: str = Form(...),
    page: int = Form(...),
    outfile: str = Form("bookmarked.pdf"),
):
    ensure_pdf(file.filename)
    p = await save_upload_stream(file)
    out = TMP_DIR / sanitize_filename(outfile or "bookmarked.pdf")
    add_bookmark(str(p), str(out), text=text, page=int(page))
    return ok_json(request, {"outfile": str(out)})
