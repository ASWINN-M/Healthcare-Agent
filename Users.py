import mysql.connector
import bcrypt

def user_connect():
    return mysql.connector.connect(
        host="127.0.0.1",
        user="root",
        password="Msaa@1234",
        database="user",
        port=3306
    )


def create_user(name, email, password):
    conn = user_connect()
    cursor = conn.cursor()
    hashed_password = bcrypt.hashpw(password.encode(), bcrypt.gensalt())
    cursor.execute("INSERT INTO users (full_name, email, password_hash) VALUES (%s, %s, %s)", (name, email, hashed_password))
    conn.commit()
    user_id = cursor.lastrowid
    cursor.close()
    conn.close()
    return user_id

def get_user(email, password):
    conn = user_connect()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
    user = cursor.fetchone()
    cursor.close()
    conn.close()
    if user and bcrypt.checkpw(password.encode(), user[3].encode() if isinstance(user[3], str) else user[3]):
        return user
    return None
