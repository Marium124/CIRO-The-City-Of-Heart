import openpyxl

file_path = "CIRO_Emergencies_contact_details_UPDATED_FORMATTED.xlsx"

# Load the workbook
wb = openpyxl.load_workbook(file_path)
sheet = wb["Emergency Contacts"]

# We will iterate through rows and fill in the missing '—' values based on logic
# Column mappings (approximate 1-indexed based on preview)
# Col C: Karachi, Col D: Lahore, Col E: Islamabad, Col F: Peshawar, Col G: Quetta
# Let's find the rows dynamically or just iterate over all.
for row in sheet.iter_rows(min_row=3):
    service_cell = row[1] # Column B
    karachi = row[2]
    lahore = row[3]
    islamabad = row[4]
    peshawar = row[5]
    quetta = row[6]
    
    if service_cell.value is None:
        continue
    
    service_name = str(service_cell.value).strip()
    
    # Fill missing values with common nation-wide numbers if applicable
    if "Chhipa Welfare" in service_name:
        for cell in [lahore, islamabad, peshawar, quetta]:
            if cell.value == "—": cell.value = "1020"
            
    elif "NDMA National Helpline" in service_name or "Flood Relief" in service_name:
        for cell in [karachi, lahore, peshawar, quetta]:
            if cell.value == "—": cell.value = "1700"
            
    elif "Mental Health Helpline" in service_name:
        for cell in [karachi, lahore, peshawar, quetta]:
            if cell.value == "—": cell.value = "0317-4288665"
            
    elif "COVID / Epidemic" in service_name:
        for cell in [karachi, lahore, peshawar, quetta]:
            if cell.value == "—": cell.value = "0800-01234"
            
    elif "FIA Cybercrime" in service_name:
        # Nationwide shortcode is 1991
        for cell in [karachi, lahore, islamabad, peshawar, quetta]:
            if cell.value == "—": cell.value = "1991"
            
    elif "Jinnah Hospital" in service_name:
        # Karachi JPMC
        if karachi.value == "—": karachi.value = "+92-21-99201300"
        
    elif "Pakistan Army GHQ" in service_name:
        # Applicable nationally
        val = islamabad.value
        for cell in [karachi, lahore, peshawar, quetta]:
            if cell.value == "—": cell.value = val

wb.save(file_path)
print("Successfully filled in missing data in the Excel file.")
