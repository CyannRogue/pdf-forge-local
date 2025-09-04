import json
import logging
import sys
import time
from typing import Any, Dict


class JsonLineFormatter(logging.Formatter):
    def format(self, record: logging.LogRecord) -> str:
        base: Dict[str, Any] = {
            "timestamp": int(time.time() * 1000),
            "level": record.levelname,
            "event": getattr(record, "event", record.msg if isinstance(record.msg, str) else "log"),
        }
        extras = {
            k: v for k, v in record.__dict__.items() if k not in {
                "name", "msg", "args", "levelname", "levelno", "pathname", "filename", "module",
                "exc_info", "exc_text", "stack_info", "lineno", "funcName", "created", "msecs", "relativeCreated",
                "thread", "threadName", "processName", "process", "asctime"
            }
        }
        base.update(extras)
        if record.exc_info:
            base["exc"] = self.formatException(record.exc_info)
        return json.dumps(base)


def configure_logging(level: str = "INFO") -> logging.Logger:
    logger = logging.getLogger("pdf_forge")
    logger.setLevel(level)
    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(JsonLineFormatter())
    logger.handlers = [handler]
    logger.propagate = False
    return logger

