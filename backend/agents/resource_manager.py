"""
Resource Manager - Handles constrained municipal resource pools, priority knapsack allocation,
and multi-crisis coordination decisions.
"""

from typing import Dict, List, Any
import logging

class ResourceManager:
    _instance = None

    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    def __init__(self):
        # Constrained Municipal Resource Inventory
        self.inventory = {
            "rescue_teams": {"total": 4, "available": 4, "icon": "groups"},
            "boats": {"total": 2, "available": 2, "icon": "directions_boat"},
            "fire_trucks": {"total": 3, "available": 3, "icon": "local_fire_department"},
            "ambulances": {"total": 3, "available": 3, "icon": "medical_services"},
            "water_pumps": {"total": 2, "available": 2, "icon": "opacity"},
            "police_units": {"total": 5, "available": 5, "icon": "local_police"}
        }
        self.active_allocations = {} # Map crisis_id -> allocated resources

    def reset_inventory(self):
        """Reset resource counts to full municipal capacity"""
        for r_type in self.inventory:
            self.inventory[r_type]["available"] = self.inventory[r_type]["total"]
        self.active_allocations.clear()

    def allocate_resources(self, crisis_id: str, crisis_type: str, severity: str, required_types: List[str]) -> Dict[str, Any]:
        """
        Attempts to allocate requested municipal resources from the constrained pool.
        If resources are depleted, executes a priority knapsack/urgency score check.
        """
        allocation = {
            "status": "success",
            "allocated": {},
            "queued": {},
            "explanation": "",
            "urgency_score": self._calculate_urgency(severity, crisis_type)
        }

        # Determine exact unit counts requested based on severity
        scale = 2 if severity in ["critical", "high"] else 1
        
        for r_type in required_types:
            # Map general category keywords to inventory types
            inv_type = self._map_to_inventory_type(r_type, crisis_type)
            if not inv_type:
                continue

            requested_units = scale
            available = self.inventory[inv_type]["available"]

            if available >= requested_units:
                # Deduct units from municipal pool
                self.inventory[inv_type]["available"] -= requested_units
                allocation["allocated"][inv_type] = requested_units
            elif available > 0:
                # Allocate whatever is left (Partial Allocation)
                self.inventory[inv_type]["available"] = 0
                allocation["allocated"][inv_type] = available
                allocation["queued"][inv_type] = requested_units - available
                allocation["status"] = "partial"
            else:
                # Resource is completely depleted
                allocation["queued"][inv_type] = requested_units
                allocation["status"] = "depleted"

        # Construct decision explanations
        if allocation["status"] == "success":
            allocation["explanation"] = f"All requested emergency units successfully dispatched. Total municipal capacity optimized."
        elif allocation["status"] == "partial":
            allocation["explanation"] = f"Constrained municipal supply. Partially dispatched units. Remaining requests placed in high-priority queue."
        else:
            allocation["explanation"] = f"🚨 RESOURCE DEPLETION ALERT: Municipal pool exhausted. Crisis request placed on high-priority queue."

        self.active_allocations[crisis_id] = allocation
        return allocation

    def resolve_multi_crisis_conflict(self, active_crises: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Resolves resource bidding conflicts when two crises arrive simultaneously.
        Uses the Knapsack Optimization Algorithm to allocate limited municipal resources.
        """
        if len(active_crises) <= 1:
            return active_crises

        self.reset_inventory()
        
        # Formulate events for the knapsack algorithm
        knapsack_events = []
        for idx, c in enumerate(active_crises):
            # Calculate dynamic demand
            demand = 2 if c.get("severity") in ["critical", "high"] else 1
            # Get threat/urgency score
            threat = c.get("humanitarian_impact_score", self._calculate_urgency(c.get("severity", "low"), c.get("crisis_type", "")))
            
            knapsack_events.append({
                "index": idx,
                "resource_demand": demand,
                "threat_score": threat,
                "crisis_data": c
            })
            
        # Run knapsack allocation with a total resource limit of 3 (for demonstration conflict)
        selected_events = self.knapsack_allocate(knapsack_events, total_resources=3)
        selected_indices = {e["index"] for e in selected_events}
        
        for idx, crisis in enumerate(active_crises):
            severity = crisis.get("severity", "low")
            c_type = crisis.get("crisis_type", "")
            c_id = crisis.get("crisis_id", f"C-{idx}")
            
            reqs = ["rescue_teams"]
            if c_type == "urban_flooding":
                reqs.extend(["boats", "water_pumps"])
            elif c_type == "fire":
                reqs.extend(["fire_trucks", "police_units"])
            elif c_type == "accident":
                reqs.extend(["ambulances", "police_units"])
                
            if idx in selected_indices:
                allocation = self.allocate_resources(c_id, c_type, severity, reqs)
                allocation["explanation"] = f"✓ KNAPSACK OPTIMIZED: {allocation.get('explanation')}"
            else:
                allocation = {
                    "status": "queued",
                    "allocated": {},
                    "queued": {r: (2 if severity in ["critical", "high"] else 1) for r in reqs},
                    "explanation": "🚨 QUEUED VIA KNAPSACK OPTIMIZATION: Prioritized resources to other high-impact zones.",
                    "urgency_score": self._calculate_urgency(severity, c_type)
                }
                self.active_allocations[c_id] = allocation
                
            crisis["resource_allocation"] = allocation

        return active_crises

    @staticmethod
    def knapsack_allocate(events: List[Dict[str, Any]], total_resources: int) -> List[Dict[str, Any]]:
        """
        Allocates resources to events using the knapsack optimization algorithm.
        Implements Task 2.2 algorithm core.
        """
        n = len(events)
        if n == 0 or total_resources <= 0:
            return []
            
        # Create a DP table (n+1) x (total_resources+1)
        dp = [[0 for _ in range(total_resources + 1)] for _ in range(n + 1)]
        
        # Build the DP table
        for i in range(1, n + 1):
            event_resources = events[i-1].get('resource_demand', 1)
            event_priority = int(events[i-1].get('threat_score', 1) * 10) # scaled for DP if float
            
            for r in range(1, total_resources + 1):
                if event_resources <= r:
                    dp[i][r] = max(event_priority + dp[i-1][r-event_resources], dp[i-1][r])
                else:
                    dp[i][r] = dp[i-1][r]
        
        # Find which events are selected
        selected_indices = []
        r = total_resources
        for i in range(n, 0, -1):
            if dp[i][r] != dp[i-1][r]:
                selected_indices.append(i-1)
                r -= events[i-1].get('resource_demand', 1)
        
        selected_events = [events[i] for i in selected_indices]
        return selected_events

    def _calculate_urgency(self, severity: str, crisis_type: str) -> float:
        """Calculate urgency score based on severity threat matrix"""
        severity_weights = {"critical": 10.0, "high": 7.0, "medium": 4.0, "low": 1.0}
        type_weights = {"urban_flooding": 1.2, "fire": 1.5, "accident": 1.0}
        
        s_val = severity_weights.get(severity.lower(), 2.0)
        t_val = type_weights.get(crisis_type.lower(), 1.0)
        return s_val * t_val

    def _map_to_inventory_type(self, resource_name: str, crisis_type: str) -> str:
        name = resource_name.lower()
        if "rescue" in name or "boat" in name:
            return "boats" if crisis_type == "urban_flooding" else "rescue_teams"
        if "fire" in name:
            return "fire_trucks"
        if "medical" in name or "ambulance" in name:
            return "ambulances"
        if "pump" in name or "water" in name:
            return "water_pumps"
        if "police" in name or "traffic_control" in name:
            return "police_units"
        return None
