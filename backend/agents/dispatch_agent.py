"""
Dispatch Agent - Contacts relevant authorities when a crisis is detected.
Sends real SMS via Twilio if configured, otherwise simulates dispatch.
All authority mappings and contact numbers are driven by environment variables.
"""

import os
import json
import asyncio
from datetime import datetime
from typing import Dict, List, Any, Optional
from dotenv import load_dotenv
from agents.agent_manager import BaseAgent

load_dotenv()

# Load local verified contacts registry from Excel extraction
REGISTRY_PATH = os.path.join(os.path.dirname(__file__), "contacts_registry.json")
try:
    with open(REGISTRY_PATH, "r", encoding="utf-8") as f:
        VERIFIED_REGISTRY = json.load(f)
except Exception as e:
    print(f"[DispatchAgent] Warning: Failed to load contacts_registry.json: {e}")
    VERIFIED_REGISTRY = {}


# ── Authority registry loaded from environment ───────────────────────────────
AUTHORITY_REGISTRY = {
    "fire_brigade": {
        "name": "Fire Brigade / Rescue 1122",
        "phone": os.getenv("AUTHORITY_FIRE_BRIGADE", ""),
        "emoji": "🚒",
        "crisis_types": ["fire", "building_collapse", "infrastructure_collapse", "explosion"],
    },
    "traffic_police": {
        "name": "Traffic Police",
        "phone": os.getenv("AUTHORITY_TRAFFIC_POLICE", ""),
        "emoji": "🚔",
        "crisis_types": ["traffic_accident", "road_blockage", "vehicle_collision"],
    },
    "ndma": {
        "name": "NDMA (National Disaster Management Authority)",
        "phone": os.getenv("AUTHORITY_NDMA", ""),
        "emoji": "🏛️",
        "crisis_types": [
            "earthquake", "urban_flooding", "flash_flood", "landslide",
            "cyclone", "drought", "heatwave",
        ],
    },
    "edhi_foundation": {
        "name": "Edhi Foundation Rescue",
        "phone": os.getenv("AUTHORITY_EDHI", ""),
        "emoji": "🚑",
        "crisis_types": [
            "traffic_accident", "fire", "building_collapse", "mass_casualty",
            "earthquake", "urban_flooding",
        ],
    },
    "rescue_medical": {
        "name": "Emergency Medical Services",
        "phone": os.getenv("AUTHORITY_RESCUE_MEDICAL", ""),
        "emoji": "🏥",
        "crisis_types": [
            "mass_casualty", "disease_outbreak", "heatwave",
            "chemical_spill", "explosion",
        ],
    },
    "water_board": {
        "name": "WASA / Water Supply Authority",
        "phone": os.getenv("AUTHORITY_WATER_BOARD", ""),
        "emoji": "💧",
        "crisis_types": ["urban_flooding", "water_contamination", "pipe_burst", "flash_flood"],
    },
    "civil_defence": {
        "name": "Civil Defence",
        "phone": os.getenv("AUTHORITY_CIVIL_DEFENCE", ""),
        "emoji": "🛡️",
        "crisis_types": [
            "earthquake", "building_collapse", "chemical_spill",
            "explosion", "infrastructure_collapse",
        ],
    },
    "city_admin": {
        "name": "City Administration / DC Office",
        "phone": os.getenv("AUTHORITY_CITY_ADMIN", ""),
        "emoji": "🏢",
        "crisis_types": [
            "urban_flooding", "infrastructure_collapse", "power_outage",
            "heatwave", "drought",
        ],
    },
}

SEVERITY_EMOJI = {
    "critical": "🔴 CRITICAL",
    "high": "🟠 HIGH",
    "medium": "🟡 MEDIUM",
    "low": "🟢 LOW",
}


