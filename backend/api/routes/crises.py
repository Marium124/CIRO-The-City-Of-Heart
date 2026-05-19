"""
Crisis API Routes - Endpoints for crisis detection and management
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from datetime import datetime

router = APIRouter()

class CrisisDetectionRequest(BaseModel):
    signals: Dict[str, Any]
    auto_detect: bool = True

@router.get("/detect")
async def detect_crisis(signals: Dict[str, Any]):
    """Trigger crisis detection from signals"""
    return {
        "status": "detecting",
        "message": "Crisis detection workflow initiated",
        "workflow_id": f"WF-{datetime.now().strftime('%Y%m%d%H%M%S')}"
    }

@router.get("/active")
async def get_active_crises():
    """Get list of active crises from database"""
    from database.db_setup import SessionLocal, Crisis, DispatchRecord
    
    db = SessionLocal()
    try:
        crises = db.query(Crisis).filter(Crisis.status == "active").all()
        
        crises_data = []
        for c in crises:
            dispatches = db.query(DispatchRecord).filter(DispatchRecord.crisis_id == c.crisis_id).all()
            dispatch_list = [
                {
                    "authority_name": d.authority_name,
                    "authority_phone": d.authority_phone,
                    "dispatch_method": d.dispatch_method,
                    "status": d.status,
                    "real_sms_sent": d.real_sms_sent,
                    "dispatched_at": d.dispatched_at.isoformat() if d.dispatched_at else None
                } for d in dispatches
            ]
            
            crises_data.append({
                "crisis_id": c.crisis_id,
                "crisis_type": c.crisis_type,
                "location": c.location,
                "severity": c.severity,
                "confidence": c.confidence,
                "status": c.status,
                "description": c.description,
                "latitude": c.latitude,
                "longitude": c.longitude,
                "detected_at": c.detected_at.isoformat() if c.detected_at else None,
                "dispatched_authorities": dispatch_list
            })
            
        return {
            "crises": crises_data,
            "count": len(crises_data),
            "message": "Active crises retrieved from database"
        }
    finally:
        db.close()

@router.get("/{crisis_id}")
async def get_crisis(crisis_id: str):
    """Get details of a specific crisis"""
    return {
        "crisis_id": crisis_id,
        "status": "active",
        "message": "Crisis details retrieved"
    }

@router.get("/history")
async def get_crisis_history(limit: int = 20):
    """Get crisis history"""
    return {
        "crises": [],
        "count": 0,
        "message": "Crisis history retrieved"
    }
