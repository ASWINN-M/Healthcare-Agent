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

    # 🔥 ALWAYS show AI medical analysis first
    show_ai_analysis(query)

    # 🔴 HIGH RISK → Automatically show doctors
    if "high" in risk_level:
        print("\nDETECTED HIGH RISK. Initiating immediate doctor connection protocol...")
        connect_to_doctor()

    # 🟢 LOW RISK → Ask user if they want doctor
    else:
        choice = input("\nWould you like to find a doctor? (yes/no): ").strip().lower()
        if choice in ["yes", "y", "sure", "ok"]:
            connect_to_doctor()


def show_ai_analysis(query):
    print("\n--- AI Medical Analysis ---")
    try:
        import agent
        if hasattr(agent, 'get_response'):
            response = agent.get_response(query)
            print(f"\n{response}\n")
        else:
            print("AI Agent not properly configured.")
    except Exception as e:
        print(f"Error in AI analysis: {e}")


def connect_to_doctor():
    print("\nLocating nearest medical professionals...")
    try:
        location = doctorconnect.user_location()
        if not location:
            print("Could not determine your location.")
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
            print("No doctors found nearby.")
            
    except Exception as e:
        print(f"Error connecting to doctor network: {e}")


if __name__ == "__main__":
    main()
