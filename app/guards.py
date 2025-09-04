import asyncio
from contextlib import asynccontextmanager
from app.config import OCR_CONCURRENCY, PDFA_CONCURRENCY
from app.errors import rate_limited


_ocr_sem = asyncio.Semaphore(OCR_CONCURRENCY)
_pdfa_sem = asyncio.Semaphore(PDFA_CONCURRENCY)


@asynccontextmanager
async def ocr_guard():
    if _ocr_sem.locked() and _ocr_sem._value == 0:  # best-effort
        raise rate_limited()
    async with _ocr_sem:
        yield


@asynccontextmanager
async def pdfa_guard():
    if _pdfa_sem.locked() and _pdfa_sem._value == 0:
        raise rate_limited()
    async with _pdfa_sem:
        yield

