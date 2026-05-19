"""
Database Setup - Initialize database connection and tables
"""

from datetime import datetime
from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, Text, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import aiosqlite
import asyncio

Base = declarative_base()

class Signal(Base):
    __tablename__ = "signals"
    
    id = Column(Integer, primary_key=True, index=True)
    source = Column(String, index=True)
    source_type = Column(String)  # social_media, weather, traffic
    location = Column(String, index=True)
    content = Column(Text)
    timestamp = Column(DateTime)
    processed = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.now)

class Crisis(Base):
    __tablename__ = "crises"
    
    id = Column(Integer, primary_key=True, index=True)
    crisis_id = Column(String, unique=True, index=True)
    crisis_type = Column(String)
    location = Column(String, index=True)
    severity = Column(String)
    confidence = Column(Float)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    humanitarian_score = Column(Float, nullable=True)
    ethical_reasoning = Column(Text, nullable=True)
    status = Column(String, default="active")
    description = Column(Text)
    detected_at = Column(DateTime)
    resolved_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.now)

class Action(Base):
    __tablename__ = "actions"
    
    id = Column(Integer, primary_key=True, index=True)
    action_id = Column(String, unique=True, index=True)
    plan_id = Column(String, index=True)
    action_type = Column(String)
    location = Column(String)
    priority = Column(String)
    status = Column(String, default="pending")
    result = Column(Text, nullable=True)
    executed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.now)

class AgentLog(Base):
    __tablename__ = "agent_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    agent_id = Column(String, index=True)
    timestamp = Column(DateTime, index=True)
    action = Column(String)
    details = Column(Text)
    status = Column(String)
    created_at = Column(DateTime, default=datetime.now)

class DispatchRecord(Base):
    __tablename__ = "dispatch_records"
    
    id = Column(Integer, primary_key=True, index=True)
    crisis_id = Column(String, index=True)
    crisis_type = Column(String)
    location = Column(String)
    severity = Column(String)
    authority_key = Column(String)
    authority_name = Column(String)
    authority_phone = Column(String)
    dispatch_method = Column(String)   # "twilio_sms" | "simulated"
    status = Column(String)            # "sent" | "simulated" | "failed"
    real_sms_sent = Column(Boolean, default=False)
    message_preview = Column(Text, nullable=True)
    dispatched_at = Column(DateTime)
    created_at = Column(DateTime, default=datetime.now)


# Database connection
DATABASE_URL = "sqlite:///./crisis_response.db"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

async def init_db():
    """Initialize database tables"""
    Base.metadata.create_all(bind=engine)
    print("Database initialized")

def get_db():
    """Get database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