def _build_sms_message(crisis: Dict, authority_key: str = "general") -> str:
    """Build a concise, custom-tailored SMS alert message depending on the target stakeholder."""
    severity_tag = SEVERITY_EMOJI.get(crisis.get("severity", "high"), "⚠️")
    location = crisis.get("location", "Unknown")
    c_type = crisis.get("crisis_type", "Unknown").replace('_', ' ').upper()
    
    # 1. Custom Public Advisory Alert
    if authority_key == "public":
        return (
            f"🚨 [CIRO PUBLIC ADVISORY] {severity_tag} 🚨\n"
            f"SITUATION: Severe {c_type} reported at {location}.\n"
            f"INSTRUCTION: Avoid low-lying sectors and flooded corridors. Seek elevated shelter. "
            f"Stay tuned for municipal response updates."
        )
    
    # 2. Custom Hospital / EMS Alert
    if authority_key in ["rescue_medical", "edhi_foundation"]:
        return (
            f"🏥 [CIRO HOSPITALS STANDBY] {severity_tag}\n"
            f"EVENT: Emergency {c_type} detected at {location}.\n"
            f"EXPECTED LIVES AFFECTED: {crisis.get('impact_assessment', {}).get('affected_population', 'N/A')} residents.\n"
            f"ACTION: Prepare emergency triage bay. Stretcher teams standby for rapid trauma intakes."
        )
    
    # 3. Custom Utility / Water Board Alert
    if authority_key in ["water_board", "civil_defence"]:
        return (
            f"💧 [CIRO UTILITIES DEMAND] {severity_tag}\n"
            f"CRITICAL FAULT: {c_type} threatening local substations at {location}.\n"
            f"ACTION REQUIRED: Deploy water extraction pumps and high-output generators. Secure municipal assets immediately."
        )
        
    # 4. Custom Transit / Traffic Police Alert
    if authority_key == "traffic_police":
        return (
            f"🚧 [CIRO TRANSIT REROUTING] {severity_tag}\n"
            f"ARTERY BLOCKED: {c_type} has halted traffic at {location}.\n"
            f"MUNICIPAL ACTION: Diverting traffic along designated arterial channels. Deploy detour checkpoints immediately."
        )

    # 5. Default Command Center Dispatch
    return (
        f"🏛️ [CIRO COMMAND CENTER DISPATCH] {severity_tag}\n"
        f"CRISIS: {c_type}\n"
        f"LOCATION: {location}\n"
        f"CONFIDENCE: {int(crisis.get('confidence', 0) * 100)}%\n"
        f"HUMANITARIAN INDEX: {crisis.get('humanitarian_impact_score', 'N/A')}\n"
        f"ACTION REQUIRED: Rapid deployment initiated. Monitor traces via live command portal."
    )


async def _send_twilio_sms(to_number: str, message: str) -> Dict:
    """Attempt real SMS dispatch via Twilio."""
    account_sid = os.getenv("TWILIO_ACCOUNT_SID", "")
    auth_token = os.getenv("TWILIO_AUTH_TOKEN", "")
    from_number = os.getenv("TWILIO_FROM_NUMBER", "")

    if not all([account_sid, auth_token, from_number, to_number]):
        return {"sent": False, "reason": "missing_credentials"}

    if account_sid == "your_account_sid_here":
        return {"sent": False, "reason": "placeholder_credentials"}

    try:
        from twilio.rest import Client  # type: ignore
        client = Client(account_sid, auth_token)
        msg = client.messages.create(body=message, from_=from_number, to=to_number)
        return {"sent": True, "sid": msg.sid, "status": msg.status}
    except ImportError:
        return {"sent": False, "reason": "twilio_not_installed"}
    except Exception as e:
        return {"sent": False, "reason": str(e)}


