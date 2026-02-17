import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

# Importing your existing backend logic 
from backend.app import triagent, users, medical_profile_user, doctorconnect, store_conversation
from backend.app.database import get_connection
from backend.app.agents import agent 

app = FastAPI(title="AgenticHealthAI API")

# Enable CORS for frontend interaction
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Data Models ---

class SignupRequest(BaseModel):
    name: str
    email: str
    password: str
    blood_group: str
    allergies: str

class LoginRequest(BaseModel):
    email: str
    password: str

class UserQuery(BaseModel):
    user_id: int
    query: str

# --- Endpoints ---

@app.post("/signup")
def signup(data: SignupRequest):
    """Handles user creation and immediate profile setup."""
    try:
        # Create user
        user_id = users.create_user(data.name, data.email, data.password)
        # Create medical profile
        medical_profile_user.create_medical_profiles(user_id, data.blood_group, data.allergies)
        return {"id": user_id, "name": data.name}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/login")
def login(data: LoginRequest):
    """Authenticates and retrieves user profile."""
    user = users.get_user(data.email, data.password)
    if user:
        # user tuple: (id, name, email, password_hash)
        profile = medical_profile_user.get_medical_profiles(user[0])
        return {
            "id": user[0], 
            "name": user[1], 
            "profile": {
                "blood_group": profile[0][2], 
                "allergies": profile[0][3]
            } if profile else None
        }
    raise HTTPException(status_code=401, detail="Invalid credentials")

@app.get("/history/{user_id}")
def get_history(user_id: int):
    """Retrieves previous user queries for the right-side sidebar."""
    try:
        conn = get_connection("conversation")
        cursor = conn.cursor()
        # Fetching only user role messages for history
        query = """
            SELECT message, created_at 
            FROM conversations 
            WHERE user_id = %s AND role = 'user' 
            ORDER BY created_at DESC LIMIT 10
        """
        cursor.execute(query, (user_id,))
        rows = cursor.fetchall()
        cursor.close()
        conn.close()
        return [{"query": r[0], "time": r[1].strftime("%Y-%m-%d %H:%M")} for r in rows]
    except Exception as e:
        return []

@app.post("/triage")
def triage(data: UserQuery):
    """Analyzes symptoms using triagent logic."""
    return triagent.check_risk(data.query)

@app.post("/chat")
def chat(data: UserQuery):
    """Communicates with the AI Agent and logs the conversation."""
    # Store user message
    store_conversation.store_conversation(data.user_id, "user", data.query)
    
    # Get agent response
    raw_response = agent.get_response(data.query, user_id=str(data.user_id))
    
    # Simple logic to ensure the response can be split into PubMed and AI segments
    # The frontend expects a double newline '\n\n' to segregate blocks
    if "\n\n" not in raw_response:
        formatted_response = f"Literature Summary: Information retrieved.\n\nClinical Interpretation: {raw_response}"
    else:
        formatted_response = raw_response

    # Store AI response
    store_conversation.store_conversation(data.user_id, "assistant", formatted_response)
    
    return {"response": formatted_response}

@app.get("/doctors")
def get_doctors(lat: float, lon: float):
    """Finds nearest doctors from the database."""
    doctors = doctorconnect.find_nearest_doctors(lat, lon)
    return [
        {"name": d[0], "specialty": d[1], "phone": d[2], "dist": d[3]} 
        for d in doctors
    ]

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)