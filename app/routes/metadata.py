from fastapi import APIRouter, UploadFile, File, Form, Request
from typing import Optional
from app.services.metadata_service import (
    get_metadata, set_metadata, list_bookmarks, add_bookmark
)
from app.utils import save_upload_stream, sanitize_filename
from app.config import TMP_DIR
from app.errors import ok_json

router = APIRouter()

@router.post("/get")
async def meta_get(request: Request, file: UploadFile = File(...)):
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
    outfile: str = Form("meta.pdf")
):
    p = await save_upload_stream(file)
    out = TMP_DIR / sanitize_filename(outfile or "meta.pdf")
    set_metadata(str(p), str(out), title=title, author=author, subject=subject, keywords=keywords)
    return ok_json(request, {"outfile": str(out)})

@router.post("/bookmarks/list")
async def bookmarks_list(request: Request, file: UploadFile = File(...)):
    p = await save_upload_stream(file)
    return ok_json(request, {"bookmarks": list_bookmarks(str(p))})

@router.post("/bookmarks/add")
async def bookmarks_add(
    request: Request,
    file: UploadFile = File(...),
    text: str = Form(...),
    page: int = Form(...),
    outfile: str = Form("bookmarked.pdf")
):
    p = await save_upload_stream(file)
    out = TMP_DIR / sanitize_filename(outfile or "bookmarked.pdf")
    add_bookmark(str(p), str(out), text=text, page=int(page))
    return ok_json(request, {"outfile": str(out)})
