import mysql.connector
from langchain_core.messages import HumanMessage, AIMessage

def connect_to_db():
    return mysql.connector.connect(
        host="127.0.0.1",
        user="root",
        password="Msaa@1234",
        database="conversation",
        port=3306
    )

def store_conversation(user_id, role, message):
    """Store a single conversation turn (role='user' or 'assistant')."""
    conn = connect_to_db()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO conversations (user_id, role, message) VALUES (%s, %s, %s)",
        (user_id, role, message)
    )
    conn.commit()
    cursor.close()
    conn.close()

def load_conversation(user_id):
    """Load full conversation history for a user as LangChain message objects."""
    conn = connect_to_db()
    cursor = conn.cursor(dictionary=True)

    query = """
    SELECT role, message FROM conversations
    WHERE user_id = %s
    ORDER BY created_at ASC
    """

    cursor.execute(query, (user_id,))
    rows = cursor.fetchall()

    cursor.close()
    conn.close()

    messages = []
    for row in rows:
        if row["role"] == "user":
            messages.append(HumanMessage(content=row["message"]))
        else:
            messages.append(AIMessage(content=row["message"]))

    return messages
