"""
National Stress Test Demo Script
Generates a multi-city crisis scenario to demonstrate CIRO's agentic orchestration.
Uses only built-in standard Python libraries (urllib) to guarantee execution without third-party dependencies!
"""

import urllib.request
import json
import time

API_BASE_URL = "http://localhost:8000/api"

def post_signal(signal_data):
    url = f"{API_BASE_URL}/signals/"
    headers = {"Content-Type": "application/json"}
    req_data = json.dumps(signal_data).encode("utf-8")
    
    req = urllib.request.Request(url, data=req_data, headers=headers, method="POST")
    try:
        with urllib.request.urlopen(req) as response:
            res_body = response.read().decode("utf-8")
            return json.loads(res_body)
    except Exception as e:
        print(f"Error sending signal from {signal_data.get('source')}: {e}")
        return None

def get_active_crises():
    url = f"{API_BASE_URL}/crises/active"
    try:
        with urllib.request.urlopen(url) as response:
            res_body = response.read().decode("utf-8")
            return json.loads(res_body)
    except Exception as e:
        print(f"Error fetching active crises: {e}")
        return None

def run_national_demo():
    print("Starting CIRO National Scale Demo...")
    
    # 1. Generate Signals for Karachi (Flood)
    print("\nGenerating Flood Signals for Karachi...")
    karachi_signals = [
        {"source": "traffic_cam", "content": "Water logging detected on Shahrah-e-Faisal. Traffic stalled.", "location": "Karachi", "coordinates": {"lat": 24.8607, "lng": 67.0011}},
        {"source": "social_media", "content": "Heavy rain in Lyari. Houses being flooded. Need help!", "location": "Karachi", "coordinates": {"lat": 24.8700, "lng": 66.9900}},
        {"source": "weather_sensor", "content": "Rainfall exceeded 100mm in 2 hours.", "location": "Karachi", "coordinates": {"lat": 24.8500, "lng": 67.0100}}
    ]
    
    for sig in karachi_signals:
        res = post_signal(sig)
        if res:
            print(f"  Posted: {sig['source']} -> {res.get('message')}")
        time.sleep(0.5)
    
    # 2. Generate Signals for Lahore (Heatwave)
    print("\nGenerating Heatwave Signals for Lahore...")
    lahore_signals = [
        {"source": "weather_station", "content": "Temperature reached 48C in Lahore. Heat index critical.", "location": "Lahore", "coordinates": {"lat": 31.5204, "lng": 74.3587}},
        {"source": "hospital_feed", "content": "Surge in heatstroke cases at Mayo Hospital.", "location": "Lahore", "coordinates": {"lat": 31.5300, "lng": 74.3400}}
    ]
    
    for sig in lahore_signals:
        res = post_signal(sig)
        if res:
            print(f"  Posted: {sig['source']} -> {res.get('message')}")
        time.sleep(0.5)

    # 3. Generate Signals for Islamabad (Wildfire)
    print("\nGenerating Wildfire Signals for Islamabad...")
    islamabad_signals = [
        {"source": "satellite", "content": "Heat signature detected in Margalla Hills.", "location": "Islamabad", "coordinates": {"lat": 33.7435, "lng": 73.0247}},
        {"source": "emergency_call", "content": "Smoke seen near Trail 3. Spreading fast due to wind.", "location": "Islamabad", "coordinates": {"lat": 33.7500, "lng": 73.0300}}
    ]
    
    for sig in islamabad_signals:
        res = post_signal(sig)
        if res:
            print(f"  Posted: {sig['source']} -> {res.get('message')}")
        time.sleep(0.5)

    print("\nWaiting 6 seconds for Agentic Orchestrator to fully process...")
    time.sleep(6)
    
    # 4. Check Active Crises in Database
    res = get_active_crises()
    if res:
        crises = res.get("crises", [])
        print(f"\n🎉 Demo Complete! {len(crises)} Active Crises successfully detected and saved in SQLite database.")
        for c in crises:
            print(f"- {c['crisis_type'].replace('_', ' ').upper()} in {c['location']} (Severity: {c['severity']})")
            print(f"  Coordinates: [{c['latitude']}, {c['longitude']}]")
            dispatches = c.get("dispatched_authorities", [])
            if dispatches:
                print("  Dispatched Authorities:")
                for d in dispatches:
                    print(f"    * {d['authority_name']} via {d['dispatch_method']} ({d['status']})")
    else:
        print("Failed to retrieve active crises.")

if __name__ == "__main__":
    run_national_demo()
