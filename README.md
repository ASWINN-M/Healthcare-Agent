# AgenticHealthAI

A lightweight healthcare assistant built with FastAPI, MySQL, and a React‑style single page frontend. It provides symptom triage, AI‑driven clinical insights (via an MCP server and GROQ LLM), user account management, medical profiles, conversation history, and nearby doctor lookup.

## Key Components

- **Backend** (`backend/`)
  - FastAPI server (`app/main.py`) exposing endpoints for signup, login, triage, chat, history, profile updates and doctor search.
  - Database helpers for MySQL (`app/database.py`) and initialization script (`init_db.py`).
  - User management (`users.py`, `medical_profile_user.py`).
  - Risk assessor (`triagent.py`) with simple keyword logic.
  - Conversation logging (`store_conversation.py`).
  - Doctor locator (`doctorconnect.py`) using geolocation + haversine formula.
  - CLI client (`app/cli.py`) for terminal usage.
  - Agent integration (`app/agents/agent.py`) that calls an external MCP server and GROQ model for literature retrieval and clinical summarization.

- **Frontend** (`frontend/`)
  - Single‑page interface (`index.html`, `app.js`, `style.css`) built with TailwindCSS.
  - Login/signup, triage form, emergency tips, chat popup, history/profile popups, PubMed trending research, WHO headlines.
  - Communicates with backend REST API.

- **Infrastructure**
  - `requirements.txt` lists Python dependencies.
  - Environment variables are managed via `.env` files (GROQ API key, database credentials).

## Features

1. **User Authentication** – register/login with hashed passwords.
2. **Medical Profile** – blood group and allergies stored per user.
3. **Symptom Triage** – simple rule‑based risk categorization with advice.
4. **AI Medical Agent** – fetches PUBMED literature via MCP and returns clinical insights.
5. **Conversation History** – stores user and agent messages in MySQL.
6. **Nearby Doctors** – geocoding and distance calculation to list local practitioners.
7. **CLI Mode** – a command‑line interface for all core flows.
8. **Frontend Dashboard** – responsive, interactive UI with emergency tips and research highlights.

## Getting Started

1. **Clone repository**
   ```bash
   git clone <repo-url> && cd Healthcare-Agent
   ```

2. **Environment**
   - Copy `.env.example` to `backend/.env` and fill in `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_PORT`, `GROQ_API_KEY`.
   - Ensure MySQL is running or use Docker (see below).

3. **Install dependencies**
   ```bash
   python -m venv venv
   .\venv\Scripts\activate   # Windows
   pip install -r requirements.txt
   ```

4. **Initialize databases**
   ```bash
   python backend/init_db.py
   ```

5. **Run backend**
   ```bash
   uvicorn backend.app.main:app --reload
   ```

6. **Open frontend**
   - Serve `frontend/index.html` with any static server or open directly in browser.
   - The JS assumes API at `http://127.0.0.1:8000`.

7. **Use CLI** (optional)
   ```bash
   python backend/app/cli.py
   ```

8. **Docker (alternative)**
   ```bash
   docker-compose up --build
   ```
   - Backend will be available on port `8000`.
   - Access the frontend by opening `frontend/index.html` locally.

## Notes

- The AI agent requires a working MCP server configured in `config_mcp.json` and a valid GROQ API key.
- The triage logic is rudimentary; real deployments should use clinical models.
- Passwords are hashed with `bcrypt`.
- The frontend caches session data for 15 minutes.

## Future Improvements

- Add user password reset / verification flows.
- Improve triage with natural‑language model or medical ontology.
- Replace in‑memory checkpointer with persistent storage.
- Containerize frontend or integrate with backend.
- Add unit/integration tests.

---

**AgenticHealthAI** is designed as a proof‑of‑concept for combining rule‑based triage, conversational AI and public medical literature in a user‑friendly interface.

*Last updated: February 27, 2026.*
[Vide Link]([https://www.youtube.com/watch?v=VIDEO_ID](https://youtu.be/4o7cJWZO-4w?si=hdGpHERsBffFPGDz))

