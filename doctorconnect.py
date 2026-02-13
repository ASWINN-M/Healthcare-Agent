import mysql.connector
from math import radians, sin, cos, sqrt, atan2


def get_connection():
    return mysql.connector.connect(
        host="127.0.0.1",
        user="root",
        password="Satlav@76",
        database="DoctorDB",
        port=3306
    )


def user_location():
    # Hardcoded Bangalore coordinates
    return (12.9716, 77.5946)


def haversine(lat1, lon1, lat2, lon2):
    R = 6371.0

    lat1_rad = radians(lat1)
    lon1_rad = radians(lon1)
    lat2_rad = radians(lat2)
    lon2_rad = radians(lon2)

    dlat = lat2_rad - lat1_rad
    dlon = lon2_rad - lon1_rad

    a = sin(dlat / 2) ** 2 + cos(lat1_rad) * cos(lat2_rad) * sin(dlon / 2) ** 2
    c = 2 * atan2(sqrt(a), sqrt(1 - a))

    return R * c


def find_nearest_doctors(user_lat, user_lon, specialty=None):
    conn = get_connection()
    cursor = conn.cursor()

    if specialty:
        query = """
        SELECT name, latitude, longitude, phone_number
        FROM doctors
        WHERE specialty = %s
        """
        cursor.execute(query, (specialty,))
    else:
        query = """
        SELECT name, latitude, longitude, phone_number
        FROM doctors
        """
        cursor.execute(query)

    doctors = cursor.fetchall()

    nearest_doctors = []

    for name, lat, lon, phone in doctors:
        distance = haversine(user_lat, user_lon, lat, lon)
        nearest_doctors.append((name, phone, distance))

    nearest_doctors.sort(key=lambda x: x[2])

    cursor.close()
    conn.close()

    return nearest_doctors[:5]
