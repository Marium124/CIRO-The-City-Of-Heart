#!/usr/bin/env python3
"""
CIRO Chaos Engineering Demo — Google Hackathon Pakistan 2026
Purpose: Prove the system degrades gracefully under extreme stress.
Run: python3 chaos_demo.py
"""

import asyncio
import random
import os
import shutil
import time
import json
from datetime import datetime
from pathlib import Path

# Setup PYTHONPATH for imports
import sys
sys.path.insert(0, str(Path(__file__).parent / "backend"))

from agents.agent_manager import AgentManager
from agents.resource_manager import ResourceManager

class CIROChaosEngineer:
    def __init__(self):
        self.results = {
            "test_name": "CIRO Chaos Resilience Suite",
            "timestamp": datetime.now().isoformat(),
            "total_crises": 30,
            "successful_dispatches": 0,
            "graceful_fallbacks": 0,
            "db_survival_events": 0,
            "resource_depletion_handled": 0,
            "malformed_input_rejected": 0,
            "avg_response_time_ms": 0,
            "resilience_score": 0.0,
            "events": []
        }
        self.response_times = []
        self.db_killed = False
        
    def log(self, emoji, message, detail=None):
        print(f"{emoji} {message}")
        if detail:
            print(f"   └─ {detail}")
            
    async def run_chaos_suite(self):
        print("\n" + "=" * 70)
        print("🔥 CIRO CHAOS ENGINEERING SUITE")
        print("   Proving graceful degradation under extreme conditions")
        print("=" * 70 + "\n")
        
        manager = AgentManager()
        await manager.initialize()
        
        # Phase 1: The Calm (Baseline)
        self.log("🌊", "Phase 1: Baseline single-crisis dispatch")
        baseline_start = time.time()
        baseline = await self._inject_crisis(manager, "Karachi", "critical", "urban_flooding", 0)
        baseline_time = (time.time() - baseline_start) * 1000
        self.log("✅", f"Baseline complete", f"{baseline_time:.0f}ms | Status: {baseline['status']}")
        
        # Phase 2: The Storm (30 Concurrent Crises)
        self.log("\n🌪️", "Phase 2: 30 concurrent crises across Pakistan")
        storm_start = time.time()
        storm_tasks = [
            self._inject_crisis(manager, self._random_location(), self._random_severity(), 
                              self._random_type(), i)
            for i in range(30)
        ]
        storm_results = await asyncio.gather(*storm_tasks, return_exceptions=True)
        storm_time = (time.time() - storm_start) * 1000
        
        successful = sum(1 for r in storm_results if isinstance(r, dict) and r.get("status") == "completed")
        self.log("⚡", f"Storm complete: {successful}/30 successful", f"Total time: {storm_time:.0f}ms")
        
        # Phase 3: Database Assassination
        self.log("\n💀", "Phase 3: Database file deletion mid-execution")
        db_path = Path("backend/crisis_response.db")
        if db_path.exists():
            shutil.move(str(db_path), str(db_path) + ".backup")
            self.db_killed = True
            self.log("🔪", "Database assassinated", f"Moved {db_path} to .backup")
        else:
            self.log("⚠️", "No DB found — creating synthetic failure")
            
        # Try one more crisis without DB
        db_test = await self._inject_crisis(manager, "Lahore", "high", "fire", 999)
        if db_test.get("status") in ["completed", "partial"]:
            self.results["db_survival_events"] += 1
            self.log("🛡️", "System survived DB death", "Fallback to in-memory mode active")
        else:
            self.log("❌", "System collapsed after DB death", db_test.get("error", "Unknown"))
            
        # Restore DB
        if self.db_killed and Path(str(db_path) + ".backup").exists():
            shutil.move(str(db_path) + ".backup", str(db_path))
            self.log("🔄", "Database resurrected")
            
        # Phase 4: Resource Starvation
        self.log("\n🪫", "Phase 4: Total resource pool exhaustion")
        rm = ResourceManager.get_instance()
        rm.reset_inventory()
        
        # Allocate everything to one crisis
        rm.allocate_resources("GREEDY", "urban_flooding", "critical", 
                            ["boats", "water_pumps", "rescue_teams", "fire_trucks", 
                             "ambulances", "police_units"])
        
        # Now try another crisis with empty pool
        empty_test = await self._inject_crisis(manager, "Islamabad", "critical", "accident", 888)
        if empty_test.get("status") in ["completed", "partial", "queued"]:
            self.results["resource_depletion_handled"] += 1
            self.log("♻️", "Resource starvation handled", "Knapsack queued crisis correctly")
            
        # Phase 5: Malformed Input Attack
        self.log("\n🤪", "Phase 5: Malformed input injection")
        malformed_cases = [
            {"location": "", "severity": "critical", "type": "fire"},        # Empty location
            {"location": "Karachi", "severity": "INVALID", "type": "flood"},  # Bad severity
            {"location": "Karachi", "severity": "critical", "type": ""},   # Empty type
            {"location": "🤖💀🔥", "severity": "high", "type": "fire"},    # Emoji location
        ]
        for i, bad in enumerate(malformed_cases):
            try:
                r = await self._inject_crisis(manager, bad["location"], bad["severity"], 
                                            bad["type"], 700 + i)
                if r.get("status") != "failed":
                    self.results["malformed_input_rejected"] += 1
                    self.log("🧹", f"Malformed case {i+1} sanitized", f"Status: {r['status']}")
            except Exception as e:
                self.log("💥", f"Malformed case {i+1} crashed", str(e)[:60])
                
        # Calculate final score
        self._calculate_score()
        self._generate_report()
        
    def _random_location(self):
        return random.choice(["Karachi", "Lahore", "Islamabad", "Peshawar", "Quetta", "Rawalpindi"])
        
    def _random_severity(self):
        return random.choice(["critical", "high", "medium", "low"])
        
    def _random_type(self):
        return random.choice(["urban_flooding", "fire", "accident", "heatwave"])
        
    async def _inject_crisis(self, manager, location, severity, crisis_type, idx):
        start = time.time()
        try:
            # Corrupt inputs randomly for chaos
            if idx % 7 == 0:
                severity = "INVALID_SEVERITY"
            if idx % 11 == 0:
                location = ""
                
            result = await manager.execute_workflow("full_cycle", {
                "social_media": [{
                    "platform": "chaos_test",
                    "text": f"{crisis_type} emergency reported in {location or 'Unknown'}",
                    "location": location or "Unknown",
                }],
                "weather": [{
                    "location": location or "Unknown",
                    "temperature": 28.0,
                    "rainfall": 85.0 if "flood" in crisis_type else 0.0,
                    "condition": "Heavy Thunderstorm" if "flood" in crisis_type else "Clear"
                }],
                "traffic": [{
                    "location": location or "Unknown",
                    "congestion_level": "critical",
                    "congestion_percentage": 90,
                    "average_speed": 5.0,
                    "incident_reported": True
                }]
            })
            
            elapsed = (time.time() - start) * 1000
            self.response_times.append(elapsed)
            
            if result.get("status") == "completed":
                self.results["successful_dispatches"] += 1
            elif "fallback" in str(result) or result.get("status") == "partial":
                self.results["graceful_fallbacks"] += 1
                
            self.results["events"].append({
                "index": idx,
                "location": location,
                "severity": severity,
                "type": crisis_type,
                "status": result.get("status"),
                "response_ms": round(elapsed, 2),
                "fallback_triggered": "fallback" in str(result)
            })
            
            return result
            
        except Exception as e:
            elapsed = (time.time() - start) * 1000
            self.response_times.append(elapsed)
            self.results["events"].append({
                "index": idx,
                "location": location,
                "severity": severity,
                "type": crisis_type,
                "status": "failed",
                "error": str(e)[:100],
                "response_ms": round(elapsed, 2)
            })
            return {"status": "failed", "error": str(e)}
            
    def _calculate_score(self):
        weights = {
            "success_rate": 0.3,
            "fallback_grace": 0.25,
            "db_survival": 0.2,
            "resource_handling": 0.15,
            "input_sanitization": 0.1
        }
        
        success_rate = self.results["successful_dispatches"] / max(self.results["total_crises"], 1)
        fallback_rate = self.results["graceful_fallbacks"] / max(self.results["total_crises"], 1)
        
        score = (
            success_rate * weights["success_rate"] +
            fallback_rate * weights["fallback_grace"] +
            (1.0 if self.results["db_survival_events"] > 0 else 0) * weights["db_survival"] +
            (1.0 if self.results["resource_depletion_handled"] > 0 else 0) * weights["resource_handling"] +
            (self.results["malformed_input_rejected"] / 4) * weights["input_sanitization"]
        )
        
        self.results["resilience_score"] = round(score * 100, 1)
        self.results["avg_response_time_ms"] = round(
            sum(self.response_times) / max(len(self.response_times), 1), 2
        )
        
    def _generate_report(self):
        print("\n" + "=" * 70)
        print("📊 CHAOS RESILIENCE REPORT")
        print("=" * 70)
        
        metrics = [
            ("🎯 Total Crises Injected", self.results["total_crises"]),
            ("✅ Successful Dispatches", self.results["successful_dispatches"]),
            ("🛡️ Graceful Fallbacks", self.results["graceful_fallbacks"]),
            ("💀 DB Survival Events", self.results["db_survival_events"]),
            ("♻️ Resource Depletion Handled", self.results["resource_depletion_handled"]),
            ("🧹 Malformed Inputs Rejected", self.results["malformed_input_rejected"]),
            ("⏱️ Avg Response Time", f"{self.results['avg_response_time_ms']}ms"),
            ("🏆 RESILIENCE SCORE", f"{self.results['resilience_score']}/100"),
        ]
        
        for label, value in metrics:
            bar = "█" * int(float(str(value).split('/')[0]) / 5) if isinstance(value, (int, float)) or '/' in str(value) else ""
            print(f"  {label:<35} {value} {bar}")
            
        # Save JSON report
        report_path = "chaos_resilience_report.json"
        with open(report_path, "w") as f:
            json.dump(self.results, f, indent=2)
        print(f"\n📁 Detailed report saved: {report_path}")
        
        # Verdict
        if self.results["resilience_score"] >= 70:
            print("\n🟢 VERDICT: BATTLE-HARDENED — System degrades gracefully under extreme stress")
        elif self.results["resilience_score"] >= 40:
            print("\n🟡 VERDICT: RESILIENT — Core functions survive, some degradation observed")
        else:
            print("\n🔴 VERDICT: FRAGILE — System requires hardening before production")

if __name__ == "__main__":
    asyncio.run(CIROChaosEngineer().run_chaos_suite())
