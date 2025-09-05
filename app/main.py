import asyncio
import shutil

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, RedirectResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.config import ALLOWED_ORIGINS, LOG_LEVEL, TMP_DIR
from app.errors import ServiceError, error_json, internal_error, ok_json
from app.errors import timeout as timeout_error
from app.middleware import RequestContextMiddleware
from app.routes import (compliance, convert, extract, files, format, forms,
                        metadata, ocr, organize, redaction, secure)

app = FastAPI(title="PDF Forge Local", version="0.3.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=(
        [o.strip() for o in ALLOWED_ORIGINS.split(",")] if ALLOWED_ORIGINS else ["*"]
    ),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(RequestContextMiddleware)

# Core routers
app.include_router(convert.router, prefix="/convert", tags=["convert"])
app.include_router(organize.router, prefix="/organize", tags=["organize"])
app.include_router(ocr.router, prefix="/ocr", tags=["ocr"])
app.include_router(secure.router, prefix="/secure", tags=["secure"])
app.include_router(extract.router, prefix="/extract", tags=["extract"])
app.include_router(files.router, prefix="/files", tags=["files"])
app.include_router(format.router, prefix="/format", tags=["format"])

# New routers
app.include_router(metadata.router, prefix="/metadata", tags=["metadata"])
app.include_router(forms.router, prefix="/forms", tags=["forms"])
app.include_router(redaction.router, prefix="/redact", tags=["redact"])
app.include_router(compliance.router, prefix="/compliance", tags=["compliance"])


@app.exception_handler(ServiceError)
async def service_error_handler(request: Request, exc: ServiceError):
    headers = {}
    if getattr(exc, "code", "") == "RATE_LIMITED":
        retry_after = (exc.detail or {}).get("retry_after")
        if retry_after is not None:
            headers["Retry-After"] = str(retry_after)
    return JSONResponse(
        status_code=exc.http_status, headers=headers, content=error_json(request, exc)
    )


@app.exception_handler(StarletteHTTPException)
async def starlette_http_exception_handler(
    request: Request, exc: StarletteHTTPException
):
    # Wrap generic HTTPExceptions into standard error shape
    se = ServiceError(
        code="INTERNAL_ERROR" if exc.status_code >= 500 else "BAD_REQUEST",
        message=str(exc.detail),
        http_status=exc.status_code,
        detail={},
        hint="",
    )
    return JSONResponse(status_code=se.http_status, content=error_json(request, se))


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    se = internal_error()
    return JSONResponse(status_code=se.http_status, content=error_json(request, se))


@app.exception_handler(ValueError)
async def value_error_handler(request: Request, exc: ValueError):
    se = ServiceError("BAD_REQUEST", str(exc), 400, {}, "Check parameters")
    return JSONResponse(status_code=se.http_status, content=error_json(request, se))


@app.exception_handler(asyncio.TimeoutError)
async def timeout_handler(request: Request, exc: asyncio.TimeoutError):
    se = timeout_error()
    return JSONResponse(status_code=se.http_status, content=error_json(request, se))


# Minimal UI
app.mount("/ui", StaticFiles(directory="web", html=True), name="ui")

# Serve new SPA built to web/site at root routes. Assets under /assets.
app.mount("/assets", StaticFiles(directory="web/site/assets", html=False), name="assets")

def _spa_index():
    return FileResponse("web/site/index.html")


@app.get("/health")
def health(request: Request):
    return ok_json(request, {"status": "ok"})


@app.get("/")
def root(request: Request):
    accept = request.headers.get("accept", "")
    if "text/html" in accept:
        return _spa_index()
    return ok_json(request, {"name": "PDF Forge Local", "version": "0.3.0", "status": "ok"})


@app.get("/organizer")
def organizer():
    return _spa_index()


@app.get("/editor/upload")
def editor_upload():
    return _spa_index()


@app.get("/editor/workspace")
def editor_workspace():
    return _spa_index()


@app.get("/healthz")
def healthz(request: Request):
    return ok_json(request, {"status": "ok"})


@app.get("/readyz")
def readyz(request: Request):
    # Check system deps and disk space
    deps = {
        "tesseract": bool(shutil.which("tesseract")),
        "poppler": bool(shutil.which("pdftoppm") or shutil.which("pdftocairo")),
        "ghostscript": bool(shutil.which("gs")),
    }
    total, used, free = shutil.disk_usage(TMP_DIR)
    ok = all(deps.values()) and free > 50 * 1024 * 1024
    return ok_json(
        request,
        {
            "status": "ok" if ok else "degraded",
            "deps": deps,
            "disk_free": free,
            "tmp": str(TMP_DIR),
        },
    )
