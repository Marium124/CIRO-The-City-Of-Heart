"""
Reasoning Agent - Combines signals to infer situations and estimate severity
Provides confidence levels and explanations for detected events
"""

from typing import Dict, List, Any
from datetime import datetime
from agents.agent_manager import BaseAgent

from agents.location_utils import LocationUtils

class ReasoningAgent(BaseAgent):
    """Reasons about detected events to infer crisis situations with humanitarian weight"""
    
    def __init__(self, agent_id: str, agent_manager):
        super().__init__(agent_id, agent_manager)
        self.reasoning_rules = self._load_reasoning_rules()
        
    async def setup_tools(self):
        """Setup reasoning and inference tools"""
        self._log_trace("setup_tools", {
            "tools": ["inference_engine", "ethical_reasoning_v2", "vulnerability_analyzer"]
        })
        
    def _load_reasoning_rules(self) -> Dict:
        """Load reasoning rules for crisis inference"""
        return {
            "urban_flooding": {
                "required_signals": ["social_media", "weather"],
                "required_keywords": ["flood", "water", "rain"],
                "weather_condition": ["heavy_rain", "storm"],
                "traffic_indicator": "high_congestion",
                "confidence_boost": 0.2
            },
            "medical_emergency": {
                "required_signals": ["social_media"],
                "required_keywords": ["medical", "injury", "sick"],
                "confidence_boost": 0.25
            },
            "explosion": {
                "required_signals": ["social_media"],
                "required_keywords": ["explosion", "blast", "bomb"],
                "confidence_boost": 0.35
            },
            "traffic_incident": {
                "required_signals": ["traffic"],
                "traffic_congestion_threshold": 150,
                "confidence_boost": 0.15
            },
            "heatwave": {
                "required_signals": ["weather"],
                "required_keywords": ["heat", "hot", "sunstroke"],
                "confidence_boost": 0.3
            },
            "fire": {
                "required_signals": ["social_media"],
                "required_keywords": ["fire", "burning", "smoke"],
                "confidence_boost": 0.25
            },
            "accident": {
                "required_signals": ["social_media", "traffic"],
                "required_keywords": ["accident", "crash"],
                "traffic_indicator": "incident_reported",
                "confidence_boost": 0.2
            }
        }
        
    async def process(self, events_data: Dict) -> Dict[str, Any]:
        """Process detected events with humanitarian prioritizing"""
        self._log_trace("process", {"events_count": events_data["total_events"]})
        
        analysis = {
            "crisis_detected": False,
            "crisis_type": None,
            "confidence": 0.0,
            "severity": "low",
            "location": None,
            "coordinates": {"lat": 0, "lng": 0},
            "humanitarian_impact_score": 0.0,
            "ethical_reasoning": "",
            "impact_assessment": {},
            "explanation": "",
            "recommended_actions": [],
            "timestamp": datetime.now().isoformat()
        }
        
        if events_data["total_events"] == 0:
            analysis["explanation"] = "No significant events detected"
            return analysis
            
        # Analyze each event
        for event in events_data["events"]:
            event_analysis = await self._analyze_event(event, events_data)
            
            # Use humanitarian impact score as the primary driver for "Most Significant Event"
            if event_analysis["humanitarian_impact_score"] > analysis["humanitarian_impact_score"]:
                analysis.update(event_analysis)
                
        # Determine if crisis is detected
        analysis["crisis_detected"] = analysis["confidence"] > 0.7
        
        if analysis["crisis_detected"]:
            analysis["recommended_actions"] = await self._generate_recommendations(analysis)
            
            # Notify action planning agent
            await self.send_message(
                "action_planning",
                {"crisis_analysis": analysis},
                "crisis_confirmed"
            )
            
        self._log_trace("ethical_reasoning_complete", {
            "crisis_detected": analysis["crisis_detected"],
            "impact_score": analysis["humanitarian_impact_score"],
            "city": analysis["impact_assessment"].get("city")
        })
        
        return analysis
        
    async def _analyze_event(self, event: Dict, events_data: Dict) -> Dict[str, Any]:
        """Analyze a single event with national-scale context"""
        event_type = event["type"]
        location = event["location"]
        coords = event.get("coordinates") or {"lat": 33.6844, "lng": 73.0479}
        
        # Get reasoning rules for this event type
        rules = self.reasoning_rules.get(event_type, {})
        
        # Calculate base confidence
        confidence = event["confidence"]
        
        # Load engine config
        import json
        import os
        engine = "AGENT_BASED"
        config_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "config.json")
        if os.path.exists(config_path):
            try:
                with open(config_path, "r") as f:
                    config_data = json.load(f)
                    engine = config_data.get("REASONING_ENGINE", "AGENT_BASED")
            except Exception:
                pass
                
        # Assess Humanitarian Impact using National Scale Utils
        vuln_profile = LocationUtils.get_vulnerability_profile(location, coords["lat"], coords["lng"])
        
        gemini_plan = {}
        if engine == "STATIC":
            # Apply static reasoning rules
            if rules:
                confidence = self._apply_reasoning_rules(event, events_data, rules, confidence)
            gemini_plan = {
                "plan": f"Applied Static Rule Engine for {event_type}",
                "risks": "Static rules cannot adapt dynamically.",
                "fallback": "Standard emergency response protocol."
            }
        else:
            # GEMINI PROBLEM-SOLVING LOOP (Task 2.1 & 2.4 & 2.5)
            gemini_plan = self._solve_crisis_with_gemini(event, vuln_profile)
            # Use Gemini's threat score for confidence mapping
            confidence = min(0.99, gemini_plan.get("threat_score", 5) / 10.0)
            
        impact_score = LocationUtils.calculate_life_years_saved(
            event_type, 
            event["severity"], 
            vuln_profile["population_density"]
        )
        
        # Assess impact
        impact = await self._assess_impact(event, vuln_profile)
        
        # Generate Ethical Reasoning
        ethical_reasoning = self._generate_ethical_reasoning(event, vuln_profile, impact_score)
        
        # Generate explanation
        explanation = self._generate_explanation(event, vuln_profile, confidence)
        
        return {
            "crisis_type": event_type,
            "confidence": confidence,
            "severity": event["severity"],
            "location": location,
            "coordinates": coords,
            "humanitarian_impact_score": impact_score,
            "ethical_reasoning": ethical_reasoning,
            "impact_assessment": {**impact, **vuln_profile},
            "explanation": explanation,
            "event_id": event["event_id"],
            "gemini_plan": gemini_plan.get("plan", ""),
            "gemini_risks": gemini_plan.get("risks", ""),
            "gemini_fallback": gemini_plan.get("fallback", "")
        }
        
    def _generate_ethical_reasoning(self, event: Dict, vuln_profile: Dict, impact_score: float) -> str:
        """Generates human-centric ethical reasoning for the trace"""
        city = vuln_profile["city"]
        density = vuln_profile["population_density"]
        
        reasoning = f"Prioritizing {city} due to {density} population density. "
        if vuln_profile["vulnerability_score"] > 0.7:
            reasoning += "Location identified as highly vulnerable with strained infrastructure. "
        
        reasoning += f"Humanitarian impact index: {impact_score:.1f}. "
        reasoning += "Focusing on life-safety over purely economic infrastructure protection."
        
        return reasoning

    def _solve_crisis_with_gemini(self, event: Dict, city_context: Dict) -> Dict:
        """
        Uses Gemini to generate a threat assessment and problem-solving plan.
        Implements Task 2.1 & 2.4 PDCA logic.
        """
        import os
        import json
        try:
            import vertexai
            from vertexai.generative_models import GenerativeModel
            # Initialize Vertex AI
            project_id = os.environ.get('GCP_PROJECT_ID')
            if project_id:
                vertexai.init(project=project_id, location='us-central1')
                model = GenerativeModel("gemini-1.5-flash-002")
                
                # Retrieve past experiences from DB
                from database.db_setup import SessionLocal, Experience
                db = SessionLocal()
                try:
                    past_experiences = db.query(Experience).filter(Experience.success_score.isnot(None)).order_by(Experience.timestamp.desc()).limit(3).all()
                    similar_past = [{"action": exp.action_taken, "success": exp.success_score} for exp in past_experiences]
                finally:
                    db.close()

                prompt = f"""
                You are an expert urban crisis coordinator for {city_context.get('city')}.
                Analyze the following incoming emergency signal and provide a threat assessment.
                Signal: {json.dumps(event)}
                Current Context: Population density: {city_context.get('population_density')}, Medical infrastructure: {city_context.get('medical_infrastructure')}
                Past similar events (with success scores): {json.dumps(similar_past)}
                
                Propose an action plan, then predict:
                - What could go wrong?
                - What is the fallback if it fails?
                
                Respond ONLY with a valid JSON object in this exact format:
                {{
                    "threat_score": <integer 1-10>,
                    "recommended_resources": [<list of strings>],
                    "plan": "<String describing the plan>",
                    "risks": "<String describing what could go wrong>",
                    "fallback": "<String describing the fallback>",
                    "reasoning": "<Brief explanation of your thought process>"
                }}
                """
                response = model.generate_content(prompt)
                
                # Strip Markdown code blocks if present
                clean_text = response.text.replace("```json", "").replace("```", "").strip()
                return json.loads(clean_text)
            else:
                raise Exception("GCP_PROJECT_ID not set")
        except Exception as e:
            print(f"[ReasoningAgent] Gemini fallback triggered due to error or missing config: {e}")
            # Fallback to static rules for local testing without GCP
            return {
                "threat_score": 8 if event.get("severity") == "critical" else 5,
                "recommended_resources": ["ambulance", "police"],
                "plan": f"Dispatch standard response to {city_context.get('city')}",
                "risks": "Traffic congestion",
                "fallback": "Air support",
                "reasoning": "Standard static fallback applied."
            }

    def _apply_reasoning_rules(self, event: Dict, events_data: Dict, rules: Dict, base_confidence: float) -> float:
        """Apply reasoning rules to adjust confidence"""
        confidence = base_confidence
        
        # Check for required signal types
        required_signals = rules.get("required_signals", [])
        available_signals = set()
        
        for signal_type in ["social_media", "weather", "traffic"]:
            if events_data["signals"].get(signal_type):
                available_signals.add(signal_type)
                
        if all(req in available_signals for req in required_signals):
            confidence += rules.get("confidence_boost", 0)
            
        return min(confidence, 0.99)
        
    async def _assess_impact(self, event: Dict, vuln_profile: Dict) -> Dict[str, Any]:
        """Assess the potential impact based on provincial profile"""
        impact = {
            "affected_population": 0,
            "traffic_impact": "none",
            "infrastructure_risk": "low",
            "safety_risk": "low",
            "economic_impact": "low"
        }
        
        event_type = event["type"]
        severity = event["severity"]
        
        # Estimate affected population based on density
        density_map = {"critical": 500000, "very_high": 200000, "high": 100000, "medium": 50000, "low": 10000}
        impact["affected_population"] = density_map.get(vuln_profile["population_density"], 20000)
        
        # Assess traffic impact
        if event_type in ["urban_flooding", "traffic_incident", "accident"]:
            impact["traffic_impact"] = "severe" if severity == "critical" else "moderate"
                
        # Assess safety risk
        impact["safety_risk"] = severity if severity in ["critical", "high"] else "medium"
            
        return impact
        
    def _generate_explanation(self, event: Dict, vuln_profile: Dict, confidence: float) -> str:
        """Generate human-readable explanation with national context"""
        event_type = event["type"]
        city = vuln_profile["city"]
        
        explanation_parts = [
            f"Detected {event_type.replace('_', ' ')} in {city}. ",
            f"Confidence is {confidence*100:.0f}% with a {vuln_profile['population_density']} impact radius. "
        ]
        
        if vuln_profile["vulnerability_score"] > 0.6:
            explanation_parts.append("Urgent response required due to high local vulnerability.")
        
        return "".join(explanation_parts)
        
    async def _generate_recommendations(self, analysis: Dict) -> List[str]:
        """Generate recommended actions with humanitarian focus"""
        recommendations = []
        crisis_type = analysis["crisis_type"]
        severity = analysis["severity"]
        
        # Type-specific recommendations
        if crisis_type == "urban_flooding":
            recommendations.extend([
                "Activate local emergency response teams",
                "Deploy humanitarian aid to katchi abadis/vulnerable zones",
                "Issue multi-lingual public alerts (English/Urdu/Regional)"
            ])
        elif crisis_type == "heatwave":
            recommendations.extend([
                "Set up emergency hydration stations",
                "Coordinate with hospitals for heatstroke management",
                "Issue stay-safe advisories for vulnerable citizens"
            ])
        else:
            recommendations.append("Standard emergency protocol activated")
            
        if severity == "critical":
            recommendations.append("Escalate to Provincial Disaster Management Authority (PDMA)")
            
        return recommendations

