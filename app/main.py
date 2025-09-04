from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.routes import (
    convert, organize, ocr, secure, extract, files, format,
    metadata, forms, redaction, compliance
)
from app.config import ALLOWED_ORIGINS, LOG_LEVEL
from app.middleware import RequestContextMiddleware
import asyncio
from app.errors import ServiceError, error_json, ok_json, internal_error, timeout as timeout_error

app = FastAPI(title="PDF Forge Local", version="0.3.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in ALLOWED_ORIGINS.split(",")] if ALLOWED_ORIGINS else ["*"],
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
    return JSONResponse(status_code=exc.http_status, content=error_json(request, exc))


@app.exception_handler(StarletteHTTPException)
async def starlette_http_exception_handler(request: Request, exc: StarletteHTTPException):
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

@app.get("/health")
def health(request: Request):
    return ok_json(request, {"status": "ok"})

@app.get("/")
def root(request: Request):
    return ok_json(request, {"name": "PDF Forge Local", "version": "0.3.0", "status": "ok"})
