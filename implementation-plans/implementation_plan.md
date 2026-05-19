# CIRO: The Heart of the City - National Scale & Humanitarian AI

This plan transforms CIRO from a local Islamabad-centric dispatcher into a national-scale, humanistic crisis response system for all of Pakistan. It introduces ethical reasoning, vulnerability-weighted resource allocation, and a premium "WOW" factor UI.

## User Review Required

> [!IMPORTANT] **Google Cloud API Keys:** You will eventually need to provide API keys for Maps, Geocoding, and Directions in a `.env` file to enable real-time features outside of the mock demonstration. [!TIP] **Simultaneous Crises:** We will implement a specific demo scenario involving two simultaneous crises (e.g., Lahore and Karachi) to showcase the AI's ethical trade-offs.

## Proposed Changes

---

### 1. Backend: National Scalability & Ethical Reasoning

#### [MODIFY] reasoning_agent.py

- **Vulnerability Engine:** Replace hardcoded Islamabad sectors with a dynamic `VulnerabilityEngine` that estimates impact based on population density and demographic risk (elderly, disabled, children) for any coordinate in Pakistan.
- **Ethical Weighting:** Introduce a life-years-saved metric to the reasoning logic.

#### [MODIFY] action_planning_agent.py

- **Generic Rerouting:** Move away from hardcoded routes. Implement logic that calculates "Humanitarian Corridors" based on the location of medical facilities.

#### [NEW] location_utils.py

- Utility to interface with Google Maps Geocoding API.
- Provides fallback "Provincial Mock Data" for all major Pakistani cities (Lahore, Karachi, Peshawar, Quetta, Multan) for the demo.

---

### 2. Mobile App: Premium UI & "WOW" Factor

#### [MODIFY] HomeScreen.tsx

- **City Pulse:** Add a heartbeat animation representing the "Health of the City."
- **Premium Design:** Switch to a dark-mode theme with glassmorphism (semi-transparent blurred cards) and high-quality iconography.

#### [MODIFY] MapScreen.tsx

- **Digital Twin Slider:** Implement a "Future Vision" toggle/slider.
  - _Mode 1 (Red):_ "Inaction Outcome" (shows predicted spread of crisis).
  - _Mode 2 (Blue):_ "Agentic Response" (shows successful containment).
- **National Map:** Set initial region based on the most active crisis across Pakistan.

---

### 3. Demonstration & Stress Testing

#### [MODIFY] demo.py

- **National Crisis Scenario:** Trigger a flash flood in Karachi and a simultaneous heatwave in Lahore.
- **Ethical Trace:** The agent logs must show the "Internal Monologue" of the AI deciding how to split resources between two provinces based on humanitarian need.

## Verification Plan

### Automated Tests

- `pytest backend/tests/test_ethical_reasoning.py` (New test for trade-off logic).
- `npm test` (Verify UI component rendering for the new Digital Twin slider).

### Manual Verification

1. Run `start_demo.bat`.
2. Open the mobile app.
3. Trigger the "National Crisis" scenario.
4. **Judge View:** Verify that the "Digital Twin" slider effectively visualizes the lives saved.
5. **Agent Trace View:** Confirm the AI explains its decision to prioritize vulnerable populations over infrastructure.
