#!/bin/bash
# skills.sh
# Core agentic skills and setup commands for the CIRO project

echo "Loading CIRO Agent Skills..."

# Skill 1: Signal Ingestion
ingest_signals() {
    echo "Ingesting signals from social media, weather, and traffic..."
    curl -X POST http://localhost:8000/api/signals/social -d '{"text": "Sample"}'
}

# Skill 2: Crisis Detection
detect_crisis() {
    echo "Running Event Detection Agent..."
    curl -X GET http://localhost:8000/api/crises/detect
}

# Skill 3: Action Planning
plan_actions() {
    echo "Running Action Planning Agent..."
    curl -X POST http://localhost:8000/api/actions/plan
}

# Skill 4: Simulation & Orchestration
simulate_response() {
    echo "Simulating response via Antigravity Orchestrator..."
    curl -X POST http://localhost:8000/api/simulation/execute
}

export -f ingest_signals
export -f detect_crisis
export -f plan_actions
export -f simulate_response

echo "CIRO Skills successfully loaded into the environment."
