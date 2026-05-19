"""
Event Detection Agent - Identifies anomalies, clusters, and crisis signals
Uses clustering and pattern recognition to detect emerging crises
"""

from typing import Dict, List, Any
from datetime import datetime, timedelta
import math
from agents.agent_manager import BaseAgent

class EventDetectionAgent(BaseAgent):
    """Detects crisis events from processed signals"""
    
    def __init__(self, agent_id: str, agent_manager):
        super().__init__(agent_id, agent_manager)
        self.event_history = []
        self.cluster_threshold = 2  # Minimum signals to form a cluster
        self.time_window = 30  # minutes
        
    async def setup_tools(self):
        """Setup clustering and anomaly detection tools"""
        self._log_trace("setup_tools", {"tools": ["clustering", "anomaly_detection", "spatial_analysis"]})
        
    async def process(self, signals: Dict) -> Dict[str, Any]:
        """Process signals to detect events"""
        self._log_trace("process", {"total_signals": signals["total_signals"]})
        
        detected_events = {
            "events": [],
            "clusters": [],
            "anomalies": [],
            "timestamp": datetime.now().isoformat(),
            "total_events": 0,
            "signals": signals
        }
        
        # Detect spatial clusters
        clusters = await self._detect_clusters(signals)
        detected_events["clusters"] = clusters
        
        # Detect temporal anomalies
        anomalies = await self._detect_anomalies(signals)
        detected_events["anomalies"] = anomalies
        
        # Synthesize events from clusters and anomalies
        events = await self._synthesize_events(clusters, anomalies, signals)
        detected_events["events"] = events
        detected_events["total_events"] = len(events)
        
        self._log_trace("process_complete", {
            "clusters_found": len(clusters),
            "anomalies_found": len(anomalies),
            "events_detected": len(events)
        })
        
        # Notify reasoning agent if events detected
        if len(events) > 0:
            await self.send_message(
                "reasoning",
                {"events": detected_events, "signals": signals},
                "events_detected"
            )
            
        return detected_events
        
    async def _detect_clusters(self, signals: Dict) -> List[Dict]:
        """Detect spatial clusters of signals"""
        clusters = []
        
        # Group signals by location
        location_groups = {}
        
        for signal in signals["social_media"]:
            location = signal["location"]
            if location != "unknown":
                if location not in location_groups:
                    location_groups[location] = []
                location_groups[location].append(signal)
                
        for signal in signals["traffic"]:
            location = signal["location"]
            if location != "unknown":
                if location not in location_groups:
                    location_groups[location] = []
                location_groups[location].append(signal)
                
        # Form clusters from location groups
        for location, group_signals in location_groups.items():
            if len(group_signals) >= self.cluster_threshold:
                cluster = {
                    "location": location,
                    "signal_count": len(group_signals),
                    "signals": group_signals,
                    "signal_types": list(set(s["source"] for s in group_signals)),
                    "urgency_levels": [s.get("urgency", "low") for s in group_signals if "urgency" in s],
                    "first_seen": min((s.get("timestamp") or datetime.now().isoformat()) for s in group_signals),
                    "last_seen": max((s.get("timestamp") or datetime.now().isoformat()) for s in group_signals),
                    "keywords": list(set(
                        kw for s in group_signals 
                        for kw in s.get("keywords", [])
                    ))
                }
                
                # Calculate cluster urgency
                cluster["cluster_urgency"] = self._calculate_cluster_urgency(cluster)
                clusters.append(cluster)
                
                self._log_trace("cluster_detected", {
                    "location": location,
                    "count": len(group_signals),
                    "urgency": cluster["cluster_urgency"]
                })
                
        return clusters
        
    async def _detect_anomalies(self, signals: Dict) -> List[Dict]:
        """Detect temporal and statistical anomalies"""
        anomalies = []
        
        # Check for traffic anomalies
        for traffic_signal in signals["traffic"]:
            if traffic_signal["congestion_percentage"] > 200:
                anomalies.append({
                    "type": "traffic_spike",
                    "location": traffic_signal["location"],
                    "severity": "high",
                    "value": traffic_signal["congestion_percentage"],
                    "description": f"Traffic congestion {traffic_signal['congestion_percentage']}% above normal"
                })
                
        # Check for weather anomalies
        for weather_signal in signals["weather"]:
            if weather_signal["alert_level"] in ["high", "critical"]:
                anomalies.append({
                    "type": "weather_alert",
                    "location": weather_signal["location"],
                    "coordinates": weather_signal.get("coordinates"),
                    "severity": weather_signal["alert_level"],
                    "value": weather_signal["rainfall"],
                    "description": f"Weather alert: {weather_signal['condition']}"
                })
                
        # Check for high-urgency social media
        for social_signal in signals["social_media"]:
            if social_signal["urgency"] == "high":
                anomalies.append({
                    "type": "urgent_report",
                    "location": social_signal["location"],
                    "severity": "high",
                    "description": f"Urgent report: {social_signal['text'][:50]}..."
                })
                
        self._log_trace("anomalies_detected", {"count": len(anomalies)})
        return anomalies
        
    async def _synthesize_events(self, clusters: List[Dict], anomalies: List[Dict], signals: Dict) -> List[Dict]:
        """Synthesize events from clusters and anomalies"""
        events = []
        
        # Create events from clusters
        for cluster in clusters:
            # Get coordinates from the first signal in the cluster that has them
            cluster_coords = next((s.get("coordinates") for s in cluster["signals"] if s.get("coordinates")), None)
            
            event = {
                "event_id": f"EVT-{datetime.now().strftime('%Y%m%d%H%M%S')}-{len(events)}",
                "type": self._classify_event_type(cluster),
                "location": cluster["location"],
                "coordinates": cluster_coords,
                "confidence": self._calculate_confidence(cluster, anomalies),
                "severity": self._calculate_severity(cluster),
                "signal_count": cluster["signal_count"],
                "description": self._generate_event_description(cluster),
                "related_anomalies": [
                    a for a in anomalies 
                    if a["location"] == cluster["location"]
                ],
                "timestamp": datetime.now().isoformat()
            }
            
            events.append(event)
            self._log_trace("event_synthesized", {
                "event_id": event["event_id"],
                "type": event["type"],
                "confidence": event["confidence"]
            })
            
        # Create events from standalone anomalies
        for anomaly in anomalies:
            if not any(e["location"] == anomaly["location"] for e in events):
                event = {
                    "event_id": f"EVT-{datetime.now().strftime('%Y%m%d%H%M%S')}-{len(events)}",
                    "type": anomaly["type"],
                    "location": anomaly["location"],
                    "coordinates": anomaly.get("coordinates"),
                    "confidence": 0.7,  # Lower confidence for single anomalies
                    "severity": anomaly["severity"],
                    "signal_count": 1,
                    "description": anomaly["description"],
                    "related_anomalies": [anomaly],
                    "timestamp": datetime.now().isoformat()
                }
                
                events.append(event)
                
        return events
        
    def _calculate_cluster_urgency(self, cluster: Dict) -> str:
        """Calculate overall cluster urgency"""
        urgency_scores = {"high": 3, "medium": 2, "low": 1}
        
        if not cluster["urgency_levels"]:
            return "low"
            
        avg_urgency = sum(urgency_scores.get(u, 1) for u in cluster["urgency_levels"]) / len(cluster["urgency_levels"])
        
        if avg_urgency >= 2.5:
            return "high"
        elif avg_urgency >= 1.5:
            return "medium"
        return "low"
        
    def _classify_event_type(self, cluster: Dict) -> str:
        """Classify the type of event based on signals"""
        keywords = cluster.get("keywords", [])
        signal_types = cluster.get("signal_types", [])
        
        # Check for flooding
        flood_keywords = ["flood", "flooding", "water", "pani", "bhar"]
        if any(kw in keywords for kw in flood_keywords):
            return "urban_flooding"
            
        # Check for traffic incidents
        if "traffic" in signal_types:
            return "traffic_incident"
            
        # Check for fire
        fire_keywords = ["fire", "burning", "smoke", "jalan"]
        if any(kw in keywords for kw in fire_keywords):
            return "fire"
            
        # Check for accidents
        accident_keywords = ["accident", "crash", "collision"]
        if any(kw in keywords for kw in accident_keywords):
            return "accident"
            
        return "general_incident"
        
    def _calculate_confidence(self, cluster: Dict, anomalies: List[Dict]) -> float:
        """Calculate confidence score for event detection"""
        confidence = 0.5  # Base confidence
        
        # Increase confidence based on signal count
        confidence += min(cluster["signal_count"] * 0.1, 0.3)
        
        # Increase confidence based on signal diversity
        diversity_bonus = len(cluster["signal_types"]) * 0.1
        confidence += min(diversity_bonus, 0.2)
        
        # Increase confidence if related anomalies exist
        related_anomalies = [a for a in anomalies if a["location"] == cluster["location"]]
        confidence += min(len(related_anomalies) * 0.1, 0.2)
        
        return min(confidence, 0.99)
        
    def _calculate_severity(self, cluster: Dict) -> str:
        """Calculate event severity"""
        urgency = cluster["cluster_urgency"]
        signal_count = cluster["signal_count"]
        
        if urgency == "high" and signal_count >= 3:
            return "critical"
        elif urgency == "high" or signal_count >= 3:
            return "high"
        elif urgency == "medium" or signal_count >= 2:
            return "medium"
        return "low"
        
    def _generate_event_description(self, cluster: Dict) -> str:
        """Generate human-readable event description"""
        location = cluster["location"]
        signal_count = cluster["signal_count"]
        keywords = ", ".join(cluster["keywords"][:5])
        
        return f"Cluster of {signal_count} signals detected at {location}. Keywords: {keywords}"
