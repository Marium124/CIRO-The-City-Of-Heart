# Implementation Plan: National Emergency Contacts Registry & Routing

This plan outlines the process to integrate, authenticate, and deploy the verified Pakistani emergency contact details from the teammate's Excel files into CIRO's `DispatchAgent`.

By transitioning from static global numbers to a **City-Specific Emergency Contacts Registry**, CIRO will be able to dynamically route alerts to the correct municipal services (e.g., Karachi Water Board for a Karachi flood, WASA Lahore for a Lahore flood, Rescue 1122 Punjab for Lahore fire, etc.). This ensures a premium, production-ready, and highly realistic agentic system for judges.

---

## User Review Required

> [!IMPORTANT] **Terminal Permission Block Recovery**: Due to temporary shell execution restrictions in my terminal tool, I cannot run scripts directly. I have created a Python parser script parse_excel_to_txt.py. **You will need to run this command in your local terminal** to dump the Excel data into a text file so I can read and process it:
>
> ```bash
> .\backend\venv\Scripts\python.exe backend\scripts\parse_excel_to_txt.py
> ```

> [!WARNING] **Authentication Checkpoint**: Before writing any of these numbers into the code or environment variables, I will cross-reference and verify them against official public helplines (e.g., Rescue `1122`, Police `15`, Edhi `115`, NDMA `1110`, WASA `1334`). If the Excel sheet contains landlines or cell phone numbers, I will flag any anomalies.

---

## Proposed Changes

### Phase 1: Excel Data Extraction (User Action)

- User runs parse_excel_to_txt.py.
- This creates parsed_excel_preview\.txt.
- The AI reads this file to inspect both sheets: `CIRO_Emergencies_contact_details.xlsx` and `CIRO_Emergencies_contact_details_UPDATED_FORMATTED.xlsx`.

### Phase 2: Contact Verification & Registry Creation

- I will parse the extracted data and compare the numbers across cities: **Islamabad, Karachi, Lahore, Peshawar, Quetta**.
- I will construct a centralized JSON registry: contacts_registry.json.
- The registry will have city-specific phone numbers for:
  - `fire_brigade` (Rescue 1122 local HQs)
  - `traffic_police` (Traffic Police local lines)
  - `ndma` (National and Provincial Disaster Management Authorities: PDMA Sindh, PDMA Punjab, etc.)
  - `edhi_foundation` (Edhi local ambulances)
  - `rescue_medical` (Emergency medical services)
  - `water_board` (WASA / KWSB)
  - `civil_defence` (Civil Defence local HQs)
  - `city_admin` (DC Offices / Commissioner Offices)

### Phase 3: Dispatch Agent Dynamic Routing Integration

#### [MODIFY] dispatch_agent.py

- Import `contacts_registry.json`.
- Modify `_dispatch_to_authority` to:
  1. Determine the crisis city/location (`Karachi`, `Lahore`, `Islamabad`, `Peshawar`, `Quetta`) from the incoming crisis data.
  2. Query the registry for the local contact number of the matching authority in that specific city.
  3. Fall back to environment variables or national helplines (`1122`, `15`, `115`) if local numbers are not configured.
- Ensure all simulated and real (Twilio) dispatch logs output the correct regional numbers, improving the visual quality of both the terminal logs and mobile app feed.

---

## Verification Plan

### Automated Verification

1. I will write a mock script test_dispatch_routing.py to trigger simulated crises across different cities:
   - Karachi flood -> verify alert routed to Karachi WASA/Water Board number and PDMA Sindh.
   - Lahore fire -> verify alert routed to Punjab/Lahore Rescue 1122 and PDMA Punjab.
   - Islamabad wildfire -> verify alert routed to Capital Rescue 1122 and NDMA.
1. The user will run the mock script, and I will verify the output logged in the database (`DispatchRecords` table) by inspecting the DB setup.

### Manual Verification

- Run `start_demo.bat` and trigger the multi-city national crisis demonstration.
- Open the mobile app and check the **Authority Dispatch** tab. Ensure that the active dispatches show the real local verified numbers (e.g. WASA Lahore for Lahore and WASA/KWSB Karachi for Karachi) instead of global dummy variables.
