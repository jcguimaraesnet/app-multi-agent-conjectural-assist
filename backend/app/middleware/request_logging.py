"""
Request logging middleware for FastAPI.

Logs every HTTP request with method, path, status code, and duration.
Each request gets a unique request_id for correlation.
"""

import time
import uuid

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

from app.logging_config import get_logger

logger = get_logger("app.middleware.request")


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next) -> Response:
        request_id = str(uuid.uuid4())
        method = request.method
        path = request.url.path

        logger.info(
            "request_start",
            extra={"request_id": request_id, "method": method, "path": path},
        )

        start = time.perf_counter()
        response = await call_next(request)
        duration_ms = round((time.perf_counter() - start) * 1000, 2)

        logger.info(
            "request_end",
            extra={
                "request_id": request_id,
                "method": method,
                "path": path,
                "status": response.status_code,
                "duration_ms": duration_ms,
            },
        )

        response.headers["X-Request-ID"] = request_id
        return response
