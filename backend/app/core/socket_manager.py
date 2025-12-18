from typing import List
from fastapi import WebSocket
import redis.asyncio as redis
import json
import asyncio
from app.core.config import settings

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []
        self.redis_client = None
        self.pubsub = None

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast_local(self, message: dict):
        """Broadcasts to locally connected websockets"""
        to_remove = []
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except Exception:
                to_remove.append(connection)
        
        for conn in to_remove:
            self.disconnect(conn)

    async def start_redis_listener(self):
        """Listens to Redis 'events' channel and broadcasts to local WS"""
        self.redis_client = redis.from_url(settings.REDIS_URL, decode_responses=True)
        self.pubsub = self.redis_client.pubsub()
        await self.pubsub.subscribe("events")
        
        async for message in self.pubsub.listen():
            if message["type"] == "message":
                try:
                    data = json.loads(message["data"])
                    await self.broadcast_local(data)
                except Exception as e:
                    print(f"Error processing redis message: {e}")

manager = ConnectionManager()
