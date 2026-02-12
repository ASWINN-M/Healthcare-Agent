import triagent
import doctorconnect
import sys

def main():
    print("\n--- HealthCare Agent ---")
    query = input("Please describe your symptoms: ")
    
    risk_assessment = triagent.check_risk(query)
    risk_level = risk_assessment.get("risk_level", "low").lower()
    advice = risk_assessment.get("advice", "")
    
    print(f"\nRisk Level: {risk_level.upper()}")
    print(f"Advice: {advice}\n")
    
    # Logic: High risk -> Doctor directly. Low risk -> Ask user.
    if "high" in risk_level:
        print("DETECTED HIGH RISK. Initiating immediate doctor connection protocol...")
        connect_to_doctor()
    else:
        choice = input("Would you like to find a doctor? (yes/no): ").strip().lower()
        if choice in ["yes", "y", "sure", "ok"]:
            connect_to_doctor()
        else:
            connect_to_agent(query)

def connect_to_doctor():
    print("Locating nearest medical professionals...")
    try:
        location = doctorconnect.user_location()
        if not location:
            print("Could not determine your location. Please ensure you have an internet connection.")
            return

        lat, lon = location
        doctors = doctorconnect.find_nearest_doctors(lat, lon)
        
        if doctors:
            print(f"\nFound {len(doctors)} doctors near you:\n")
            
            for name, phone, distance in doctors:
                print(f"Doctor: {name}")
                print(f"Phone: {phone}")
                print(f"Distance: {distance:.2f} km away")
                print("-" * 40)
        else:
            print("No doctors found in your immediate vicinity.")
            
    except Exception as e:
        print(f"Error connecting to doctor network: {e}")


def connect_to_agent(initial_query):
    print("Connecting to AI Medical Agent...")
    try:
        import agent
        # Expecting a function get_response(query) in agent.py
        if hasattr(agent, 'get_response'):
            print("\n--- Entering Chat Mode ---")
            print("Type 'exit', 'quit', or 'back' to return to main menu.\n")
            
            query = initial_query
            while True:
                if query.lower() in ['exit', 'quit', 'back']:
                    print("Exiting chat mode...")
                    break
                
                response = agent.get_response(query)
                print(f"\nAgent: {response}\n")
                
                query = input("You: ").strip()
        else:
            print("\n[System]: The AI Agent is currently offline (function 'get_response' not found in agent.py).")
            print("Please implement 'get_response(query)' in agent.py to enable this feature.")
    except ImportError:
        print("\n[System]: agent.py module not found.")
    except Exception as e:
        print(f"\n[System]: An error occurred while communicating with the agent: {e}")

if __name__ == "__main__":
    main()
