import sqlite3
import os

db_path = 'c:/ciro/backend/crisis_response.db'
if not os.path.exists(db_path):
    print(f"DB not found at {db_path}")
else:
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    tables = ['signals', 'crises', 'actions', 'agent_logs']
    for table in tables:
        try:
            cursor.execute(f"SELECT COUNT(*) FROM {table}")
            count = cursor.fetchone()[0]
            print(f"Table {table}: {count} records")
        except Exception as e:
            print(f"Error reading {table}: {e}")
    
    conn.close()
