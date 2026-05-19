"""
Crisis Response Agentic AI System - Main Backend Server
Implements multi-agent orchestration inspired by Google Antigravity
"""

from fastapi import FastAPI, HTTPException, Depends, Security, status
from fastapi.security.api_key import APIKeyHeader
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import uvicorn
import os
from agents.agent_manager import AgentManager
from api.routes import signals, crises, actions, simulation, agents, dispatch
from database.db_setup import init_db

API_KEY_NAME = "X-API-Key"
api_key_header = APIKeyHeader(name=API_KEY_NAME, auto_error=False)

async def get_api_key(api_key: str = Depends(api_key_header)):
    # Hackathon security awareness check. Default to 'ciro-secret-key-2026' for testing.
    expected_key = os.getenv("CIRO_API_KEY", "ciro-secret-key-2026")
    if not api_key or api_key != expected_key:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or missing X-API-Key header",
        )
    return api_key

# Initialize Agent Manager (Antigravity-style orchestration)
agent_manager = AgentManager()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("Starting Crisis Response Agentic AI System")
    await init_db()
    await agent_manager.initialize()
    yield
    # Shutdown
    print("Shutting down system")
    await agent_manager.shutdown()

app = FastAPI(
    title="Crisis Response Agentic AI System",
    description="Multi-agent crisis detection and response system",
    version="1.0.0",
    lifespan=lifespan
)

app.state.agent_manager = agent_manager

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes with API Key protection
app.include_router(signals.router, prefix="/api/signals", tags=["signals"], dependencies=[Depends(get_api_key)])
app.include_router(crises.router, prefix="/api/crises", tags=["crises"], dependencies=[Depends(get_api_key)])
app.include_router(actions.router, prefix="/api/actions", tags=["actions"], dependencies=[Depends(get_api_key)])
app.include_router(simulation.router, prefix="/api/simulation", tags=["simulation"], dependencies=[Depends(get_api_key)])
app.include_router(agents.router, prefix="/api/agents", tags=["agents"], dependencies=[Depends(get_api_key)])
app.include_router(dispatch.router, prefix="/api/dispatch", tags=["dispatch"], dependencies=[Depends(get_api_key)])

@app.get("/")
async def root():
    return {
        "system": "Crisis Response Agentic AI System",
        "status": "operational",
        "agents": len(agent_manager.active_agents),
        "version": "1.0.0"
    }

@app.get("/health")
@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "agent_manager": "active",
        "database": "connected"
    }

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
