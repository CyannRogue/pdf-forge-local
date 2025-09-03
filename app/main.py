from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.routes import (
    convert, organize, ocr, secure, extract, files, format,
    metadata, forms, redaction, compliance
)

app = FastAPI(title="PDF Forge Local", version="0.3.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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

# Minimal UI
app.mount("/ui", StaticFiles(directory="web", html=True), name="ui")

@app.get("/health")
def health():
    return {"status": "ok"}

@app.get("/")
def root():
    return {"name": "PDF Forge Local", "version": "0.3.0", "status": "ok"}
