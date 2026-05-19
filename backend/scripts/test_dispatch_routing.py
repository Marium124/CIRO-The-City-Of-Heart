import asyncio
import os
import sys

# Reconfigure stdout to use UTF-8 to prevent emoji crash on Windows terminal
sys.stdout.reconfigure(encoding='utf-8')

# Ensure backend directory is in the path
sys.path.append(os.path.join(os.path.dirname(__file__), ".."))

from database.db_setup import init_db
from agents.agent_manager import AgentManager

async def test_routing():
    print("==================================================")
    print("TESTING DYNAMIC CITY-SPECIFIC EMERGENCY ROUTING")
    print("==================================================")
    
    # Initialize the database and ensure all tables (including DispatchRecord) exist
    await init_db()
    
    # Initialize the Agent Manager and load all agents
    manager = AgentManager()
    await manager.initialize()
    
    dispatch_agent = manager.active_agents.get("dispatch")
    if not dispatch_agent:
        print("Error: Dispatch Agent not found!")
        return

    # Define mock crisis scenarios across different cities
    scenarios = [
        {
            "location": "Karachi",
            "crisis_type": "urban_flooding",
            "severity": "critical",
            "confidence": 0.95,
            "explanation": "Massive water logging in Lyari, urban flood conditions.",
            "coordinates": {"lat": 24.87, "lng": 66.99}
        },
        {
            "location": "Lahore",
            "crisis_type": "fire",
            "severity": "high",
            "confidence": 0.9,
            "explanation": "Commercial fire in Walled City, Lahore.",
            "coordinates": {"lat": 31.52, "lng": 74.35}
        },
        {
            "location": "Islamabad",
            "crisis_type": "landslide",
            "severity": "medium",
            "confidence": 0.85,
            "explanation": "Landslide in Margalla Hills trail road.",
            "coordinates": {"lat": 33.74, "lng": 73.02}
        },
        {
            "location": "Peshawar",
            "crisis_type": "explosion",
            "severity": "critical",
            "confidence": 0.98,
            "explanation": "Gas explosion in Peshawar industrial zone.",
            "coordinates": {"lat": 34.01, "lng": 71.55}
        },
        {
            "location": "Quetta",
            "crisis_type": "earthquake",
            "severity": "critical",
            "confidence": 0.99,
            "explanation": "Critical structural damage reported in Quetta.",
            "coordinates": {"lat": 30.2, "lng": 66.95}
        }
    ]

    for sc in scenarios:
        print(f"\n--------------------------------------------------")
        print(f"SCENARIO: {sc['crisis_type'].upper()} in {sc['location']} ({sc['severity'].upper()})")
        print(f"--------------------------------------------------")
        
        # Trigger the Dispatch Agent processing
        result = await dispatch_agent.process({
            "crisis_id": f"TEST-{sc['location'].upper()}",
            "crisis_type": sc["crisis_type"],
            "location": sc["location"],
            "severity": sc["severity"],
            "confidence": sc["confidence"],
            "explanation": sc["explanation"],
            "coordinates": sc["coordinates"],
            "humanitarian_impact_score": 9.5,
            "actions": ["deploy_emergency_units", "cordon_off_area"]
        })
        
        print(f"Authorities Dispatched: {result['dispatched']}")
        for record in result["dispatch_records"]:
            try:
                print(f"  {record['emoji']}  {record['authority_name']:<40} | Phone: {record['phone']:<18} | Priority: {record['priority']:<10} | Status: {record['status']}")
            except Exception as e:
                # Absolute fallback print if terminal fails even with UTF-8 reconfigure
                clean_name = record['authority_name'].encode('ascii', 'replace').decode('ascii')
                print(f"  [emoji]  {clean_name:<40} | Phone: {record['phone']:<18} | Priority: {record['priority']:<10} | Status: {record['status']}")

    await manager.shutdown()
    print("\n==================================================")
    print("ROUTING TEST COMPLETED SUCCESSFULLY")
    print("==================================================")

if __name__ == "__main__":
    # Run the async test
    asyncio.run(test_routing())
