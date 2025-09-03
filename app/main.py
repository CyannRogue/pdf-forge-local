from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.routes import convert, organize, ocr, secure, extract, files, format

app = FastAPI(title="PDF Forge Local", version="0.2.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(convert.router, prefix="/convert", tags=["convert"])
app.include_router(organize.router, prefix="/organize", tags=["organize"])
app.include_router(ocr.router, prefix="/ocr", tags=["ocr"])
app.include_router(secure.router, prefix="/secure", tags=["secure"])
app.include_router(extract.router, prefix="/extract", tags=["extract"])
app.include_router(files.router, prefix="/files", tags=["files"])
app.include_router(format.router, prefix="/format", tags=["format"])

# Serve minimal UI
app.mount("/ui", StaticFiles(directory="web", html=True), name="ui")

@app.get("/")
def root():
    return {"name": "PDF Forge Local", "status": "ok"}
