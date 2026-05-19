"""
Signal Ingestion Agent - Processes multi-source signals
Handles social media, weather, and traffic data inputs
"""

from typing import Dict, List, Any
from datetime import datetime
import re
import os
from agents.agent_manager import BaseAgent

try:
    from pyowm import OWM
    from pyowm.utils.config import get_default_config
    OWM_INSTALLED = True
except ImportError:
    OWM_INSTALLED = False

class SignalIngestionAgent(BaseAgent):
    """Ingests and processes signals from multiple sources"""
    
    def __init__(self, agent_id: str, agent_manager):
        super().__init__(agent_id, agent_manager)
        self.signal_buffer = []
        
    async def setup_tools(self):
        """Setup NLP tools for text processing"""
        self._log_trace("setup_tools", {"tools": ["text_processor", "location_extractor", "language_detector"]})
        
    async def process(self, input_data: Dict) -> Dict[str, Any]:
        """Process incoming signals from various sources"""
        self._log_trace("process", {"input_type": input_data.get("type", "unknown")})
        
        processed_signals = {
            "social_media": [],
            "weather": [],
            "traffic": [],
            "timestamp": datetime.now().isoformat(),
            "total_signals": 0
        }
        
        # Process social media signals
        if "social_media" in input_data:
            social_signals = await self._process_social_media(input_data["social_media"])
            processed_signals["social_media"] = social_signals
            
        # Process weather signals
        if "weather" in input_data:
            weather_signals = await self._process_weather(input_data["weather"])
            processed_signals["weather"] = weather_signals
            
        # Process traffic signals
        if "traffic" in input_data:
            traffic_signals = await self._process_traffic(input_data["traffic"])
            processed_signals["traffic"] = traffic_signals
            
        processed_signals["total_signals"] = (
            len(processed_signals["social_media"]) + 
            len(processed_signals["weather"]) + 
            len(processed_signals["traffic"])
        )
        
        self._log_trace("process_complete", {
            "social_count": len(processed_signals["social_media"]),
            "weather_count": len(processed_signals["weather"]),
            "traffic_count": len(processed_signals["traffic"])
        })
        
        # Notify event detection agent
        if processed_signals["total_signals"] > 0:
            await self.send_message(
                "event_detection",
                {"signals": processed_signals},
                "new_signals"
            )
            
        return processed_signals
        
    async def _process_social_media(self, posts: List[Dict]) -> List[Dict]:
        """Process social media posts"""
        processed = []
        
        for post in posts:
            text = post.get("text", "") or post.get("content", "")
            
            # Extract location
            location = self._extract_location(text)
            
            # Detect language (simplified)
            language = self._detect_language(text)
            
            # Extract keywords
            keywords = self._extract_keywords(text)
            
            processed_signal = {
                "source": "social_media",
                "platform": post.get("platform", "mobile_app" if "mobile" in str(post.get("source", "")) else "unknown"),
                "text": text,
                "location": location if location != "unknown" else post.get("location", "unknown"),
                "coordinates": post.get("coordinates"),
                "language": language,
                "keywords": keywords,
                "timestamp": post.get("timestamp") or datetime.now().isoformat(),
                "urgency": self._assess_urgency(text),
                "processed_at": datetime.now().isoformat()
            }
            
            processed.append(processed_signal)
            self._log_trace("social_media_processed", {"location": location, "urgency": processed_signal["urgency"]})
            
        return processed
        
    async def _process_weather(self, weather_data: List[Dict]) -> List[Dict]:
        """Process weather data"""
        processed = []
        
        for data in weather_data:
            processed_signal = {
                "source": "weather",
                "location": data.get("location", "unknown"),
                "coordinates": data.get("coordinates"),
                "temperature": data.get("temperature", 0),
                "rainfall": data.get("rainfall", 0),
                "condition": data.get("condition", "unknown"),
                "timestamp": data.get("timestamp") or datetime.now().isoformat(),
                "processed_at": datetime.now().isoformat()
            }
            
            # Try fetching real data from OpenWeatherMap
            api_key = os.environ.get('OPENWEATHER_API_KEY')
            loc = processed_signal.get("location", "unknown")
            
            if OWM_INSTALLED and api_key and loc != "unknown":
                try:
                    config_dict = get_default_config()
                    config_dict['language'] = 'en'
                    owm = OWM(api_key, config_dict)
                    mgr = owm.weather_manager()
                    
                    # OWM lookup
                    observation = mgr.weather_at_place(f"{loc}, PK")
                    w = observation.weather
                    
                    processed_signal["temperature"] = w.temperature('celsius')['temp']
                    processed_signal["rainfall"] = w.rain.get('1h', 0) if w.rain else 0
                    processed_signal["condition"] = w.detailed_status
                except Exception as e:
                    print(f"[SignalIngestionAgent] OWM fetch failed for {loc}: {e}")
            
            processed_signal["alert_level"] = self._assess_weather_alert(processed_signal)
            
            processed.append(processed_signal)
            self._log_trace("weather_processed", {"location": data.get("location"), "alert": processed_signal["alert_level"]})
            
        return processed
        
    async def _process_traffic(self, traffic_data: List[Dict]) -> List[Dict]:
        """Process traffic data"""
        processed = []
        
        for data in traffic_data:
            processed_signal = {
                "source": "traffic",
                "location": data.get("location", "unknown"),
                "coordinates": data.get("coordinates"),
                "congestion_level": data.get("congestion_level", "normal"),
                "congestion_percentage": data.get("congestion_percentage", 0),
                "average_speed": data.get("average_speed", 0),
                "incident_reported": data.get("incident_reported", False),
                "timestamp": data.get("timestamp") or datetime.now().isoformat(),
                "processed_at": datetime.now().isoformat()
            }
            
            processed.append(processed_signal)
            self._log_trace("traffic_processed", {
                "location": data.get("location"),
                "congestion": processed_signal["congestion_level"]
            })
            
        return processed
        
    def _extract_location(self, text: str) -> str:
        """Extract location from text"""
        # Common Islamabad/Rawalpindi locations
        locations = [
            "Karachi", "Lahore", "Peshawar", "Quetta", "Multan", "Faisalabad",
            "G-10", "G-11", "G-8", "G-7", "G-6", "G-5",
            "F-10", "F-11", "F-8", "F-7", "F-6", "F-5",
            "George Town", "Blue Area", "Jinnah Avenue",
            "Rawalpindi", "Islamabad", "Saddar", "Murree Road"
        ]
        
        text_lower = text.lower()
        for location in locations:
            if location.lower() in text_lower:
                return location
                
        return "unknown"
        
    def _detect_language(self, text: str) -> str:
        """Detect language (simplified)"""
        # Check for Roman Urdu indicators
        urdu_indicators = ["mein", "hai", "gayi", "gaariyan", "phans", "bhar", "pani", "kya", "ho"]
        text_lower = text.lower()
        
        if any(indicator in text_lower for indicator in urdu_indicators):
            return "roman_urdu"
        return "english"
        
    def _extract_keywords(self, text: str) -> List[str]:
        """Extract crisis-related keywords"""
        crisis_keywords = [
            "flood", "flooding", "water", "rain", "storm",
            "accident", "crash", "collision",
            "fire", "burning", "smoke",
            "block", "blocked", "stuck", "stranded",
            "emergency", "help", "rescue",
            "pani", "bhar", "gaariyan", "phans", "jalan"
        ]
        
        text_lower = text.lower()
        found_keywords = [kw for kw in crisis_keywords if kw in text_lower]
        
        return found_keywords
        
    def _assess_urgency(self, text: str) -> str:
        """Assess urgency level from text"""
        high_urgency = ["emergency", "help", "rescue", "critical", "immediate", "danger"]
        medium_urgency = ["issue", "problem", "concern", "warning"]
        
        text_lower = text.lower()
        
        if any(word in text_lower for word in high_urgency):
            return "high"
        elif any(word in text_lower for word in medium_urgency):
            return "medium"
        return "low"
        
    def _assess_weather_alert(self, weather_data: Dict) -> str:
        """Assess weather alert level"""
        rainfall = weather_data.get("rainfall", 0)
        condition = weather_data.get("condition", "").lower()
        
        if rainfall > 50 or "storm" in condition or "flood" in condition:
            return "critical"
        elif rainfall > 25 or "heavy" in condition:
            return "high"
        elif rainfall > 10:
            return "medium"
        return "low"
