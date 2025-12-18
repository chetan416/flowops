import uuid
import logging
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.logging import setup_logging
from app.api.v1.router import api_router
#
from app.db.session import engine
from app.db.base import Base
from app.domain.user.models import User



setup_logging()
logger = logging.getLogger("flowops")

app = FastAPI(title=settings.APP_NAME)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all origins for dev
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router,prefix="/api/v1")
#
Base.metadata.create_all(bind=engine)

@app.middleware("http")
async def request_logger(request: Request, call_next):
    request_id = str(uuid.uuid4())
    logger.info(f"Request start | {request.method} {request.url} | id = {request_id}")
    response = await call_next(request)
    logger.info(f"Request end | {request.method} {request.url} | "
                f"status = {response.status_code} | id = {request_id}")
    return response

@app.get("/")
def health_check():
    return {
        "status":"ok",
        "env" : settings.ENV
    }

from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request, exc):
    logger.error(f"Validation Error: {exc}")
    return JSONResponse(
        status_code=400,
        content={"detail": "Validation Error", "errors": str(exc)},
    )

@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    logger.error(f"Global Exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal Server Error. Please check logs."},
    )

import asyncio
from app.core.socket_manager import manager

@app.on_event("startup")
async def startup_event():
    asyncio.create_task(manager.start_redis_listener())

from prometheus_fastapi_instrumentator import Instrumentator
Instrumentator().instrument(app).expose(app)