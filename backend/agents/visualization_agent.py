"""
Visualization Agent - Generates before/after scenarios and impact reports
Creates visualizations for system outcomes
"""

from typing import Dict, List, Any
from datetime import datetime
from agents.agent_manager import BaseAgent

class VisualizationAgent(BaseAgent):
    """Generates visualizations and impact reports"""
    
    def __init__(self, agent_id: str, agent_manager):
        super().__init__(agent_id, agent_manager)
        
    async def setup_tools(self):
        """Setup visualization tools"""
        self._log_trace("setup_tools", {"tools": ["chart_generator", "report_generator", "comparison_engine"]})
        
    async def process(self, final_result: Dict) -> Dict[str, Any]:
        """Process final results to generate visualizations"""
        self._log_trace("process", {"has_simulation": "simulation" in final_result})
        
        visualization_data = {
            "visualization_id": f"VIZ-{datetime.now().strftime('%Y%m%d%H%M%S')}",
            "crisis_summary": self._generate_crisis_summary(final_result),
            "before_after_comparison": self._generate_before_after(final_result),
            "impact_metrics": self._generate_impact_metrics(final_result),
            "action_timeline": self._generate_action_timeline(final_result),
            "agent_trace_summary": self._generate_agent_trace_summary(final_result),
            "recommendations": self._generate_recommendations(final_result),
            "timestamp": datetime.now().isoformat()
        }
        
        self._log_trace("visualization_complete", {
            "viz_id": visualization_data["visualization_id"]
        })
        
        return visualization_data
        
    def _generate_crisis_summary(self, final_result: Dict) -> Dict:
        """Generate crisis summary"""
        crisis = final_result.get("crisis", {})
        
        return {
            "crisis_type": crisis.get("crisis_type", "unknown"),
            "location": crisis.get("location", "unknown"),
            "severity": crisis.get("severity", "unknown"),
            "confidence": crisis.get("confidence", 0),
            "detected_at": final_result.get("timestamp", datetime.now().isoformat()),
            "description": crisis.get("explanation", "No description available")
        }
        
    def _generate_before_after(self, final_result: Dict) -> Dict:
        """Generate before/after comparison"""
        simulation = final_result.get("simulation", {})
        metrics = simulation.get("metrics", {})
        
        before_state = {
            "traffic_congestion": "high",
            "emergency_response": "none",
            "public_awareness": "low",
            "system_status": "normal"
        }
        
        after_state = {
            "traffic_congestion": f"reduced by {metrics.get('congestion_reduction_percent', 0)}%",
            "emergency_response": f"{metrics.get('emergency_tickets_created', 0)} units dispatched",
            "public_awareness": f"{metrics.get('people_alerted', 0)} people alerted",
            "system_status": "active_response"
        }
        
        return {
            "before": before_state,
            "after": after_state,
            "improvement_summary": self._generate_improvement_summary(before_state, after_state, metrics)
        }
        
    def _generate_improvement_summary(self, before: Dict, after: Dict, metrics: Dict) -> List[str]:
        """Generate summary of improvements"""
        improvements = []
        
        if metrics.get("congestion_reduction_percent", 0) > 50:
            improvements.append("✅ Traffic congestion significantly reduced")
            
        if metrics.get("emergency_tickets_created", 0) > 0:
            improvements.append("✅ Emergency services dispatched")
            
        if metrics.get("people_alerted", 0) > 100:
            improvements.append("✅ Public alerts successfully sent")
            
        if metrics.get("success_rate", 0) > 80:
            improvements.append("✅ High action execution success rate")
            
        return improvements
        
    def _generate_impact_metrics(self, final_result: Dict) -> Dict:
        """Generate impact metrics"""
        simulation = final_result.get("simulation", {})
        metrics = simulation.get("metrics", {})
        crisis = final_result.get("crisis", {})
        
        return {
            "response_time": f"{metrics.get('estimated_time_saved_minutes', 0)} minutes saved",
            "people_reached": metrics.get("people_alerted', 0"),
            "congestion_improvement": f"{metrics.get('congestion_reduction_percent', 0)}%",
            "actions_completed": metrics.get('actions_executed', 0),
            "success_rate": f"{metrics.get('success_rate', 0):.1f}%",
            "affected_population": crisis.get("impact_assessment", {}).get("affected_population", 0)
        }
        
    def _generate_action_timeline(self, final_result: Dict) -> List[Dict]:
        """Generate action execution timeline"""
        simulation = final_result.get("simulation", {})
        actions_executed = simulation.get("actions_executed", [])
        
        timeline = []
        for idx, execution in enumerate(actions_executed):
            timeline.append({
                "step": idx + 1,
                "action_id": execution["action_id"],
                "action_type": execution["result"].get("action", "unknown"),
                "status": "completed",
                "details": execution["result"]
            })
            
        return timeline
        
    def _generate_agent_trace_summary(self, final_result: Dict) -> Dict:
        """Generate agent trace summary"""
        # This would typically pull from the agent manager's trace log
        return {
            "agents_involved": [
                "signal_ingestion",
                "event_detection",
                "reasoning",
                "action_planning",
                "simulation",
                "visualization"
            ],
            "total_steps": 6,
            "workflow_duration": "approximately 5 seconds",
            "coordination_points": 3
        }
        
    def _generate_recommendations(self, final_result: Dict) -> List[str]:
        """Generate follow-up recommendations"""
        recommendations = [
            "Continue monitoring the situation for developments",
            "Prepare contingency plans for escalation",
            "Review response effectiveness after crisis resolution",
            "Update crisis response protocols based on lessons learned"
        ]
        
        crisis = final_result.get("crisis", {})
        if crisis.get("severity") == "critical":
            recommendations.insert(0, "Maintain elevated alert status for next 24 hours")
            recommendations.insert(1, "Schedule follow-up assessment in 2 hours")
            
        return recommendations
