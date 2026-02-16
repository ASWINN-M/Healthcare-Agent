import os
import mysql.connector
from dotenv import load_dotenv

load_dotenv()

def get_connection(database):
    return mysql.connector.connect(
        host=os.getenv("DB_HOST"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
        database=database,
        port=int(os.getenv("DB_PORT", 3306))
    )
