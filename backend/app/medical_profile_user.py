from backend.app.database import get_connection

def create_medical_profiles(user_id, blood_group, allergies):
    conn = get_connection("medical_profiles")
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO medical_profiles (user_id, blood_group, allergies) VALUES (%s, %s, %s)",
        (user_id, blood_group, allergies)
    )
    conn.commit()
    cursor.close()
    conn.close()

def get_medical_profiles(user_id):
    conn = get_connection("medical_profiles")
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM medical_profiles WHERE user_id = %s", (user_id,))
    profiles = cursor.fetchall()
    cursor.close()
    conn.close()
    return profiles

def update_medical_profiles(user_id, blood_group, allergies):
    conn = get_connection("medical_profiles")
    cursor = conn.cursor()
    cursor.execute(
        "UPDATE medical_profiles SET blood_group = %s, allergies = %s WHERE user_id = %s",
        (blood_group, allergies, user_id)
    )
    conn.commit()
    cursor.close()
    conn.close()

def delete_medical_profiles(user_id):
    conn = get_connection("medical_profiles")
    cursor = conn.cursor()
    cursor.execute("DELETE FROM medical_profiles WHERE user_id = %s", (user_id,))
    conn.commit()
    cursor.close()
    conn.close()
