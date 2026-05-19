# CIRO Project Roadmap & Checklist

## 🚀 Phase 1: Quick Wins & Credibility Boosters
- [x] **Task 1.1:** Create the `/antigravity_traces/` directory and `sample_trace.json`
- [x] **Task 1.2:** Fix the `mobile_app_scrrenshot` directory typo
- [x] **Task 1.3:** Integrate OpenWeatherMap API in `SignalIngestionAgent`
- [x] **Task 1.4:** Test Twilio SMS with a free account (`test_twilio.py`)

## 🤖 Phase 2: Core Agentic Upgrade (The "Brain") & Problem-Solving Loop
- [x] **Task 2.1:** Replace the static reasoning engine with Gemini (Vertex AI)
- [x] **Task 2.2:** Implement the Knapsack Resource Allocator (`resource_manager.py`)
- [x] **Task 2.3:** Create a memory table (SQLite) for storing past experiences and outcomes
- [x] **Task 2.4:** Implement `solve_crisis()` with a PDCA (Plan-Do-Check-Adjust) loop
- [x] **Task 2.5:** Add Gemini-powered fallback reasoning for when initial plans fail
- [x] **Task 2.6:** Write a crisis watcher (async loop) for real-time change detection
- [x] **Task 2.7:** Build `demo_problem_solving.py` to showcase the iterative loop to judges

## 🐳 Phase 3: Production Hardening & GCP Deployment
- [x] **Task 3.1:** Containerize and deploy FastAPI App to Cloud Run
- [x] **Task 3.2:** Set up GitHub Actions CI/CD pipeline
