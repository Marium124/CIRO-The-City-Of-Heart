import os
import pandas as pd
import json

def parse_excel_to_txt():
    output_path = "parsed_excel_preview.txt"
    with open(output_path, "w", encoding="utf-8") as f:
        f.write("==================================================\n")
        f.write("CIRO EMERGENCY CONTACT DETAILS EXCEL PARSE PREVIEW\n")
        f.write("==================================================\n\n")
        
        files = [
            "CIRO_Emergencies_contact_details.xlsx",
            "CIRO_Emergencies_contact_details_UPDATED_FORMATTED.xlsx"
        ]
        
        for file in files:
            if not os.path.exists(file):
                f.write(f"FILE NOT FOUND: {file}\n\n")
                continue
                
            f.write(f"==================================================\n")
            f.write(f"FILE: {file}\n")
            f.write(f"==================================================\n")
            
            try:
                xl = pd.ExcelFile(file)
                f.write(f"Sheets: {xl.sheet_names}\n\n")
                
                for sheet in xl.sheet_names:
                    f.write(f"--- Sheet: {sheet} ---\n")
                    df = xl.parse(sheet)
                    
                    # Convert to string and write
                    f.write(df.to_string())
                    f.write("\n\n")
                    
                    # Write JSON representation for easy programmatic parsing
                    f.write("JSON Data Representation:\n")
                    records = df.to_dict(orient="records")
                    # Convert NaN to None for clean JSON
                    clean_records = []
                    for r in records:
                        clean_r = {k: (None if pd.isna(v) else v) for k, v in r.items()}
                        clean_records.append(clean_r)
                    f.write(json.dumps(clean_records, indent=2))
                    f.write("\n\n")
                    
            except Exception as e:
                f.write(f"Error reading file {file}: {str(e)}\n\n")
                
    print(f"Successfully parsed Excel files and wrote preview to: {output_path}")

if __name__ == "__main__":
    parse_excel_to_txt()
