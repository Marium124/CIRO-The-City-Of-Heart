"""
Unified Trace Generator for CIRO Antigravity Explorer

Reads SCENARIO from backend/config.json and generates the appropriate trace:
  - "golden"      -> High-severity flood signals -> Full 7-agent pipeline -> sample_trace.json
  - "false_alarm"  -> Low-severity puddle signals -> Stops at 3rd agent   -> false_alarm_trace.json
  - "" (empty)     -> Defaults to golden signals, reasoning agent auto-detects from severity

Usage:
  1. Optionally set SCENARIO in backend/config.json ("golden", "false_alarm", or "")
  2. Run: python3 generate_trace.py
  3. Open antigravity_traces/explorer.html
"""

import asyncio
import os
import sys
import json
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent / "backend"))

from agents.agent_manager import AgentManager

# Signal presets
GOLDEN_SIGNALS = {
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

FALSE_ALARM_SIGNALS = {
    "social_media": [
        {"platform": "twitter", "text": "minor water logging on the side road, cars passing fine", "location": "Karachi", "urgency": "low"},
        {"platform": "twitter", "text": "puddle formed on street corner, no big deal", "location": "Karachi", "urgency": "low"}
    ],
    "weather": [
        {"location": "Karachi", "temperature": 28.0, "rainfall": 2.0, "condition": "Light Drizzle", "alert_level": "low"}
    ],
    "traffic": []
}


def load_scenario():
    """Read SCENARIO from backend/config.json. Returns '' if not set."""
    config_path = Path(__file__).parent / "backend" / "config.json"
    if config_path.exists():
        try:
            with open(config_path) as f:
                return json.load(f).get("SCENARIO", "")
        except Exception:
            pass
    return ""


async def generate_trace():
    scenario = load_scenario()
    
    if scenario == "false_alarm":
        signals = FALSE_ALARM_SIGNALS
        trace_file = "false_alarm_trace.json"
        print(f"📋 Scenario: FALSE ALARM (stops at 3rd agent)")
    else:
        # Both "golden" and "" (auto-detect) use golden signals
        signals = GOLDEN_SIGNALS
        trace_file = "sample_trace.json"
        label = "GOLDEN PATH" if scenario == "golden" else "AUTO-DETECT (defaulting to golden signals)"
        print(f"📋 Scenario: {label} (full 7-agent pipeline)")
    
    print(f"   Trace output: antigravity_traces/{trace_file}")
    
    # Initialize manager
    manager = AgentManager()
    await manager.initialize()
    manager.global_trace = []
    
    # Clear previous trace
    trace_path = f"antigravity_traces/{trace_file}"
    if os.path.exists(trace_path):
        os.remove(trace_path)
    os.environ["CIRO_TRACE_FILE"] = trace_file
    
    # Execute workflow
    print("\n▶ Executing workflow...")
    result = await manager.execute_workflow("full_cycle", signals)
    
    status = result.get("status")
    crisis = result.get("final_result", {}).get("crisis_detected")
    
    print(f"\n✅ Workflow status: {status}")
    print(f"   Crisis detected: {crisis}")
    
    # Read generated trace
    with open(trace_path) as f:
        traces = json.load(f)
    
    agents_seen = set()
    for t in traces:
        aid = t.get("data", {}).get("agent_id")
        if aid and t.get("data", {}).get("action") not in ("initialize", "setup_tools"):
            agents_seen.add(aid)
    
    print(f"   Active agents: {len(agents_seen)} ({', '.join(sorted(agents_seen))})")
    print(f"   Total trace events: {len(traces)}")
    
    # Embed into explorer.html
    print("\n📦 Embedding trace into explorer.html...")
    import embed_traces
    embed_traces.main()
    
    print("\n🎯 Done. Open antigravity_traces/explorer.html to visualize.")
    
    if scenario == "false_alarm" and crisis:
        print("\n⚠️  WARNING: Crisis was detected even in false_alarm mode!")
        print("   Check that backend/config.json has SCENARIO set to 'false_alarm'")


if __name__ == "__main__":
    asyncio.run(generate_trace())
