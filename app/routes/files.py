from fastapi import APIRouter, Query, HTTPException
from fastapi.responses import FileResponse
from typing import List
import os
from pathlib import Path

TMP_DIR = Path("/tmp")

router = APIRouter()

@router.get("/list")
def list_tmp(ext: List[str] = Query(default=None, description="Optional file extensions, e.g. ['pdf','png']")):
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
    return {"files": items}

@router.get("/download")
def download(name: str):
    safe = Path(os.path.basename(name))
    path = TMP_DIR / safe
    if not path.exists() or not path.is_file():
        raise HTTPException(status_code=404, detail="File not found")
    return FileResponse(str(path), filename=safe.name)
