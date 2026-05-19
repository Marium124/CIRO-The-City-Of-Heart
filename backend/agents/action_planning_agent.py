"""
Action Planning Agent - Generates coordinated response actions
Uses Antigravity-style orchestration to plan and coordinate multi-agent actions
"""

from typing import Dict, List, Any
from datetime import datetime
import json
from agents.agent_manager import BaseAgent

class ActionPlanningAgent(BaseAgent):
    """Plans and coordinates response actions for detected crises"""
    
    def __init__(self, agent_id: str, agent_manager):
        super().__init__(agent_id, agent_manager)
        self.action_templates = self._load_action_templates()
        
    async def setup_tools(self):
        """Setup planning and coordination tools"""
        self._log_trace("setup_tools", {"tools": ["planning_engine", "coordinator", "resource_allocator"]})
        
    def _load_action_templates(self) -> Dict:
        """Load action templates for different crisis types"""
        return {
            "urban_flooding": [
                {
                    "action_type": "traffic_rerouting",
                    "priority": "high",
                    "estimated_duration": "30 min",
                    "resources": ["traffic_control", "signage"]
                },
                {
                    "action_type": "emergency_dispatch",
                    "priority": "critical",
                    "estimated_duration": "15 min",
                    "resources": ["rescue_teams", "boats", "medical"]
                },
                {
                    "action_type": "public_alert",
                    "priority": "high",
                    "estimated_duration": "5 min",
                    "resources": ["notification_system"]
                },
                {
                    "action_type": "infrastructure_assessment",
                    "priority": "medium",
                    "estimated_duration": "45 min",
                    "resources": ["engineering_team"]
                }
            ],
            "traffic_incident": [
                {
                    "action_type": "traffic_rerouting",
                    "priority": "high",
                    "estimated_duration": "20 min",
                    "resources": ["traffic_control"]
                },
                {
                    "action_type": "incident_response",
                    "priority": "high",
                    "estimated_duration": "30 min",
                    "resources": ["traffic_police", "tow_trucks"]
                }
            ],
            "fire": [
                {
                    "action_type": "emergency_dispatch",
                    "priority": "critical",
                    "estimated_duration": "10 min",
                    "resources": ["fire_trucks", "firefighters"]
                },
                {
                    "action_type": "evacuation",
                    "priority": "critical",
                    "estimated_duration": "15 min",
                    "resources": ["evacuation_team", "police"]
                },
                {
                    "action_type": "traffic_control",
                    "priority": "high",
                    "estimated_duration": "20 min",
                    "resources": ["traffic_control"]
                }
            ],
            "accident": [
                {
                    "action_type": "emergency_dispatch",
                    "priority": "critical",
                    "estimated_duration": "12 min",
                    "resources": ["ambulance", "medical_team"]
                },
                {
                    "action_type": "scene_secure",
                    "priority": "high",
                    "estimated_duration": "15 min",
                    "resources": ["police"]
                },
                {
                    "action_type": "traffic_rerouting",
                    "priority": "medium",
                    "estimated_duration": "25 min",
                    "resources": ["traffic_control"]
                }
            ]
        }
        
    async def process(self, input_data: Dict) -> Dict[str, Any]:
        """Process crisis analysis to generate action plan"""
        crisis = input_data.get("crisis", {})
        signals = input_data.get("signals", {})
        
        self._log_trace("process", {
            "crisis_type": crisis.get("crisis_type"),
            "severity": crisis.get("severity")
        })
        
        action_plan = {
            "plan_id": f"PLAN-{datetime.now().strftime('%Y%m%d%H%M%S')}",
            "crisis_id": crisis.get("event_id", "unknown"),
            "crisis_type": crisis.get("crisis_type"),
            "location": crisis.get("location"),
            "actions": [],
            "execution_order": [],
            "estimated_completion": None,
            "resource_requirements": {},
            "coordination_points": [],
            "timestamp": datetime.now().isoformat()
        }
        
        if not crisis.get("crisis_detected"):
            action_plan["status"] = "no_crisis"
            action_plan["message"] = "No crisis detected - no action plan needed"
            return action_plan
            
        # Generate actions based on crisis type
        actions = await self._generate_actions(crisis, signals)
        action_plan["actions"] = actions
        
        # Determine execution order
        execution_order = await self._determine_execution_order(actions)
        action_plan["execution_order"] = execution_order
        
        # Calculate resource requirements
        resource_requirements = await self._calculate_resources(actions)
        action_plan["resource_requirements"] = resource_requirements
        
        # Allocate resources from constrained pool
        from agents.resource_manager import ResourceManager
        rm = ResourceManager.get_instance()
        allocation_result = rm.allocate_resources(
            action_plan["plan_id"],
            action_plan["crisis_type"],
            crisis.get("severity", "low"),
            list(resource_requirements.keys())
        )
        action_plan["resource_allocation"] = allocation_result
        action_plan["resource_pool_snapshot"] = {k: v["available"] for k, v in rm.inventory.items()}
        
        # Identify coordination points
        coordination_points = await self._identify_coordination_points(actions)
        action_plan["coordination_points"] = coordination_points
        
        # Estimate completion time
        total_duration = sum(a.get("duration_minutes", 0) for a in actions)
        completion_time = datetime.now() + timedelta(minutes=total_duration)
        action_plan["estimated_completion"] = completion_time.isoformat()
        
        action_plan["status"] = "ready"
        
        self._log_trace("plan_generated", {
            "plan_id": action_plan["plan_id"],
            "actions_count": len(actions),
            "estimated_duration": total_duration
        })
        
        # Notify simulation agent
        await self.send_message(
            "simulation",
            {"action_plan": action_plan},
            "plan_ready"
        )
        
        return action_plan
        
    async def _generate_actions(self, crisis: Dict, signals: Dict) -> List[Dict]:
        """Generate specific actions based on crisis type and analysis"""
        crisis_type = crisis.get("crisis_type", "general_incident")
        severity = crisis.get("severity", "low")
        location = crisis.get("location", "unknown")
        
        # Get action templates
        templates = self.action_templates.get(crisis_type, [])
        
        actions = []
        for idx, template in enumerate(templates):
            action = {
                "action_id": f"ACT-{datetime.now().strftime('%Y%m%d%H%M%S')}-{idx}",
                "action_type": template["action_type"],
                "priority": template["priority"],
                "location": location,
                "resources": template["resources"],
                "status": "pending",
                "duration_minutes": self._parse_duration(template["estimated_duration"]),
                "dependencies": [],
                "parameters": self._generate_action_parameters(template, crisis, signals)
            }
            
            # Adjust priority based on severity
            if severity == "critical" and action["priority"] != "critical":
                action["priority"] = "high"
                
            actions.append(action)
            
        # Add recommended actions from reasoning
        recommendations = crisis.get("recommended_actions", [])
        for rec in recommendations:
            if not any(a["action_type"] == rec.lower().replace(" ", "_") for a in actions):
                action = {
                    "action_id": f"ACT-{datetime.now().strftime('%Y%m%d%H%M%S')}-{len(actions)}",
                    "action_type": rec.lower().replace(" ", "_"),
                    "priority": "medium",
                    "location": location,
                    "resources": ["general"],
                    "status": "pending",
                    "duration_minutes": 30,
                    "dependencies": [],
                    "parameters": {"description": rec}
                }
                actions.append(action)
                
        return actions
        
    def _parse_duration(self, duration_str: str) -> int:
        """Parse duration string to minutes"""
        if "min" in duration_str:
            return int(duration_str.split()[0])
        return 30  # Default
        
    def _generate_action_parameters(self, template: Dict, crisis: Dict, signals: Dict) -> Dict:
        """Generate specific parameters for an action"""
        params = {
            "crisis_type": crisis.get("crisis_type"),
            "severity": crisis.get("severity"),
            "affected_population": crisis.get("impact_assessment", {}).get("affected_population", 0)
        }
        
        # Add signal-based parameters
        if template["action_type"] == "traffic_rerouting":
            params["alternate_routes"] = self._suggest_alternate_routes(crisis.get("location"))
            
            # Fetch the actual congestion percentage from the active traffic signal if available, otherwise default to 85%
            initial_congestion = 85
            traffic_signals = signals.get("traffic", [])
            for sig in traffic_signals:
                if sig.get("location") == crisis.get("location") and sig.get("congestion_percentage"):
                    initial_congestion = sig.get("congestion_percentage")
                    break
            params["before_congestion_percent"] = initial_congestion
        elif template["action_type"] == "emergency_dispatch":
            params["dispatch_count"] = self._calculate_dispatch_count(crisis.get("severity"))
        elif template["action_type"] == "public_alert":
            params["alert_radius_km"] = 5 if crisis.get("severity") == "critical" else 2
            
        return params
        
    def _suggest_alternate_routes(self, location: str) -> List[str]:
        """Suggest alternate routes based on location (Dynamic/Mock)"""
        # In a real system, this would call the Google Directions API
        # to find humanitarian corridors around the crisis zone.
        
        # Generic fallback for any city in Pakistan
        return [
            f"Bypass via main arterial road",
            f"Redirect to humanitarian corridor B",
            f"Alternate route through service road"
        ]
        
    def _calculate_dispatch_count(self, severity: str) -> int:
        """Calculate number of emergency units based on humanitarian need"""
        dispatch_counts = {
            "critical": 8, # Increased for national impact
            "high": 5,
            "medium": 3,
            "low": 1
        }
        return dispatch_counts.get(severity, 1)
        
    async def _determine_execution_order(self, actions: List[Dict]) -> List[str]:
        """Determine optimal execution order for actions"""
        # Sort by priority
        priority_order = {"critical": 0, "high": 1, "medium": 2, "low": 3}
        
        sorted_actions = sorted(
            actions,
            key=lambda a: priority_order.get(a["priority"], 99)
        )
        
        # Set dependencies
        for i, action in enumerate(sorted_actions):
            if i > 0:
                action["dependencies"] = [sorted_actions[i-1]["action_id"]]
                
        return [a["action_id"] for a in sorted_actions]
        
    async def _calculate_resources(self, actions: List[Dict]) -> Dict[str, int]:
        """Calculate total resource requirements"""
        resources = {}
        
        for action in actions:
            for resource in action.get("resources", []):
                resources[resource] = resources.get(resource, 0) + 1
                
        return resources
        
    async def _identify_coordination_points(self, actions: List[Dict]) -> List[Dict]:
        """Identify points where agents need to coordinate"""
        coordination_points = []
        
        # Find actions that share resources
        resource_actions = {}
        for action in actions:
            for resource in action.get("resources", []):
                if resource not in resource_actions:
                    resource_actions[resource] = []
                resource_actions[resource].append(action["action_id"])
                
        for resource, action_ids in resource_actions.items():
            if len(action_ids) > 1:
                coordination_points.append({
                    "type": "resource_sharing",
                    "resource": resource,
                    "actions": action_ids,
                    "coordination_required": True
                })
                
        return coordination_points

from datetime import timedelta
