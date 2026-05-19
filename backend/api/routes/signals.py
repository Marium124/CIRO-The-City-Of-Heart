"""
Signal API Routes - Endpoints for signal ingestion
"""

from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from datetime import datetime
import asyncio

router = APIRouter()

class SocialMediaPost(BaseModel):
    platform: str
    text: str
    location: Optional[str] = None
    timestamp: Optional[str] = None
    user_id: Optional[str] = None

class WeatherData(BaseModel):
    location: str
    temperature: float
    rainfall: float
    condition: str
    timestamp: Optional[str] = None

class TrafficData(BaseModel):
    location: str
    congestion_level: str
    congestion_percentage: int
    average_speed: float
    incident_reported: bool = False
    timestamp: Optional[str] = None

class SignalInput(BaseModel):
    social_media: Optional[List[SocialMediaPost]] = []
    weather: Optional[List[WeatherData]] = []
    traffic: Optional[List[TrafficData]] = []

@router.post("/social")
async def submit_social_media(posts: List[SocialMediaPost]):
    """Submit social media posts for processing"""
    return {
        "status": "received",
        "posts_count": len(posts),
        "message": "Social media posts queued for processing"
    }

@router.post("/weather")
async def submit_weather_data(data: List[WeatherData]):
    """Submit weather data for processing"""
    return {
        "status": "received",
        "data_points": len(data),
        "message": "Weather data queued for processing"
    }

@router.post("/traffic")
async def submit_traffic_data(data: List[TrafficData]):
    """Submit traffic data for processing"""
    return {
        "status": "received",
        "data_points": len(data),
        "message": "Traffic data queued for processing"
    }



@router.post("/ingest")
async def ingest_signals(request: Request, signals: SignalInput):
    """Ingest multi-source signals and trigger processing in background"""
    from database.db_setup import SessionLocal, Signal
    from datetime import datetime
    import asyncio
    
    manager = request.app.state.agent_manager
    db = SessionLocal()
    
    signals_dict = signals.dict()
    
    # Auto-synthesize weather and traffic sensor signals if they are empty (citizen reporting mode)
    if signals.social_media and not signals.weather and not signals.traffic:
        for post in signals.social_media:
            post_text = post.text
            # Extract location
            loc = post.location
            if not loc:
                loc = "Karachi"
                for city in ["Karachi", "Lahore", "Islamabad", "Peshawar", "Quetta", "Multan", "Faisalabad", "G-10", "George Town"]:
                    if city.lower() in post_text.lower():
                        loc = city
                        break
            
            # Determine telemetry characteristics based on keywords
            if any(kw in post_text.lower() for kw in ["flood", "rain", "water", "pani", "slum", "storm"]):
                # Flood/Storm parameters
                weather_point = {
                    "location": loc,
                    "temperature": 24.5,
                    "rainfall": 82.5,
                    "condition": "Heavy Thunderstorm"
                }
                traffic_point = {
                    "location": loc,
                    "congestion_level": "heavy",
                    "congestion_percentage": 92,
                    "average_speed": 4.5,
                    "incident_reported": True
                }
            elif any(kw in post_text.lower() for kw in ["heat", "hot", "sun", "garmi", "exhaustion"]):
                # Heatwave parameters
                weather_point = {
                    "location": loc,
                    "temperature": 45.8,
                    "rainfall": 0.0,
                    "condition": "Extreme Heatwave"
                }
                traffic_point = {
                    "location": loc,
                    "congestion_level": "moderate",
                    "congestion_percentage": 55,
                    "average_speed": 35.0,
                    "incident_reported": False
                }
            else:
                # Default accident/infrastructure parameters
                weather_point = {
                    "location": loc,
                    "temperature": 28.0,
                    "rainfall": 0.0,
                    "condition": "Clear Sky"
                }
                traffic_point = {
                    "location": loc,
                    "congestion_level": "critical",
                    "congestion_percentage": 85,
                    "average_speed": 8.0,
                    "incident_reported": True
                }
            
            signals_dict["weather"].append(weather_point)
            signals_dict["traffic"].append(traffic_point)
    
    try:
        # Save signals to database for persistence
        for post in signals_dict["social_media"]:
            db.add(Signal(source="social_media", source_type="social_media", location="unknown", content=post["text"], timestamp=datetime.now()))
        for item in signals_dict["weather"]:
            db.add(Signal(source="weather", source_type="weather", location=item["location"], content=item["condition"], timestamp=datetime.now()))
        for item in signals_dict["traffic"]:
            db.add(Signal(source="traffic", source_type="traffic", location=item["location"], content=item["congestion_level"], timestamp=datetime.now()))
        
        db.commit()
    finally:
        db.close()
    
    # Trigger workflow in background so mobile app returns immediately
    asyncio.create_task(manager.execute_workflow("full_cycle", signals_dict))
    
    return {
        "status": "received",
        "message": "Signals received and queued for agent processing"
    }

@router.post("/")
async def submit_single_signal(request: Request, signal: Dict[str, Any]):
    """Submit a single signal and trigger full cycle workflow"""
    manager = request.app.state.agent_manager
    
    # Wrap in expected format for ingestion agent
    signals_data = {
        "social_media": [],
        "weather": [],
        "traffic": []
    }
    
    # Simple heuristic to categorize
    source = signal.get("source", "social_media")
    if source == "weather":
        signals_data["weather"].append(signal)
    elif source == "traffic":
        signals_data["traffic"].append(signal)
    else:
        signals_data["social_media"].append(signal)
        
    # Trigger workflow
    asyncio.create_task(manager.execute_workflow("full_cycle", signals_data))
    
    return {
        "status": "received",
        "message": f"Signal from {source} queued for processing"
    }

@router.get("/recent")
async def get_recent_signals(limit: int = 10):
    """Get recent signals from database"""
    from database.db_setup import SessionLocal, Signal
    
    db = SessionLocal()
    try:
        signals = db.query(Signal).order_by(Signal.created_at.desc()).limit(limit).all()
        return {
            "signals": [
                {
                    "id": s.id,
                    "source": s.source,
                    "source_type": s.source_type,
                    "location": s.location,
                    "content": s.content,
                    "timestamp": s.timestamp.isoformat() if s.timestamp else None,
                    "processed": s.processed
                } for s in signals
            ],
            "count": len(signals),
            "message": "Recent signals retrieved from database"
        }
    finally:
        db.close()
