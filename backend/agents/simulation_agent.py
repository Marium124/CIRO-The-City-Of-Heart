"""
Simulation Agent - Executes simulated actions
Simulates traffic rerouting, emergency dispatch, alerts, and system updates
"""

from typing import Dict, List, Any
from datetime import datetime, timedelta
import random
from agents.agent_manager import BaseAgent

class SimulationAgent(BaseAgent):
    """Simulates execution of planned actions"""
    
    def __init__(self, agent_id: str, agent_manager):
        super().__init__(agent_id, agent_manager)
        self.simulation_state = {
            "active_simulations": {},
            "completed_simulations": [],
            "system_state": {
                "traffic_routes": {},
                "emergency_tickets": [],
                "alerts_sent": [],
                "resource_status": {}
            }
        }
        
    async def setup_tools(self):
        """Setup simulation tools"""
        self._log_trace("setup_tools", {"tools": ["traffic_simulator", "emergency_simulator", "alert_simulator"]})
        
    async def process(self, action_plan: Dict) -> Dict[str, Any]:
        """Process action plan and simulate execution"""
        self._log_trace("process", {
            "plan_id": action_plan["plan_id"],
            "actions_count": len(action_plan["actions"])
        })
        
        simulation_result = {
            "simulation_id": f"SIM-{datetime.now().strftime('%Y%m%d%H%M%S')}",
            "plan_id": action_plan["plan_id"],
            "actions_executed": [],
            "actions_failed": [],
            "system_state_before": self._get_system_state_snapshot(),
            "system_state_after": {},
            "metrics": {},
            "timestamp": datetime.now().isoformat()
        }
        
        # Execute actions in order
        for action_id in action_plan["execution_order"]:
            action = next((a for a in action_plan["actions"] if a["action_id"] == action_id), None)
            if action:
                execution_result = await self._execute_action(action)
                
                if execution_result["success"]:
                    simulation_result["actions_executed"].append({
                        "action_id": action_id,
                        "result": execution_result
                    })
                else:
                    simulation_result["actions_failed"].append({
                        "action_id": action_id,
                        "error": execution_result["error"]
                    })
                    
        # Calculate metrics
        metrics = await self._calculate_metrics(action_plan, simulation_result)
        simulation_result["metrics"] = metrics
        
        # Capture final system state
        simulation_result["system_state_after"] = self._get_system_state_snapshot()
        
        self._log_trace("simulation_complete", {
            "executed": len(simulation_result["actions_executed"]),
            "failed": len(simulation_result["actions_failed"]),
            "success_rate": metrics.get("success_rate", 0)
        })
        
        # Notify visualization agent
        await self.send_message(
            "visualization",
            {"simulation_result": simulation_result, "action_plan": action_plan},
            "simulation_complete"
        )
        
        return simulation_result
        
    async def _execute_action(self, action: Dict) -> Dict[str, Any]:
        """Execute a single action (simulated)"""
        action_type = action["action_type"]
        location = action["location"]
        
        self._log_trace("executing_action", {
            "action_type": action_type,
            "location": location
        })
        
        try:
            if action_type == "traffic_rerouting":
                result = await self._simulate_traffic_rerouting(action)
            elif action_type == "emergency_dispatch":
                result = await self._simulate_emergency_dispatch(action)
            elif action_type == "public_alert":
                result = await self._simulate_public_alert(action)
            elif action_type == "evacuation":
                result = await self._simulate_evacuation(action)
            elif action_type == "incident_response":
                result = await self._simulate_incident_response(action)
            elif action_type == "scene_secure":
                result = await self._simulate_scene_secure(action)
            elif action_type == "infrastructure_assessment":
                result = await self._simulate_infrastructure_assessment(action)
            else:
                result = await self._simulate_generic_action(action)
                
            return {"success": True, "result": result}
            
        except Exception as e:
            return {"success": False, "error": str(e)}
            
    async def _simulate_traffic_rerouting(self, action: Dict) -> Dict:
        """Simulate traffic rerouting with deterministic impact modeling and side-effects"""
        location = action["location"]
        alternate_routes = action["parameters"].get("alternate_routes", [])
        
        # Deterministic Model: Congestion reduction depends on alternative capacity
        routes_count = max(1, len(alternate_routes))
        base_reduction = 30 if routes_count == 1 else (55 if routes_count == 2 else 70)
        
        # Model spillover impact (Unintended side effect: neighboring street congestion rises)
        spillover_increase = int(base_reduction * 0.35)
        
        # Retrieve initial congestion from dynamic parameters
        before_congestion = action["parameters"].get("before_congestion_percent", 85)
        after_congestion = max(10, before_congestion - base_reduction)
        
        # Update system state
        self.simulation_state["system_state"]["traffic_routes"][location] = {
            "status": "rerouted",
            "alternate_routes": alternate_routes,
            "congestion_reduction": base_reduction,
            "before_congestion_percent": before_congestion,
            "after_congestion_percent": after_congestion,
            "spillover_congestion_increase_percent": spillover_increase,
            "timestamp": datetime.now().isoformat()
        }
        
        self._log_trace("traffic_rerouted", {
            "location": location,
            "routes": alternate_routes,
            "reduction": base_reduction,
            "side_effect": f"Spillover increased congestion by {spillover_increase}% on alternate arteries."
        })
        
        return {
            "action": "traffic_rerouting",
            "location": location,
            "routes_updated": len(alternate_routes),
            "before_state": f"{before_congestion}% Congestion",
            "after_state": f"{after_congestion}% Congestion",
            "estimated_congestion_reduction": base_reduction,
            "unintended_consequence": f"Traffic spillover increased secondary road congestion by {spillover_increase}%."
        }
        
    async def _simulate_emergency_dispatch(self, action: Dict) -> Dict:
        """Simulate emergency service dispatch"""
        location = action["location"]
        dispatch_count = action["parameters"].get("dispatch_count", 1)
        
        # Create emergency ticket
        ticket_id = f"CR-{datetime.now().strftime('%Y%m%d')}-{len(self.simulation_state['system_state']['emergency_tickets']) + 1}"
        
        ticket = {
            "ticket_id": ticket_id,
            "location": location,
            "units_dispatched": dispatch_count,
            "status": "dispatched",
            "eta_minutes": random.randint(8, 15),
            "timestamp": datetime.now().isoformat()
        }
        
        self.simulation_state["system_state"]["emergency_tickets"].append(ticket)
        
        self._log_trace("emergency_dispatched", {
            "ticket_id": ticket_id,
            "units": dispatch_count,
            "location": location
        })
        
        return {
            "action": "emergency_dispatch",
            "ticket_id": ticket_id,
            "units_dispatched": dispatch_count,
            "eta": ticket["eta_minutes"]
        }
        
    async def _simulate_public_alert(self, action: Dict) -> Dict:
        """Simulate sending public alerts"""
        location = action["location"]
        alert_radius = action["parameters"].get("alert_radius_km", 2)
        
        # Estimate affected users
        affected_users = random.randint(500, 2000)
        
        alert = {
            "alert_id": f"ALT-{datetime.now().strftime('%Y%m%d%H%M%S')}",
            "location": location,
            "radius_km": alert_radius,
            "users_notified": affected_users,
            "channels": ["sms", "app", "social_media"],
            "timestamp": datetime.now().isoformat()
        }
        
        self.simulation_state["system_state"]["alerts_sent"].append(alert)
        
        self._log_trace("alert_sent", {
            "alert_id": alert["alert_id"],
            "users": affected_users
        })
        
        return {
            "action": "public_alert",
            "alert_id": alert["alert_id"],
            "users_notified": affected_users,
            "channels": alert["channels"]
        }
        
    async def _simulate_evacuation(self, action: Dict) -> Dict:
        """Simulate evacuation"""
        location = action["location"]
        
        evacuated = random.randint(100, 500)
        
        self._log_trace("evacuation_simulated", {
            "location": location,
            "evacuated": evacuated
        })
        
        return {
            "action": "evacuation",
            "location": location,
            "people_evacuated": evacuated,
            "status": "in_progress"
        }
        
    async def _simulate_incident_response(self, action: Dict) -> Dict:
        """Simulate incident response"""
        location = action["location"]
        
        response_time = random.randint(10, 25)
        
        self._log_trace("incident_response_simulated", {
            "location": location,
            "response_time": response_time
        })
        
        return {
            "action": "incident_response",
            "location": location,
            "response_time_minutes": response_time,
            "status": "responding"
        }
        
    async def _simulate_scene_secure(self, action: Dict) -> Dict:
        """Simulate scene securing"""
        location = action["location"]
        
        self._log_trace("scene_secured", {"location": location})
        
        return {
            "action": "scene_secure",
            "location": location,
            "status": "secured"
        }
        
    async def _simulate_infrastructure_assessment(self, action: Dict) -> Dict:
        """Simulate infrastructure assessment"""
        location = action["location"]
        
        damage_level = random.choice(["minor", "moderate", "severe"])
        
        self._log_trace("infrastructure_assessed", {
            "location": location,
            "damage": damage_level
        })
        
        return {
            "action": "infrastructure_assessment",
            "location": location,
            "damage_level": damage_level,
            "repair_estimate_days": random.randint(1, 7)
        }
        
    async def _simulate_generic_action(self, action: Dict) -> Dict:
        """Simulate generic action"""
        self._log_trace("generic_action_simulated", {
            "action_type": action["action_type"]
        })
        
        return {
            "action": action["action_type"],
            "location": action["location"],
            "status": "completed"
        }
        
    async def _calculate_metrics(self, action_plan: Dict, simulation_result: Dict) -> Dict[str, Any]:
        """Calculate simulation metrics"""
        total_actions = len(action_plan["actions"])
        executed_actions = len(simulation_result["actions_executed"])
        
        metrics = {
            "total_actions": total_actions,
            "actions_executed": executed_actions,
            "actions_failed": len(simulation_result["actions_failed"]),
            "success_rate": (executed_actions / total_actions * 100) if total_actions > 0 else 0,
            "estimated_time_saved_minutes": 0,
            "congestion_reduction_percent": 0,
            "people_alerted": 0,
            "emergency_tickets_created": len(self.simulation_state["system_state"]["emergency_tickets"])
        }
        
        # Calculate specific metrics based on actions
        for execution in simulation_result["actions_executed"]:
            result = execution["result"]
            
            if "congestion_reduction" in result:
                metrics["congestion_reduction_percent"] = result["congestion_reduction"]
                
            if "users_notified" in result:
                metrics["people_alerted"] += result["users_notified"]
                
            if "eta" in result:
                metrics["estimated_time_saved_minutes"] += (30 - result["eta"])  # Baseline 30 min
                
        return metrics
        
    def _get_system_state_snapshot(self) -> Dict:
        """Get current system state snapshot"""
        return {
            "traffic_routes": self.simulation_state["system_state"]["traffic_routes"].copy(),
            "emergency_tickets_count": len(self.simulation_state["system_state"]["emergency_tickets"]),
            "alerts_sent_count": len(self.simulation_state["system_state"]["alerts_sent"]),
            "timestamp": datetime.now().isoformat()
        }
