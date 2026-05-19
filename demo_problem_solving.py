import asyncio
import os
import json
from datetime import datetime
from backend.agents.agent_manager import AgentManager

# Demo setup
manager = AgentManager()

async def demo_problem_solving_loop():
    print("==================================================")
    print("🚀 CIRO Advanced Problem-Solving (PDCA) Demo")
    print("==================================================\n")
    
    await manager.initialize()
    
    # Simulating Phase 1: Initial Crisis
    print("📍 [TIME: T+0m] Incoming signal: Flood reported in Clifton, Karachi")
    signal_1 = {
        "social_media": [{
            "platform": "mobile_app",
            "text": "SOS! Urban flooding in Clifton, Karachi. Water levels rising rapidly.",
            "location": "Clifton, Karachi",
            "timestamp": datetime.now().isoformat()
        }],
        "weather": [],
        "traffic": []
    }
    
    print("\n🧠 Triggering Full PDCA Cycle (Plan-Do-Check-Adjust)...")
    result_1 = await manager._full_cycle_workflow(signal_1, {"steps": []})
    final_1 = result_1.get("final_result", {})
    
    print("\n[PLAN & DO] - Iteration 1")
    print(f"Crisis Detected: {final_1.get('crisis_type')}")
    print(f"Gemini AI Plan: {final_1.get('gemini_plan', 'Static fallback applied')}")
    print(f"Confidence/Threat: {final_1.get('confidence')}")
    
    print("\n⏳ Simulating 2 minutes passing... (Checking outcomes)")
    await asyncio.sleep(2)
    
    # Simulating Phase 2: Condition Worsens (Check & Adjust)
    print("\n📍 [TIME: T+2m] Incoming signal: Water levels critical in Clifton. Boats needed immediately.")
    signal_2 = {
        "social_media": [{
            "platform": "mobile_app",
            "text": "SOS! Water levels CRITICAL in Clifton, Karachi. We need 5 boats immediately! Previous response insufficient.",
            "location": "Clifton, Karachi",
            "timestamp": datetime.now().isoformat()
        }],
        "weather": [],
        "traffic": []
    }
    
    print("\n🧠 Adjusting Strategy based on new data (PDCA)...")
    result_2 = await manager._full_cycle_workflow(signal_2, {"steps": []})
    final_2 = result_2.get("final_result", {})
    
    print("\n[ADJUST & RE-PLAN] - Iteration 2")
    print(f"Updated Gemini AI Plan: {final_2.get('gemini_plan', 'Static fallback applied')}")
    print(f"Identified Risks: {final_2.get('gemini_risks', 'Unknown')}")
    print(f"Fallback Strategy: {final_2.get('gemini_fallback', 'Unknown')}")
    
    print("\n✅ Problem-Solving Loop Demo Complete!")

if __name__ == "__main__":
    asyncio.run(demo_problem_solving_loop())
