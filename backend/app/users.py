import bcrypt
from backend.app.database import get_connection

def create_user(name, email, password):
    conn = get_connection("user")
    cursor = conn.cursor()
    hashed_password = bcrypt.hashpw(password.encode(), bcrypt.gensalt())
    cursor.execute(
        "INSERT INTO users (full_name, email, password_hash) VALUES (%s, %s, %s)",
        (name, email, hashed_password)
    )
    conn.commit()
    user_id = cursor.lastrowid
    cursor.close()
    conn.close()
    return user_id

def get_user(email, password):
    conn = get_connection("user")
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
    user = cursor.fetchone()
    cursor.close()
    conn.close()

    if user:
        stored_hash = user[3]

        # If stored hash is string, convert to bytes
        if isinstance(stored_hash, str):
            stored_hash = stored_hash.encode()

        if bcrypt.checkpw(password.encode(), stored_hash):
            return user

    return None
