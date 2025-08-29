from fastapi import FastAPI
from fastapi.exceptions import HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.websockets import WebSocket, WebSocketDisconnect, WebSocketState
from pydantic import BaseModel
import json
import aiosqlite
from contextlib import asynccontextmanager

class LoginObj(BaseModel):
    username: str
    password: str

class RegisterObj(BaseModel):
    username: str
    password: str

class ConnectionManager:
    def __init__(self):
        self.active_connections: dict[str, WebSocket] = {}

    async def connect(self, websocket: WebSocket, username: str):
        try:
            await websocket.accept()
            if websocket.client_state == WebSocketState.CONNECTED:
                self.active_connections[username] = websocket
        except Exception as e:
            pass

    async def disconnect(self, username: str):
        websocket = self.active_connections.get(username)
        if websocket:
            await websocket.close()
            del self.active_connections[username]

    async def broadcast(self, message: str):
        for connection in self.active_connections.values():
            if connection.client_state == WebSocketState.CONNECTED:
                await connection.send_text(message)

manager = ConnectionManager()

async def database_initialisation():
    async with aiosqlite.connect('users.db') as db:
        await db.execute('CREATE TABLE IF NOT EXISTS users (username TEXT NOT NULL, password TEXT NOT NULL)')
        await db.commit()

@asynccontextmanager
async def lifespan(app: FastAPI):
    await database_initialisation()
    yield

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[f"https://192.168.1.{i}" for i in range(2,256)],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

@app.websocket("/ws/{username}")
async def websocket_endpoint(websocket: WebSocket, username: str):
    try:
        await manager.connect(websocket, username)
        while True:
            data = await websocket.receive_text()
            if data:
                await manager.broadcast(data)
    except Exception as e:
        print(f"Error: {e}")
        await manager.disconnect(username)

@app.post('/api/login')
async def login(login_obj: LoginObj):
    async with aiosqlite.connect('users.db') as db:
        username = login_obj.username
        password = login_obj.password
        results = await db.execute('SELECT * FROM users WHERE username = ?', (username,))
        user = await results.fetchone()
        if user:
            if password == user[1]:
                return {'success': True}
            else:
                raise HTTPException(status_code=401, detail='Invalid username or password')
        else:
            raise HTTPException(status_code=404, detail='User not found')
        
@app.post('/api/register')
async def register(register_obj: RegisterObj):
    async with aiosqlite.connect('users.db') as db:
        username = register_obj.username
        password = register_obj.password
        result = await db.execute('SELECT * FROM users WHERE username = ?', (username,))
        user = await result.fetchone()
        if not user:
            await db.execute('INSERT INTO users (username, password) VALUES (?, ?)', (username, password))
            await db.commit()
            return {'success': True}
        else:
            raise HTTPException(status_code=409, detail='Username already exists')