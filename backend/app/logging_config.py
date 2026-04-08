"""
Centralized JSON logging configuration.

Shared by both the FastAPI backend and the LangGraph agent.
Each service calls setup_logging(service=...) once at startup,
producing structured JSON lines to stdout that Fluent Bit collects.
"""

import logging
import sys
import os

from pythonjsonlogger.json import JsonFormatter


def setup_logging(service: str = "backend") -> None:
    """Configure all loggers to emit JSON to stdout."""
    level = os.environ.get("LOG_LEVEL", "INFO").upper()

    formatter = JsonFormatter(
        fmt="%(asctime)s %(levelname)s %(name)s %(message)s",
        rename_fields={"asctime": "timestamp", "levelname": "level"},
        static_fields={"service": service},
    )

    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(formatter)

    # Root logger
    root = logging.getLogger()
    root.handlers.clear()
    root.addHandler(handler)
    root.setLevel(getattr(logging, level, logging.INFO))

    # Override uvicorn loggers so they also emit JSON
    for name in ("uvicorn", "uvicorn.error", "uvicorn.access"):
        uv_logger = logging.getLogger(name)
        uv_logger.handlers.clear()
        uv_logger.addHandler(handler)
        uv_logger.propagate = False


def get_logger(name: str) -> logging.Logger:
    """Return a named logger (call after setup_logging)."""
    return logging.getLogger(name)
