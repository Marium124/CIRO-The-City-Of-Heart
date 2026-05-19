import sqlite3
import csv
import os

db_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'crisis_response.db'))
export_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'exports'))

def export_to_csv():
    if not os.path.exists(db_path):
        print(f"Database not found at: {db_path}")
        return
        
    if not os.path.exists(export_dir):
        os.makedirs(export_dir)
        
    print(f"Connecting to database: {db_path}")
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    tables = ['signals', 'crises', 'actions', 'agent_logs', 'dispatch_records']
    
    print("\nExporting database tables to CSV format for BI Analytics...")
    for table in tables:
        try:
            # Check if table exists
            cursor.execute(f"SELECT name FROM sqlite_master WHERE type='table' AND name='{table}'")
            if not cursor.fetchone():
                print(f"[WARN] Table [{table}] does not exist in database yet.")
                continue
                
            # Get table data
            cursor.execute(f"SELECT * FROM {table}")
            rows = cursor.fetchall()
            
            # Get column headers
            column_names = [description[0] for description in cursor.description]
            
            csv_path = os.path.join(export_dir, f"{table}_export.csv")
            with open(csv_path, 'w', newline='', encoding='utf-8') as f:
                writer = csv.writer(f)
                writer.writerow(column_names) # Write header
                writer.writerows(rows) # Write data
                
            print(f"[OK] Table [{table}] exported to: {csv_path} ({len(rows)} rows)")
        except Exception as e:
            print(f"[ERROR] Failed to export table {table}: {e}")
            
    conn.close()
    print(f"\n🎉 All tables exported successfully to folder: {export_dir}")
    print("You can now share these CSV files directly with your partner!")

if __name__ == "__main__":
    export_to_csv()
