
from backend.app import triagent
from backend.app import doctorconnect
from backend.app import users
from backend.app import medical_profile_user
from backend.app import store_conversation


# ── Current logged-in user (set after auth) ──
current_user = None  # tuple: (id, name, email, password_hash)

# ═══════════════════════════════════════════
#  Auth
# ═══════════════════════════════════════════

def auth_menu():
    """Login or signup. Returns user tuple on success, or None."""
    global current_user
    while True:
        print("\n--- Welcome to HealthCare Agent ---")
        print("1. Login")
        print("2. Signup")
        print("3. Exit")
        choice = input("Choose an option: ").strip()

        if choice == "1":
            email = input("Email: ").strip()
            password = input("Password: ").strip()
            user = users.get_user(email, password)
            if user:
                current_user = user
                print(f"\nWelcome back, {user[1]}!")
                return user
            else:
                print("Invalid email or password. Try again.")

        elif choice == "2":
            name = input("Name: ").strip()
            email = input("Email: ").strip()
            password = input("Password: ").strip()
            try:
                user_id = users.create_user(name, email, password)
                print(f"\nAccount created! Your user ID is {user_id}.")
                # Auto-login after signup
                current_user = (user_id, name, email, None)
                return current_user
            except Exception as e:
                print(f"Signup failed: {e}")

        elif choice == "3":
            print("Goodbye!")
            sys.exit(0)
        else:
            print("Invalid choice.")

# ═══════════════════════════════════════════
#  Medical Profile
# ═══════════════════════════════════════════

def profile_menu(user_id):
    """Show / create / update the user's medical profile."""
    profiles = medical_profile_user.get_medical_profiles(user_id)

    if profiles:
        p = profiles[0]  # first profile row
        print(f"\n--- Your Medical Profile ---")
        print(f"  Blood Group : {p[2]}")
        print(f"  Allergies   : {p[3]}")
        choice = input("Update profile? (yes/no): ").strip().lower()
        if choice in ("yes", "y"):
            blood = input("Blood group: ").strip()
            allergies = input("Allergies (comma-separated): ").strip()
            medical_profile_user.update_medical_profiles(user_id, blood, allergies)
            print("Profile updated!")
    else:
        print("\nNo medical profile found. Let's set one up.")
        blood = input("Blood group: ").strip()
        allergies = input("Allergies (comma-separated, or 'none'): ").strip()
        medical_profile_user.create_medical_profiles(user_id, blood, allergies)
        print("Profile saved!")

# ═══════════════════════════════════════════
#  Main flow  (unchanged workflow)
# ═══════════════════════════════════════════

def main():
    user = auth_menu()
    user_id = user[0]

    profile_menu(user_id)

    print("\n--- HealthCare Agent ---")
    query = input("Please describe your symptoms: ")

    risk_assessment = triagent.check_risk(query)
    risk_level = risk_assessment.get("risk_level", "low").lower()
    advice = risk_assessment.get("advice", "")

    print(f"\nRisk Level: {risk_level.upper()}")
    print(f"Advice: {advice}\n")

    if "high" in risk_level:
        print("DETECTED HIGH RISK. Initiating immediate doctor connection protocol...")
        connect_to_doctor()
    else:
        choice = input(
            "If you want to consult a doctor type 'yes'. "
            "Else type 'no' for chatting with medical_ai_agent and view the pubmed summary: "
        ).strip().lower()

        if choice in ["yes", "y", "sure", "ok"]:
            connect_to_doctor()
        else:
            connect_to_agent(query, user_id)


# ═══════════════════════════════════════════
#  Doctor connection  (unchanged)
# ═══════════════════════════════════════════

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
            print(f"\nFound {len(doctors)} doctors near you:")
            for name, specialty, phone, distance in doctors:
                print(f"- Dr. {name}")
                print(f"  Specialty : {specialty}")
                print(f"  Phone     : {phone}")
                print(f"  Distance  : {distance:.2f} km\n")

        else:
            print("No doctors found in your immediate vicinity.")

    except Exception as e:
        print(f"Error connecting to doctor network: {e}")


# def connect_to_agent(initial_query, user_id):
    # print("Connecting to AI Medical Agent...")
    # try:
    #     from backend.app.agents import agent

    #     if hasattr(agent, 'get_response'):
    #         print("\n--- Entering Chat Mode ---")
    #         print("Type 'exit', 'quit', or 'back' to return to main menu.\n")

    #         query = initial_query
    #         while True:
    #             if query.lower() in ['exit', 'quit', 'back']:
    #                 print("Exiting chat mode...")
    #                 break

    #             # Store the user message
    #             store_conversation.store_conversation(user_id, "user", query)

    #             # Get agent response (user_id used as thread_id for memory)
    #             response = agent.get_response(query, user_id=user_id)
    #             print(f"\nAgent: {response}\n")

    #             # Store the agent response
    #             store_conversation.store_conversation(user_id, "assistant", response)

    #             query = input("You: ").strip()
    #     else:
    #         print("\n[System]: The AI Agent is currently offline (function 'get_response' not found in agent.py).")
    #         print("Please implement 'get_response(query)' in agent.py to enable this feature.")
    # except ImportError:
    #     print("\n[System]: agent.py module not found.")
    # except Exception as e:
    #     print(f"\n[System]: An error occurred while communicating with the agent: {e}")



def connect_to_agent(initial_query, user_id):
    print("Connecting to AI Medical Agent...")
    try:
        import backend.app.agents.agent as agent

        if hasattr(agent, 'get_response'):
            print("\n--- Entering Chat Mode ---")
            print("Type 'exit', 'quit', or 'back' to return to main menu.\n")

            query = initial_query
            while True:
                if query.lower() in ['exit', 'quit', 'back']:
                    print("Exiting chat mode...")
                    break

                store_conversation.store_conversation(user_id, "user", query)

                response = agent.get_response(query, user_id=user_id)
                print(f"\nAgent: {response}\n")

                store_conversation.store_conversation(user_id, "assistant", response)

                query = input("You: ").strip()
        else:
            print("\n[System]: get_response() not found inside agent.py")

    except Exception as e:
        print(f"\n[System]: Import failed: {e}")
    


if __name__ == "__main__":
    main()