import mysql.connector

def medical_profile_connect():
    return mysql.connector.connect(
        host="127.0.0.1",
        user="root",
        password="Msaa@1234",
        database="medical_profiles",
        port=3306
    )

def create_medical_profiles(user_id, blood_group, allergies):
    conn = medical_profile_connect()
    cursor = conn.cursor()
    cursor.execute("INSERT INTO medical_profiles (user_id, blood_group, allergies) VALUES (%s, %s, %s)", (user_id, blood_group, allergies))
    conn.commit()
    cursor.close()
    conn.close()

def get_medical_profiles(user_id):
    conn = medical_profile_connect()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM medical_profiles WHERE user_id = %s", (user_id,))
    medical_profiles = cursor.fetchall()
    cursor.close()
    conn.close()
    return medical_profiles

def update_medical_profiles(user_id, blood_group, allergies):
    conn = medical_profile_connect()
    cursor = conn.cursor()
    cursor.execute("UPDATE medical_profiles SET blood_group = %s, allergies = %s WHERE user_id = %s", (blood_group, allergies, user_id))
    conn.commit()
    cursor.close()
    conn.close()

def delete_medical_profiles(user_id):
    conn = medical_profile_connect()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM medical_profiles WHERE user_id = %s", (user_id,))
    conn.commit()
    cursor.close()
    conn.close()
