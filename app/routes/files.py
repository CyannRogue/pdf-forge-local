from fastapi import APIRouter, Query, Request
from fastapi.responses import FileResponse
from typing import List
import os
from pathlib import Path
from app.config import TMP_DIR
from app.errors import file_not_found, ok_json

router = APIRouter()


@router.get("/list")
def list_tmp(request: Request, ext: List[str] = Query(default=None, description="Optional file extensions, e.g. ['pdf','png']")):
    items = []
    for p in TMP_DIR.iterdir():
        if not p.is_file():
            continue
        if ext and p.suffix.lstrip(".").lower() not in [e.lower() for e in ext]:
            continue
        stat = p.stat()
        items.append({
            "name": p.name,
            "size": stat.st_size,
            "mtime": int(stat.st_mtime)
        })
    items.sort(key=lambda x: x["mtime"], reverse=True)
    return ok_json(request, {"files": items})


@router.get("/download")
def download(name: str):
    safe = Path(os.path.basename(name))
    path = TMP_DIR / safe
    if not path.exists() or not path.is_file():
        raise file_not_found("File not found", {"name": safe.name})
    return FileResponse(str(path), filename=safe.name)
