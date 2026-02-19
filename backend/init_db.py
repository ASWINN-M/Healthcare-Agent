import mysql.connector
import os
from dotenv import load_dotenv

load_dotenv()

DB_HOST = os.getenv("DB_HOST", "localhost")
DB_USER = os.getenv("DB_USER", "root")
DB_PASSWORD = os.getenv("DB_PASSWORD")
DB_PORT = int(os.getenv("DB_PORT", 3306))


def init_db():
    print(f"Connecting to MySQL at {DB_HOST}:{DB_PORT} as {DB_USER}...")
    print(f"Using Password: '{DB_PASSWORD}'")
    try:
        # Connect to MySQL server (no database selected)
        conn = mysql.connector.connect(
            host=DB_HOST,
            user=DB_USER,
            password=DB_PASSWORD,
            port=DB_PORT
        )
        cursor = conn.cursor()
        print("Connected to MySQL server.")

        # Create 'user' database
        print("Creating 'user' database...")
        cursor.execute("CREATE DATABASE IF NOT EXISTS user")
        cursor.execute("USE user")
        
        # Create 'users' table
        print("Creating 'users' table...")
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                full_name VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL UNIQUE,
                password_hash VARCHAR(255) NOT NULL
            )
        """)
        
        # Create 'medical_profiles' table (moved to 'user' database)
        print("Creating 'medical_profiles' table...")
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS medical_profiles (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                blood_group VARCHAR(10),
                allergies TEXT,
                FOREIGN KEY (user_id) REFERENCES users(id)
            )
        """)

        # Create 'conversations' table
        print("Creating 'conversations' table...")
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS conversations (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                role ENUM('user', 'assistant') NOT NULL,
                message TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id)
            )
        """)
        
        conn.commit()
        cursor.close()
        conn.close()
        print("Database initialization completed successfully.")
        
    except mysql.connector.Error as err:
        print(f"Error: {err}")
    except Exception as e:
        print(f"Unexpected error: {e}")

if __name__ == "__main__":
    init_db()
