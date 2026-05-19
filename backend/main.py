"""
Crisis Response Agentic AI System - Main Backend Server
Implements multi-agent orchestration inspired by Google Antigravity
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import uvicorn
from agents.agent_manager import AgentManager
from api.routes import signals, crises, actions, simulation, agents, dispatch
from database.db_setup import init_db

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

# Include API routes
app.include_router(signals.router, prefix="/api/signals", tags=["signals"])
app.include_router(crises.router, prefix="/api/crises", tags=["crises"])
app.include_router(actions.router, prefix="/api/actions", tags=["actions"])
app.include_router(simulation.router, prefix="/api/simulation", tags=["simulation"])
app.include_router(agents.router, prefix="/api/agents", tags=["agents"])
app.include_router(dispatch.router, prefix="/api/dispatch", tags=["dispatch"])

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
