import json
import sys
import threading
import time
from datetime import date
from pathlib import Path

import httpx
import uvicorn
from supabase import create_client

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.append(str(ROOT))


def load_settings():
    from app.core.config import settings as cfg

    return cfg


settings = load_settings()

TEST_EMAIL = "askhat.ss23+test@gmail.com"
TEST_PASSWORD = "TestPass"
USER_ID = "b9b7165d-b7bc-48d4-95ec-9623829ca836"
PORT = 8104
BASE = f"http://127.0.0.1:{PORT}"
STATE_PATH = Path("qa_state.json")


def get_token():
    client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
    resp = client.auth.sign_in_with_password({"email": TEST_EMAIL, "password": TEST_PASSWORD})
    if not resp.session:
        raise RuntimeError("Sign in failed")
    return resp.session.access_token


def start_server():
    uvicorn.run("app.main:app", host="127.0.0.1", port=PORT, log_level="warning")


def main():
    token = get_token()
    headers = {"Authorization": f"Bearer {token}"}
    server_thread = threading.Thread(target=start_server, daemon=True)
    server_thread.start()
    time.sleep(3)
    client = httpx.Client(timeout=30)
    today = date.today()

    resp = client.post(
        f"{BASE}/coach/athletes/{USER_ID}/assigned-workouts",
        headers=headers,
        json={"title": "Self Assignment", "description": "Prep", "scheduled_date": str(today)},
    )
    print("self assignment", resp.status_code)
    assignment = resp.json()

    resp = client.post(
        f"{BASE}/coach/athletes/{USER_ID}/assigned-workouts",
        headers=headers,
        json={"title": "Self Assignment 2", "description": "Followup", "scheduled_date": str(today)},
    )
    print("self assignment 2", resp.status_code)
    assignment2 = resp.json()

    workout_payload = {
        "athlete_id": USER_ID,
        "assigned_workout_id": assignment["id"],
        "title": "Self Workout",
        "date": str(today),
        "notes": "Self notes",
        "metrics": {"duration_min": 30},
    }
    resp = client.post(f"{BASE}/workouts", headers=headers, json=workout_payload)
    print("self workout", resp.status_code)
    workout = resp.json()

    state = json.loads(STATE_PATH.read_text())
    state.setdefault("self_assignments", []).extend([assignment["id"], assignment2["id"]])
    state.setdefault("workout_ids", []).append(workout["id"])
    state["self_athlete_id"] = USER_ID
    STATE_PATH.write_text(json.dumps(state, indent=2))
    client.close()


if __name__ == "__main__":
    main()
