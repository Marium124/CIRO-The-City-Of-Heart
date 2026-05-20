import asyncio
import os
import sys
import json
from pathlib import Path

# Setup PYTHONPATH for imports
sys.path.insert(0, str(Path(__file__).parent / "backend"))

from agents.agent_manager import AgentManager

async def generate_false_alarm_trace():
    print("Generating false alarm 3-agent trace...")
    
    # 1. Initialize manager
    manager = AgentManager()
    await manager.initialize()
    
    # 2. Clear any existing traces
    manager.global_trace = []
    trace_path = "antigravity_traces/false_alarm_trace.json"
    if os.path.exists(trace_path):
        os.remove(trace_path)
    os.environ["CIRO_TRACE_FILE"] = "false_alarm_trace.json"
    
    # 3. Inject a low-urgency, low-severity signal to form a cluster of urgency="low" and count < 3
    low_signal = {
        "social_media": [
            {"platform": "twitter", "text": "minor water logging on the side road, cars passing fine", "location": "Karachi", "urgency": "low"},
            {"platform": "twitter", "text": "puddle formed on street corner, no big deal", "location": "Karachi", "urgency": "low"}
        ],
        "weather": [
            {"location": "Karachi", "temperature": 28.0, "rainfall": 2.0, "condition": "Light Drizzle", "alert_level": "low"}
        ],
        "traffic": []
    }
    
    print("Executing workflow...")
    result = await manager.execute_workflow("full_cycle", low_signal)
    
    print("Workflow status:", result.get("status"))
    print("Crisis detected:", result.get("final_result", {}).get("crisis_detected"))
    
    # 4. Read the generated false_alarm_trace.json (which has the correct event_type formatting)
    with open(trace_path, "r") as f:
        traces = json.load(f)
        
    print(f"Read {len(traces)} false alarm trace events from {trace_path}")

if __name__ == "__main__":
    asyncio.run(generate_false_alarm_trace())
