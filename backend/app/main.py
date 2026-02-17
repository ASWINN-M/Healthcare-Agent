from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from backend.app import (
    triagent,
    doctorconnect,
    users,
    medical_profile_user,
    store_conversation,
)
import backend.app.agents.agent as agent

app = FastAPI(title="Healthcare Agent API")

# ─────────────────────────────────────────────
# CORS (Frontend Support)
# ─────────────────────────────────────────────

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─────────────────────────────────────────────
# Request Models
# ─────────────────────────────────────────────

class SignupRequest(BaseModel):
    name: str
    email: str
    password: str
    blood_group: str
    allergies: str


class LoginRequest(BaseModel):
    email: str
    password: str


class UpdateProfileRequest(BaseModel):
    user_id: int
    blood_group: str
    allergies: str


class SymptomRequest(BaseModel):
    user_id: int
    symptoms: str


class ChatRequest(BaseModel):
    user_id: int
    message: str


# ─────────────────────────────────────────────
# AUTH APIs
# ─────────────────────────────────────────────

@app.post("/signup")
def signup(data: SignupRequest):
    try:
        user_id = users.create_user(data.name, data.email, data.password)
        medical_profile_user.create_medical_profiles(
            user_id, data.blood_group, data.allergies
        )

        return {
            "message": "Signup successful",
            "user_id": user_id,
            "name": data.name,
        }

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/login")
def login(data: LoginRequest):
    user = users.get_user(data.email, data.password)

    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    return {
        "message": "Login successful",
        "user_id": user[0],
        "name": user[1],
    }


# ─────────────────────────────────────────────
# PROFILE
# ─────────────────────────────────────────────

@app.get("/profile/{user_id}")
def get_profile(user_id: int):
    profiles = medical_profile_user.get_medical_profiles(user_id)

    if not profiles:
        raise HTTPException(status_code=404, detail="Profile not found")

    p = profiles[0]

    return {
        "blood_group": p[2],
        "allergies": p[3],
    }


@app.put("/profile/update")
def update_profile(data: UpdateProfileRequest):
    medical_profile_user.update_medical_profiles(
        data.user_id, data.blood_group, data.allergies
    )
    return {"message": "Profile updated successfully"}


# ─────────────────────────────────────────────
# SYMPTOM ANALYSIS
# ─────────────────────────────────────────────

@app.post("/analyze")
def analyze(data: SymptomRequest):
    risk = triagent.check_risk(data.symptoms)

    return {
        "risk_level": risk["risk_level"],
        "advice": risk["advice"],
    }


# ─────────────────────────────────────────────
# DOCTOR LIST
# ─────────────────────────────────────────────

@app.get("/doctors")
def doctors():
    location = doctorconnect.user_location()

    if not location:
        raise HTTPException(status_code=400, detail="Location not available")

    lat, lon = location
    doctors = doctorconnect.find_nearest_doctors(lat, lon)

    return {
        "doctors": [
            {
                "name": name,
                "specialty": specialty,
                "phone": phone,
                "distance_km": round(distance, 2),
            }
            for name, specialty, phone, distance in doctors
        ]
    }


# ─────────────────────────────────────────────
# AI CHAT
# ─────────────────────────────────────────────

@app.post("/chat")
def chat(data: ChatRequest):
    try:
        store_conversation.store_conversation(data.user_id, "user", data.message)

        response = agent.get_response(
            data.message,
            user_id=str(data.user_id),
        )

        store_conversation.store_conversation(
            data.user_id,
            "assistant",
            response,
        )

        return {"response": response}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
