import asyncio
from contextlib import asynccontextmanager

from app.config import OCR_CONCURRENCY, PDFA_CONCURRENCY
from app.errors import rate_limited

_ocr_sem = asyncio.Semaphore(OCR_CONCURRENCY)
_pdfa_sem = asyncio.Semaphore(PDFA_CONCURRENCY)


@asynccontextmanager
async def _try_acquire(sem: asyncio.Semaphore):
    try:
        await asyncio.wait_for(sem.acquire(), timeout=0.001)
    except asyncio.TimeoutError:
        raise rate_limited()
    try:
        yield
    finally:
        try:
            sem.release()
        except ValueError:
            pass


@asynccontextmanager
async def ocr_guard():
    async with _try_acquire(_ocr_sem):
        yield


@asynccontextmanager
async def pdfa_guard():
    async with _try_acquire(_pdfa_sem):
        yield
