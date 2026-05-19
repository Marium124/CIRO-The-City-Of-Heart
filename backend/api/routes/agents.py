"""
Agents API Routes - Endpoints for agent monitoring and logs
"""

from fastapi import APIRouter, HTTPException, Request
from typing import Dict, Any, List, Optional
import os
import json
from datetime import datetime

router = APIRouter()

@router.get("/contacts")
async def get_contacts():
    """Get contacts registry"""
    file_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "agents", "contacts_registry.json")
    try:
        if not os.path.exists(file_path):
            raise HTTPException(status_code=404, detail="Contacts registry file not found")
        with open(file_path, "r", encoding="utf-8") as f:
            data = json.load(f)
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/status")
async def get_agent_status(request: Request):
    """Get status of all agents"""
    manager = request.app.state.agent_manager
    status = manager.get_agent_status()
    return {
        "agents": status,
        "total_agents": len(status),
        "active_agents": sum(1 for s in status.values() if s == "running"),
        "message": "Agent status retrieved"
    }

@router.get("/logs")
async def get_agent_logs(request: Request, limit: int = 50):
    """Get agent execution logs (traces)"""
    manager = request.app.state.agent_manager
    traces = manager.get_agent_traces()
    return {
        "logs": traces[-limit:],
        "count": len(traces),
        "message": "Agent logs retrieved"
    }

@router.get("/trace/{agent_id}")
async def get_agent_trace(agent_id: str):
    """Get specific agent trace"""
    return {
        "agent_id": agent_id,
        "trace": [
            {
                "timestamp": datetime.now().isoformat(),
                "action": "initialize",
                "status": "completed"
            },
            {
                "timestamp": datetime.now().isoformat(),
                "action": "process",
                "status": "completed"
            }
        ],
        "message": f"Trace for agent {agent_id} retrieved"
    }

@router.post("/workflow")
async def execute_workflow(workflow_name: str, input_data: Dict[str, Any]):
    """Execute a multi-agent workflow"""
    return {
        "workflow": workflow_name,
        "status": "executing",
        "workflow_id": f"WF-{datetime.now().strftime('%Y%m%d%H%M%S')}",
        "message": "Workflow execution initiated"
    }
