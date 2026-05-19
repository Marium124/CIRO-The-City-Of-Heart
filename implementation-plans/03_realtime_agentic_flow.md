# Implementation Plan - Realigning CIRO to Real-Time Human-Initiated Agentic Flow

This plan establishes the transition of the CIRO application from simulated/seeded demonstrations into a pure, human-triggered real-time agentic response system. 

It addresses:
1. **The Map Highlighting Issue**: Why the emergency circles were invisible and how we will dynamically center and zoom the map onto active local crises.
2. **Simulation Data Cleanup**: Purging pre-assumed database records and refining offline fallbacks so the app operates solely on real-time human reports.
3. **Real-Time Dispatch Loop**: Visually showing the user exactly which authority has been dispatched (e.g. WASA, Edhi, Rescue 1122) and their contact status.
4. **Operational Clarity**: Defining the exact purpose of the Web Dashboard vs. the Mobile App.

---

## User Review Required

> [!IMPORTANT]
> **Key Realignment Decisions**:
> 1. **Database Purge**: We will wipe the pre-existing SQLite database `crisis_response.db` tables (`crises`, `actions`, `signals`, `dispatch_records`, `agent_logs`) so the system starts with **zero** pre-assumed crises.
> 2. **Map Focus Zoom**: We will update the mobile app's Map Screen to center automatically on the latest crisis coordinates and change the zoom level (delta) from a country-wide view (`12.0`) to a localized sector view (`0.03`), making the emergency highlight circles beautifully visible.
> 3. **Dispatch Feedback**: We will display the agent's dispatch status directly on the mobile app's **Crises Screen** so the human reporter immediately sees that the relevant authorities (e.g., Rescue 1122 or WASA) have been contacted by the Dispatch Agent.

---

## Proposed Changes

### 1. Database & Signal Ingestion Realignment
We will create a clean DB initialization script that clears previous demo entries to guarantee that only user-submitted signals initiate agent execution and show up in the crises logs.

#### [NEW] [clear_database.py](file:///c:/ciro/backend/scripts/clear_database.py)
A clean maintenance script to clear active tables in `crisis_response.db`.

---

### 2. Mobile App Map Visualization & Scaling
Currently, the map displays the entire country of Pakistan (`latitudeDelta: 12.0`). Because a 500-meter local emergency circle is physically smaller than a single pixel at this scale, it appears invisible.

#### [MODIFY] [MapScreen.tsx](file:///c:/ciro/mobile-app/src/screens/MapScreen.tsx)
We will modify the screen to:
* Periodically check for active crises.
* If active crises exist, center the Map's default coordinates on the **latest active crisis**.
* Shrink the `latitudeDelta` and `longitudeDelta` to `0.03` (local neighborhood scale) so the secondary action/inaction circles are highlighted clearly.

---

### 3. Mobile App Dispatch Status & Response Feedback
Currently, the mobile Crises Screen displays basic confidence and severity scores but does not tell the human reporter which authority the agent dispatched.

#### [MODIFY] [CrisisScreen.tsx](file:///c:/ciro/mobile-app/src/screens/CrisisScreen.tsx)
We will fetch associated action plans and dispatch records from `/api/dispatch/alerts` (or include dispatch details directly in the `/api/crises/active` response) and display them in the crisis details view:
* Displaying: **"Status: Dispatch Agent contacted Edhi Foundation / Rescue 1122 [Helpline: 1122]"**

---

## Verification Plan

### Automated / Manual Verification
1. **Clean DB Execution**: Run `clear_database.py` and verify that the Mobile App and Web Dashboard show **0 Active Crises** initially.
2. **Submit Report**: Submit an active flood or drainage report (e.g., location "G-10, Islamabad") from the mobile **Report Screen**.
3. **Observe Agent Execution**: Confirm the web dashboard's **Real-time Traces** console streams the 7 agents processing the signal in real-time.
4. **Map Focusing**: Navigate to the Mobile **Map Screen** and verify the map automatically flies-to and centers on G-10 with the highlighted red/blue crisis circles clearly visible.
5. **Dispatch Log Verification**: Confirm the mobile **Crises Screen** displays the specific agency dispatched by the agent in response to the user's report.
