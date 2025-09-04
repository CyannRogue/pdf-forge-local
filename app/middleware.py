import time
import uuid
from typing import Callable
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from app.logging_utils import configure_logging
from app.config import LOG_LEVEL


logger = configure_logging(LOG_LEVEL)


class RequestContextMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        request.state.request_id = str(uuid.uuid4())
        start = time.time()
        try:
            response = await call_next(request)
            elapsed = int((time.time() - start) * 1000)
            logger.info(
                "access",
                extra={
                    "event": "access",
                    "request_id": request.state.request_id,
                    "route": request.url.path,
                    "method": request.method,
                    "status": getattr(response, "status_code", 0),
                    "elapsed_ms": elapsed,
                },
            )
            return response
        except Exception as e:
            elapsed = int((time.time() - start) * 1000)
            logger.error(
                "internal_error",
                extra={
                    "event": "exception",
                    "request_id": request.state.request_id,
                    "route": request.url.path,
                    "method": request.method,
                    "elapsed_ms": elapsed,
                },
                exc_info=True,
            )
            raise

