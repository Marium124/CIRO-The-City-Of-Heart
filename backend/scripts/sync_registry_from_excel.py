import pandas as pd
import json
import os

file_path = "CIRO_Emergencies_contact_details_UPDATED_FORMATTED.xlsx"
registry_path = "backend/agents/contacts_registry.json"

def sync_registry():
    df = pd.read_excel(file_path, sheet_name="Emergency Contacts")
    
    # Load existing registry
    with open(registry_path, "r", encoding="utf-8") as f:
        registry = json.load(f)
        
    # Map the departments to registry keys based on known names
    mapping = {
        "Fire Brigade": "fire_brigade",
        "Police Emergency": "traffic_police", # Approximation
        "NDMA National Helpline": "ndma",
        "Edhi Foundation Ambulance": "edhi_foundation",
        "Civil Hospital Karachi Emergency": "rescue_medical", # Approximation for medical
        "Aga Khan Hospital Emergency": "rescue_medical",
        "Karachi Water Board Emergency": "water_board",
        "Civil Defence": "civil_defence"
    }

    # Iterate rows and update registry
    # Columns are assumed as:
    # 0: col A
    # 1: Department / Service
    # 2: Karachi (Sindh)
    # 3: Lahore (Punjab)
    # 4: Islamabad
    # 5: Peshawar (KPK)
    # 6: Quetta (Balochistan)
    
    for idx, row in df.iterrows():
        dept = str(row.iloc[1]).strip()
        for key_phrase, reg_key in mapping.items():
            if key_phrase in dept:
                # Update numbers
                if reg_key in registry:
                    def get_val(val):
                        v = str(val).strip()
                        return "" if v == "—" or v == "nan" else v
                    
                    karachi = get_val(row.iloc[2])
                    lahore = get_val(row.iloc[3])
                    islamabad = get_val(row.iloc[4])
                    peshawar = get_val(row.iloc[5])
                    quetta = get_val(row.iloc[6])
                    
                    if karachi: registry[reg_key]["numbers"]["Karachi"] = karachi
                    if lahore: registry[reg_key]["numbers"]["Lahore"] = lahore
                    if islamabad: registry[reg_key]["numbers"]["Islamabad"] = islamabad
                    if peshawar: registry[reg_key]["numbers"]["Peshawar"] = peshawar
                    if quetta: registry[reg_key]["numbers"]["Quetta"] = quetta

    with open(registry_path, "w", encoding="utf-8") as f:
        json.dump(registry, f, indent=2)

    print(f"Successfully synced {registry_path} with data from {file_path}")

if __name__ == "__main__":
    sync_registry()
