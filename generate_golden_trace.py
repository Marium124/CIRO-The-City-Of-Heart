import asyncio
import os
import sys
import json
from pathlib import Path

# Setup PYTHONPATH for imports
sys.path.insert(0, str(Path(__file__).parent / "backend"))

from agents.agent_manager import AgentManager

async def generate_golden_trace():
    print("Generating perfect 7-agent trace...")
    
    # 1. Initialize manager
    manager = AgentManager()
    await manager.initialize()
    
    # 2. Clear any existing traces
    manager.global_trace = []
    
    # 3. Inject a highly-correlated, high-severity signal to guarantee all 7 agents run
    perfect_signal = {
        "social_media": [
            {"platform": "twitter", "text": "Massive urban flooding in Clifton Karachi, cars submerged", "location": "Clifton Karachi"},
            {"platform": "facebook", "text": "Clifton is completely underwater, need rescue boats immediately", "location": "Clifton Karachi"},
            {"platform": "whatsapp", "text": "SOS: trapped in house due to rising flood water in Clifton", "location": "Clifton Karachi"}
        ],
        "weather": [
            {"location": "Karachi", "temperature": 28.0, "rainfall": 95.0, "condition": "Severe Thunderstorm"}
        ],
        "traffic": [
            {"location": "Karachi", "congestion_level": "critical", "congestion_percentage": 98, "average_speed": 2.0, "incident_reported": True}
        ]
    }
    
    print("Executing workflow...")
    result = await manager.execute_workflow("full_cycle", perfect_signal)
    
    if result.get("status") == "completed" and result["final_result"].get("crisis_detected") == True:
        print("Success! All 7 agents executed.")
        
        # 4. Save to sample_trace.json
        traces = manager.get_agent_traces()
        trace_path = "antigravity_traces/sample_trace.json"
        
        with open(trace_path, "w") as f:
            json.dump(traces, f, indent=2, default=str)
            
        print(f"Saved {len(traces)} trace events to {trace_path}")
        
        # 5. Re-embed into HTML
        print("Re-embedding into explorer.html...")
        mini_trace = json.dumps(traces, separators=(',', ':'), default=str)
        html_path = "antigravity_traces/explorer.html"
        
        with open(html_path, "r") as f:
            html = f.read()
            
        import re
        # Find the TRACE_DATA array and replace it
        new_html = re.sub(r'const TRACE_DATA = \[.*?\];', f'const TRACE_DATA = {mini_trace};', html)
        
        with open(html_path, "w") as f:
            f.write(new_html)
            
        print("Done. explorer.html is now ready for judges.")
    else:
        print("Failed to generate golden trace. Result:", json.dumps(result, indent=2))

if __name__ == "__main__":
    asyncio.run(generate_golden_trace())
