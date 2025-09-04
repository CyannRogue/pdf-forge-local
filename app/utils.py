from __future__ import annotations

import asyncio
import os
import re
import shutil
from pathlib import Path
from typing import Iterable, Optional

from fastapi import UploadFile

from app.config import MAX_UPLOAD_MB, REQUEST_TIMEOUT_SECS, TMP_DIR
from app.errors import bad_request, payload_too_large, unsupported_media_type

SAFE_NAME_RE = re.compile(r"[^A-Za-z0-9_.\-]+")


def sanitize_filename(name: str) -> str:
    base = os.path.basename(name or "")
    if not base:
        base = "file"
    base = SAFE_NAME_RE.sub("_", base)
    return base[:255]


def safe_join_tmp(name: str) -> Path:
    return TMP_DIR / sanitize_filename(name)


async def save_upload_stream(file: UploadFile, dest_name: Optional[str] = None) -> Path:
    fname = sanitize_filename(dest_name or file.filename or "upload.bin")
    dest = TMP_DIR / fname
    size = 0
    limit = MAX_UPLOAD_MB * 1024 * 1024
    with dest.open("wb") as out:
        while True:
            chunk = await file.read(1024 * 1024)
            if not chunk:
                break
            size += len(chunk)
            if size > limit:
                dest.unlink(missing_ok=True)
                raise payload_too_large(MAX_UPLOAD_MB)
            out.write(chunk)
    return dest


def ensure_overwrite_warn(path: Path) -> bool:
    existed = path.exists()
    # No-op: overwriting allowed by default; caller can log if needed
    return existed


def require_int_list_csv(csv: str) -> list[int]:
    if not csv or not csv.strip():
        raise bad_request("Order list is empty")
    out: list[int] = []
    for token in csv.split(","):
        token = token.strip()
        if not token:
            continue
        try:
            out.append(int(token))
        except ValueError:
            raise bad_request("Order must be integers")
    if not out:
        raise bad_request("Order list is empty")
    return out


async def run_with_timeout(func, *args, timeout: Optional[int] = None, **kwargs):
    to = timeout or REQUEST_TIMEOUT_SECS
    return await asyncio.wait_for(asyncio.to_thread(func, *args, **kwargs), timeout=to)


def which(names: Iterable[str]) -> Optional[str]:
    for n in names:
        p = shutil.which(n)
        if p:
            return p
    return None


def sanitize_text(text: str, max_len: int = 256) -> str:
    # Remove control chars
    cleaned = "".join(ch for ch in text if 32 <= ord(ch) <= 126)
    return cleaned[:max_len]


def ensure_pdf(name: str):
    if not (name or "").lower().endswith(".pdf"):
        raise unsupported_media_type("PDF file required")


def ensure_image(name: str):
    if not (name or "").lower().split(".")[-1] in {
        "png",
        "jpg",
        "jpeg",
        "tif",
        "tiff",
        "bmp",
        "gif",
    }:
        raise unsupported_media_type("Image file required")
