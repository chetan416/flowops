from app.api.v1.routes import users, auth, subscriptions, workflows, admin, monitoring, incidents, ai as ai_router, teams, deployments, reliability, websockets
from fastapi import APIRouter

api_router = APIRouter()
api_router.include_router(users.router)
api_router.include_router(auth.router)
api_router.include_router(subscriptions.router)
api_router.include_router(workflows.router)
api_router.include_router(admin.router)
api_router.include_router(monitoring.router)
api_router.include_router(incidents.router)
api_router.include_router(ai_router.router)
api_router.include_router(teams.router)
api_router.include_router(deployments.router)
api_router.include_router(reliability.router)
api_router.include_router(websockets.router)

