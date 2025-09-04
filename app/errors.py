from __future__ import annotations

import uuid
from typing import Any, Dict, Optional
from fastapi import Request


class ServiceError(Exception):
    def __init__(
        self,
        code: str,
        message: str,
        http_status: int,
        detail: Optional[Dict[str, Any]] = None,
        hint: Optional[str] = None,
    ) -> None:
        super().__init__(message)
        self.code = code
        self.message = message
        self.http_status = http_status
        self.detail = detail or {}
        self.hint = hint


def error_json(request: Request, err: ServiceError) -> Dict[str, Any]:
    rid = getattr(request.state, "request_id", None) or str(uuid.uuid4())
    data: Dict[str, Any] = {
        "error": {
            "code": err.code,
            "message": err.message,
            "detail": err.detail or {},
            "hint": err.hint or "",
            "request_id": rid,
        }
    }
    return data


def ok_json(request: Request, payload: Dict[str, Any]) -> Dict[str, Any]:
    rid = getattr(request.state, "request_id", None) or str(uuid.uuid4())
    payload = dict(payload)
    payload["request_id"] = rid
    return payload


# Convenience constructors for common errors
def bad_request(message: str, detail: Optional[Dict[str, Any]] = None, hint: str = "Check parameters") -> ServiceError:
    return ServiceError("BAD_REQUEST", message, 400, detail, hint)


def file_not_found(message: str, detail: Optional[Dict[str, Any]] = None) -> ServiceError:
    return ServiceError("FILE_NOT_FOUND", message, 404, detail, "Ensure file exists in temp dir")


def payload_too_large(max_mb: int) -> ServiceError:
    return ServiceError("PAYLOAD_TOO_LARGE", f"Upload exceeds {max_mb} MB", 413, {"max_mb": max_mb}, "Upload smaller file")


def unsupported_media_type(message: str) -> ServiceError:
    return ServiceError("UNSUPPORTED_MEDIA_TYPE", message, 415, {}, "Use supported file types")


def unprocessable(message: str, detail: Optional[Dict[str, Any]] = None, hint: str = "Check input validity") -> ServiceError:
    return ServiceError("UNPROCESSABLE", message, 422, detail, hint)


def wrong_password() -> ServiceError:
    return ServiceError("WRONG_PASSWORD", "Wrong password", 422, {}, "Use correct password")


def dependency_missing(missing: list[str]) -> ServiceError:
    return ServiceError("DEPENDENCY_MISSING", "Required system dependency missing", 422, {"missing": missing}, "Install system packages")


def rate_limited(retry_after: int = 30) -> ServiceError:
    return ServiceError("RATE_LIMITED", "Too many concurrent requests", 429, {"retry_after": retry_after}, f"Retry after {retry_after}s")


def timeout() -> ServiceError:
    return ServiceError("TIMEOUT", "Operation timed out", 504, {}, "Try again with smaller file or higher timeout")


def internal_error(message: str = "Unexpected error") -> ServiceError:
    return ServiceError("INTERNAL_ERROR", message, 500, {}, "Try again or check logs")