class DispatchAgent(BaseAgent):
    """
    Dispatch Agent — final authority notification layer.
    Determines which emergency services to contact based on crisis type and
    severity, then attempts real SMS dispatch via Twilio. Falls back to
    a simulated dispatch record if credentials are unavailable.
    """

    def __init__(self, agent_id: str, agent_manager):
        super().__init__(agent_id, agent_manager)
        self.demo_mode = os.getenv("DISPATCH_DEMO_MODE", "false").lower() == "true"

    async def setup_tools(self):
        self.tools = ["twilio_sms", "authority_registry", "dispatch_logger"]
        self._log_trace("setup_tools", {"tools": self.tools, "demo_mode": self.demo_mode})

    async def process(self, input_data: Dict) -> Dict:
        """
        Main dispatch processing.
        input_data: result dict from action_planning_agent (contains crisis_type,
                    location, severity, confidence, actions, coordinates, etc.)
        """
        self._log_trace("dispatch_start", {"crisis_type": input_data.get("crisis_type"), "location": input_data.get("location")})

        crisis_type = input_data.get("crisis_type", "").lower()
        severity = input_data.get("severity", "high")
        location = input_data.get("location", "Unknown")

        # ── 1. Identify relevant authorities ─────────────────────────────────
        authorities_to_contact = self._get_authorities_for_crisis(crisis_type, severity)

        self._log_trace("authorities_identified", {
            "count": len(authorities_to_contact),
            "authorities": [a["name"] for a in authorities_to_contact],
        })

        # ── 3. Dispatch to each authority ─────────────────────────────────────
        dispatch_records = []
        for authority in authorities_to_contact:
            auth_key = authority.get("authority_key", "general")
            # Build custom tailored message for this specific stakeholder
            tailored_message = _build_sms_message(input_data, auth_key)
            
            record = await self._dispatch_to_authority(authority, tailored_message, input_data)
            dispatch_records.append(record)
            # Small delay to avoid rate limiting
            await asyncio.sleep(0.3)

        # ── 4. Persist records to DB ──────────────────────────────────────────
        await self._save_dispatch_records(dispatch_records, input_data)

        result = {
            "dispatched": len(dispatch_records),
            "authorities_contacted": [r["authority_name"] for r in dispatch_records],
            "dispatch_records": dispatch_records,
            "crisis_type": crisis_type,
            "location": location,
            "severity": severity,
            "message_sent": sms_message,
            "timestamp": datetime.now().isoformat(),
        }

        self._log_trace("dispatch_complete", {
            "total_dispatched": len(dispatch_records),
            "real_sms_sent": sum(1 for r in dispatch_records if r.get("real_sms_sent")),
        })

        return result

    def _get_authorities_for_crisis(self, crisis_type: str, severity: str) -> List[Dict]:
        """Return authorities relevant to this crisis type, sorted by relevance."""
        matched = []
        for key, authority in AUTHORITY_REGISTRY.items():
            if crisis_type in authority["crisis_types"]:
                matched.append({**authority, "authority_key": key, "priority": "primary"})

        # If critical severity and no primary match, alert city_admin as fallback
        if not matched or (severity == "critical" and len(matched) < 2):
            fallback = AUTHORITY_REGISTRY.get("city_admin", {})
            if fallback and fallback not in matched:
                matched.append({**fallback, "authority_key": "city_admin", "priority": "fallback"})

        # Always add NDMA for critical crises
        if severity == "critical":
            ndma = AUTHORITY_REGISTRY.get("ndma", {})
            if ndma and ndma.get("name") not in [m.get("name") for m in matched]:
                matched.append({**ndma, "authority_key": "ndma", "priority": "escalation"})

        return matched

    async def _dispatch_to_authority(self, authority: Dict, message: str, crisis: Dict) -> Dict:
        """Dispatch alert to a single authority — real or simulated."""
        authority_key = authority.get("authority_key")
        location = crisis.get("location", "Islamabad")
        
        # 1. Resolve environment-based phone number
        phone = authority.get("phone", "")
        
        # 2. Resolve city-specific verified number from Excel registry
        verified_phone = ""
        if authority_key in VERIFIED_REGISTRY:
            city_numbers = VERIFIED_REGISTRY[authority_key].get("numbers", {})
            verified_phone = city_numbers.get(location, VERIFIED_REGISTRY[authority_key].get("default", ""))
            
        # If environment phone is empty or uses the .env.example default pattern,
        # override with the real, officially verified regional number!
        is_dummy_env = phone.startswith("+923001234") or not phone
        if is_dummy_env and verified_phone:
            phone = verified_phone
            
        authority_name = authority.get("name", "Unknown")
        timestamp = datetime.now().isoformat()

        record = {
            "authority_key": authority_key,
            "authority_name": authority_name,
            "phone": phone if phone else "NOT_CONFIGURED",
            "emoji": authority.get("emoji", "🚨"),
            "priority": authority.get("priority", "primary"),
            "crisis_type": crisis.get("crisis_type"),
            "location": location,
            "severity": crisis.get("severity"),
            "timestamp": timestamp,
            "real_sms_sent": False,
            "dispatch_method": "simulated",
            "status": "simulated",
            "message_preview": message[:120] + "...",
        }

        # Attempt real SMS if not in demo mode and phone is configured
        if not self.demo_mode and phone and phone != "NOT_CONFIGURED":
            sms_result = await _send_twilio_sms(phone, message)
            if sms_result.get("sent"):
                record["real_sms_sent"] = True
                record["dispatch_method"] = "twilio_sms"
                record["status"] = "sent"
                record["twilio_sid"] = sms_result.get("sid")
            else:
                record["dispatch_method"] = "simulated"
                record["status"] = "simulated"
                record["sms_fail_reason"] = sms_result.get("reason")
        else:
            record["dispatch_method"] = "simulated"
            record["status"] = "simulated"

        self._log_trace("authority_dispatched", {
            "authority": authority_name,
            "method": record["dispatch_method"],
            "real_sent": record["real_sms_sent"],
        })

        return record

    async def _save_dispatch_records(self, records: List[Dict], crisis: Dict):
        """Persist dispatch records to the database."""
        try:
            from database.db_setup import SessionLocal, DispatchRecord
            db = SessionLocal()
            try:
                for rec in records:
                    db_record = DispatchRecord(
                        crisis_id=crisis.get("crisis_id", ""),
                        crisis_type=crisis.get("crisis_type", ""),
                        location=crisis.get("location", ""),
                        severity=crisis.get("severity", ""),
                        authority_key=rec["authority_key"],
                        authority_name=rec["authority_name"],
                        authority_phone=rec["phone"],
                        dispatch_method=rec["dispatch_method"],
                        status=rec["status"],
                        real_sms_sent=rec["real_sms_sent"],
                        message_preview=rec.get("message_preview", ""),
                        dispatched_at=datetime.now(),
                    )
                    db.add(db_record)
                db.commit()
            finally:
                db.close()
        except Exception as e:
            try:
                print(f"[DispatchAgent] Failed to persist records: {e}")
            except UnicodeEncodeError:
                err_msg = str(e).encode('ascii', 'replace').decode('ascii')
                print(f"[DispatchAgent] Failed to persist records (safe encode): {err_msg}")
