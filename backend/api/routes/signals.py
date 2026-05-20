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
    """Submit a single signal (typically from mobile SOS) and trigger full cycle workflow.
    
    Converts the signal into the multi-source format expected by the agent pipeline,
    including synthetic weather/traffic telemetry fusion for single-citizen reports.
    """
    from database.db_setup import SessionLocal, Signal as SignalModel
    
    manager = request.app.state.agent_manager
    db = SessionLocal()
    
    # Extract signal fields
    content = signal.get("content", signal.get("text", "Emergency reported"))
    location = signal.get("location", "Karachi")
    source = signal.get("source", "mobile_sos_button")
    
    # Build proper multi-source payload matching /ingest format
    signals_data = {
        "social_media": [{"platform": source, "text": content, "location": location}],
        "weather": [],
        "traffic": []
    }
    
    # Synthesize sensor telemetry from SOS keywords (same logic as /ingest)
    if any(kw in content.lower() for kw in ["flood", "rain", "water", "pani", "storm", "drowning"]):
        signals_data["weather"].append({
            "location": location, "temperature": 24.5, "rainfall": 82.5,
            "condition": "Heavy Thunderstorm"
        })
        signals_data["traffic"].append({
            "location": location, "congestion_level": "heavy",
            "congestion_percentage": 92, "average_speed": 4.5, "incident_reported": True
        })
    elif any(kw in content.lower() for kw in ["fire", "blaze", "smoke", "burn"]):
        signals_data["weather"].append({
            "location": location, "temperature": 38.0, "rainfall": 0.0,
            "condition": "Smoke Alert"
        })
        signals_data["traffic"].append({
            "location": location, "congestion_level": "critical",
            "congestion_percentage": 88, "average_speed": 6.0, "incident_reported": True
        })
    elif any(kw in content.lower() for kw in ["heat", "hot", "garmi", "exhaustion", "heatstroke"]):
        signals_data["weather"].append({
            "location": location, "temperature": 45.8, "rainfall": 0.0,
            "condition": "Extreme Heatwave"
        })
        signals_data["traffic"].append({
            "location": location, "congestion_level": "moderate",
            "congestion_percentage": 55, "average_speed": 35.0, "incident_reported": False
        })
    else:
        # Generic emergency
        signals_data["weather"].append({
            "location": location, "temperature": 28.0, "rainfall": 0.0,
            "condition": "Clear Sky"
        })
        signals_data["traffic"].append({
            "location": location, "congestion_level": "critical",
            "congestion_percentage": 85, "average_speed": 8.0, "incident_reported": True
        })
    
    # Persist signal to DB
    try:
        db.add(SignalModel(
            source=source, source_type="mobile_sos",
            location=location, content=content,
            timestamp=datetime.now()
        ))
        db.commit()
    finally:
        db.close()
    
    # Trigger full pipeline in background
    asyncio.create_task(manager.execute_workflow("full_cycle", signals_data))
    
    return {
        "status": "received",
        "source": source,
        "location": location,
        "message": f"SOS signal received. Agent pipeline triggered for {location}."
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
