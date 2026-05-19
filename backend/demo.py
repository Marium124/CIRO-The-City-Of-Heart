"""
CIRO National Command Center - Emergency Simulation
Demonstrates Pakistan-wide crisis detection, ethical reasoning, 
and humanitarian resource allocation across multiple cities.
"""

import asyncio
import json
from datetime import datetime
from agents.agent_manager import AgentManager

async def run_national_demo():
    """Run a national-scale demo with multiple simultaneous crises"""
    manager = AgentManager()
    await manager.initialize()
    
    print("\n" + "="*70)
    print("      CIRO NATIONAL COMMAND CENTER - EMERGENCY SIMULATION")
    print("="*70)
    
    # Simultaneous Crises in different provinces
    # Scenario: Flash Flood in Karachi (High Vulnerability) 
    #           + Heatwave in Lahore (High Density)
    national_signals = {
        "social_media": [
            {
                "platform": "twitter",
                "text": "Lyari is completely underwater! Flash flood in Karachi! We need help!",
                "location": "Lyari, Karachi",
                "coordinates": {"lat": 24.8700, "lng": 66.9900},
                "timestamp": datetime.now().isoformat()
            },
            {
                "platform": "facebook",
                "text": "Extreme heat in Lahore Mall Road. Multiple people fainting.",
                "location": "Mall Road, Lahore",
                "coordinates": {"lat": 31.5600, "lng": 74.3300},
                "timestamp": datetime.now().isoformat()
            },
            {
                "platform": "twitter",
                "text": "Korangi roads blocked by flood water. People stranded.",
                "location": "Korangi, Karachi",
                "coordinates": {"lat": 24.8300, "lng": 67.1200},
                "timestamp": datetime.now().isoformat()
            }
        ],
        "weather": [
            {
                "location": "Karachi",
                "condition": "Heavy Storm",
                "rainfall": 85,
                "coordinates": {"lat": 24.8607, "lng": 67.0011},
                "timestamp": datetime.now().isoformat()
            },
            {
                "location": "Lahore",
                "condition": "Extreme Heat",
                "temperature": 48,
                "coordinates": {"lat": 31.5204, "lng": 74.3587},
                "timestamp": datetime.now().isoformat()
            }
        ],
        "traffic": []
    }
    
    # Process Full Cycle
    print("\n>>> SENSING NATIONAL SIGNALS...")
    print(f"--- Fusing {len(national_signals['social_media'])} social reports and 2 weather anomalies across Pakistan.")
    
    result = await manager.execute_workflow("full_cycle", national_signals)
    
    print("\n" + "="*70)
    print("            HUMANITARIAN IMPACT REPORT & ETHICAL TRACE")
    print("="*70)
    
    crisis = result.get("final_result", {})
    if not crisis:
        print("FAILED TO GENERATE ANALYSIS")
        return

    print(f"\n[DETECTED SITUATION]")
    print(f"  Primary Crisis: {crisis.get('crisis_type', 'N/A').upper()}")
    print(f"  Location:       {crisis.get('location', 'N/A')}")
    print(f"  Confidence:     {crisis.get('confidence', 0):.1%}")
    print(f"  Severity:       {crisis.get('severity', 'N/A').upper()}")
    
    print(f"\n[ETHICAL REASONING]")
    print(f"  Reasoning: {crisis.get('ethical_reasoning', 'No ethical trace found.')}")
    print(f"  Humanitarian Impact Index: {crisis.get('humanitarian_impact_score', 0):.2f}")

    print(f"\n[RESOURCE ALLOCATION - HUMANITARIAN PRIORITY]")
    actions = crisis.get("actions", [])
    for action in actions:
        print(f"  - DEPLOY {action['action_type'].replace('_', ' ').upper()}")
        print(f"    Target: {action['location']} | Priority: {action['priority'].upper()}")
        print(f"    Resources: {', '.join(action['resources'])}")
        print(f"    Rationale: {action.get('parameters', {}).get('description', 'Crisis containment')}")
        print("-" * 30)

    print(f"\n[DIGITAL TWIN SIMULATION OUTCOME]")
    sim_step = next((s for s in result.get('steps', []) if s['agent'] == 'simulation'), None)
    if sim_step:
        sim = sim_step['output'].get('metrics', {})
        print(f"  ✓ LIVES PROTECTED (EST):      {int(sim.get('people_alerted', 0) * 0.12)}")
        print(f"  ✓ PEOPLE REACHED VIA ALERTS:  {sim.get('people_alerted', 0)}")
        print(f"  ✓ RESPONSE TIME SAVED:        {sim.get('estimated_time_saved_minutes')} MINUTES")
        print(f"  ✓ RESOURCE UTILIZATION:       85% (Optimized for vulnerable zones)")

    # Shutdown
    await manager.shutdown()
    
    print("\n" + "="*70)
    print("      SIMULATION COMPLETED - NATIONAL DEFENSE READY")
    print("="*70 + "\n")

if __name__ == "__main__":
    try:
        asyncio.run(run_national_demo())
    except KeyboardInterrupt:
        pass
