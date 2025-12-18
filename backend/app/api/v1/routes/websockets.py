from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.core.socket_manager import manager

router = APIRouter(tags=["websockets"])

@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # Just keep connection open and listen for ping/pong if needed
            # For this MVP, we mainly push data FROM server, 
            # but we can listen for "ping" to keepalive
            data = await websocket.receive_text()
            if data == "ping":
                await websocket.send_text("pong")
    except WebSocketDisconnect:
        manager.disconnect(websocket)
