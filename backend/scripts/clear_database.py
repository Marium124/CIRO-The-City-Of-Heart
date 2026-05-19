import sqlite3
import os

db_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'crisis_response.db'))

def clear_db():
    if not os.path.exists(db_path):
        print(f"Database not found at: {db_path}")
        return
        
    print(f"Connecting to database: {db_path}")
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    tables = ['signals', 'crises', 'actions', 'agent_logs', 'dispatch_records']
    
    print("\nPurging historical test records to prepare clean presentation state...")
    for table in tables:
        try:
            # Check if table exists
            cursor.execute(f"SELECT name FROM sqlite_master WHERE type='table' AND name='{table}'")
            if cursor.fetchone():
                cursor.execute(f"DELETE FROM {table}")
                print(f"[OK] Table [{table}]: Cleared and reset.")
            else:
                print(f"[WARN] Table [{table}]: Does not exist in database yet.")
        except Exception as e:
            print(f"[ERROR] Error clearing table {table}: {e}")
            
    conn.commit()
    conn.close()
    print("\nDatabase purged successfully! Ready for your live human-initiated demo tomorrow.")

if __name__ == "__main__":
    clear_db()
