"""
Dispatch API Routes - Retrieve authority dispatch records
"""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from database.db_setup import get_db, DispatchRecord
from typing import Optional

router = APIRouter()


@router.get("/alerts")
async def get_dispatch_alerts(
    crisis_id: Optional[str] = Query(None, description="Filter by crisis ID"),
    severity: Optional[str] = Query(None, description="Filter by severity"),
    limit: int = Query(50, description="Max records to return"),
    db: Session = Depends(get_db),
):
    """Get all dispatch alerts sent to authorities."""
    query = db.query(DispatchRecord).order_by(DispatchRecord.dispatched_at.desc())

    if crisis_id:
        query = query.filter(DispatchRecord.crisis_id == crisis_id)
    if severity:
        query = query.filter(DispatchRecord.severity == severity)

    records = query.limit(limit).all()

    return {
        "total": len(records),
        "alerts": [
            {
                "id": r.id,
                "crisis_id": r.crisis_id,
                "crisis_type": r.crisis_type,
                "location": r.location,
                "severity": r.severity,
                "authority_key": r.authority_key,
                "authority_name": r.authority_name,
                "authority_phone": r.authority_phone,
                "dispatch_method": r.dispatch_method,
                "status": r.status,
                "real_sms_sent": r.real_sms_sent,
                "message_preview": r.message_preview,
                "dispatched_at": r.dispatched_at.isoformat() if r.dispatched_at else None,
            }
            for r in records
        ],
    }


@router.get("/summary")
async def get_dispatch_summary(db: Session = Depends(get_db)):
    """Get dispatch statistics summary."""
    total = db.query(DispatchRecord).count()
    real_sent = db.query(DispatchRecord).filter(DispatchRecord.real_sms_sent == True).count()
    simulated = total - real_sent

    return {
        "total_dispatches": total,
        "real_sms_sent": real_sent,
        "simulated": simulated,
        "authorities_in_registry": 8,
    }
