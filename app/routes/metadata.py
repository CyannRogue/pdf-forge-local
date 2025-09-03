from fastapi import APIRouter, UploadFile, File, Form
from typing import Optional
from app.services.metadata_service import (
    get_metadata, set_metadata, list_bookmarks, add_bookmark
)

router = APIRouter()

@router.post("/get")
async def meta_get(file: UploadFile = File(...)):
    p = f"/tmp/{file.filename}"
    with open(p, "wb") as w:
        w.write(await file.read())
    return {"info": get_metadata(p)}

@router.post("/set")
async def meta_set(
    file: UploadFile = File(...),
    title: Optional[str] = Form(None),
    author: Optional[str] = Form(None),
    subject: Optional[str] = Form(None),
    keywords: Optional[str] = Form(None),
    outfile: str = Form("meta.pdf")
):
    p = f"/tmp/{file.filename}"
    with open(p, "wb") as w:
        w.write(await file.read())
    out = f"/tmp/{outfile}"
    set_metadata(p, out, title=title, author=author, subject=subject, keywords=keywords)
    return {"outfile": out}

@router.post("/bookmarks/list")
async def bookmarks_list(file: UploadFile = File(...)):
    p = f"/tmp/{file.filename}"
    with open(p, "wb") as w:
        w.write(await file.read())
    return {"bookmarks": list_bookmarks(p)}

@router.post("/bookmarks/add")
async def bookmarks_add(
    file: UploadFile = File(...),
    text: str = Form(...),
    page: int = Form(...),
    outfile: str = Form("bookmarked.pdf")
):
    p = f"/tmp/{file.filename}"
    with open(p, "wb") as w:
        w.write(await file.read())
    out = f"/tmp/{outfile}"
    add_bookmark(p, out, text=text, page=page)
    return {"outfile": out}
