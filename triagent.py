HIGH_RISK = {
    "chest pain",
    "difficulty breathing",
    "unconscious",
    "seizure",
    "heavy bleeding",
    "suicidal thoughts",
    "stroke symptoms"
}

NEGATIONS = {"no", "not", "dont", "don't", "without"}
emergency_symptoms = {'high', 'severe', 'sudden', 'unbearable', 'worsening', 'persistent'}

def check_risk(user_query: str) -> dict:
    user_query = user_query.lower()
    words = user_query.split()

    for symptom in HIGH_RISK:
        symptom1 = "".join(symptom.split())

        if symptom in user_query or symptom1 in user_query:

            if symptom1 in user_query:
                symptom = symptom1

            symptom_words = symptom.split()

            for i in range(len(words) - len(symptom_words) + 1):
                if words[i:i+len(symptom_words)] == symptom_words:

                    # Check negation in previous 2 words
                    window = words[max(0, i-2):i]
                    if any(neg in window for neg in NEGATIONS):
                        continue

                    # Check intensity words around symptom
                    intensity_window = (
                        words[max(0, i-3):i] +
                        words[i+len(symptom_words): i+len(symptom_words)+3]
                    )

                    if any(emergency in intensity_window for emergency in emergency_symptoms):
                        return {
                            "risk_level": "high",
                            "advice": "Seek immediate medical attention or call emergency services."
                        }

                    return {
                        "risk_level": "high",
                        "advice": "Seek immediate medical attention or call emergency services."
                    }

    return {
        "risk_level": "low",
        "advice": "Monitor your symptoms and consult a healthcare professional if they worsen."
    }
