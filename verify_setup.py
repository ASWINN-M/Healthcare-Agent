import sys
import os

# Add current directory to sys.path to ensure we can import local modules
sys.path.append(os.getcwd())

try:
    print("Checking 'triagent' module...")
    from triagent import check_risk
    print("Successfully imported check_risk from triagent.")
    
    query = "chest pain and difficulty breathing"
    result = check_risk(query)
    print(f"Test query: '{query}'")
    print(f"Result: {result}")
    
except ImportError as e:
    print(f"Failed to import triagent: {e}")
except Exception as e:
    print(f"Error checking triagent: {e}")

print("-" * 20)

try:
    print("Checking 'doctorconnect' module and database connection...")
    from doctorconnect import get_connection
    print("Successfully imported get_connection from doctorconnect.")
    
    conn = get_connection()
    if conn.is_connected():
        print("Successfully connected to the database.")
        conn.close()
    else:
        print("Failed to connect to the database.")
        
except ImportError as e:
    print(f"Failed to import doctorconnect: {e}")
except Exception as e:
    print(f"Error checking doctorconnect: {e}")
