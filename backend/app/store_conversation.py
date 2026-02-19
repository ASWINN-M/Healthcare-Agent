from backend.app.database import get_connection
from langchain_core.messages import HumanMessage, AIMessage

def store_conversation(user_id, role, message):
    conn = get_connection("user")
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
    conn = get_connection("user")
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