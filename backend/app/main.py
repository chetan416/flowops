import uuid
import logging
from fastapi import FastAPI, Request
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

@app.get("/health")
def health_check():
    logger.info("Health check hit")
    return {
        "status":"ok",
        "env" : settings.ENV
        }