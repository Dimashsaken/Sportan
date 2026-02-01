import json
import sys
import threading
import time
from datetime import date, timedelta
from pathlib import Path

import httpx
import uvicorn

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
PORT = 8105
BASE = f"http://127.0.0.1:{PORT}"
STATE_PATH = Path("qa_state.json")


def get_token():
    auth_url = f"{settings.SUPABASE_URL}/auth/v1/token?grant_type=password"
    headers = {
        "apikey": settings.SUPABASE_KEY,
        "Content-Type": "application/json",
    }
    payload = {"email": TEST_EMAIL, "password": TEST_PASSWORD}
    resp = httpx.post(auth_url, headers=headers, json=payload, timeout=60)
    resp.raise_for_status()
    return resp.json()["access_token"]


def start_server():
    uvicorn.run("app.main:app", host="127.0.0.1", port=PORT, log_level="warning")


def log_step(name: str, response: httpx.Response):
    print(f"[{response.status_code}] {name}")
    try:
        print(response.json())
    except Exception:
        print(response.text)


def main():
    state = json.loads(STATE_PATH.read_text())
    group1_id = state["group1_id"]
    primary_id = state["athlete_primary_id"]
    self_id = state["self_athlete_id"]

    token = get_token()
    headers = {"Authorization": f"Bearer {token}"}

    server_thread = threading.Thread(target=start_server, daemon=True)
    server_thread.start()
    time.sleep(3)
    client = httpx.Client(timeout=45)

    resp = client.get(f"{BASE}/coach/athletes/{primary_id}/summary", headers=headers)
    log_step("GET summary after workouts", resp)

    resp = client.get(f"{BASE}/coach/athletes/{primary_id}/parent", headers=headers)
    log_step("GET athlete parent", resp)

    resp = client.get(f"{BASE}/coach/parents/{USER_ID}", headers=headers)
    log_step("GET coach parent record", resp)

    resp = client.put(
        f"{BASE}/coach/parents/{USER_ID}",
        headers=headers,
        json={"phone": "555-9999"},
    )
    log_step("PUT coach parent record", resp)

    today = date.today()
    resp = client.post(
        f"{BASE}/coach/groups/{group1_id}/assigned-workouts",
        headers=headers,
        json={"title": "Group Mixed", "description": "Both athletes", "scheduled_date": str(today + timedelta(days=2))},
    )
    log_step("POST group assignment w/ two athletes", resp)

    resp = client.get(f"{BASE}/coach/groups/{group1_id}/assigned-workouts", headers=headers)
    log_step("GET group assignments after multi fan-out", resp)

    resp = client.get(f"{BASE}/coach/athletes/{self_id}/assigned-workouts", headers=headers)
    log_step("GET self athlete assignments (coach view)", resp)

    resp = client.post(
        f"{BASE}/coach/groups/{state['group2_id']}/athletes",
        headers=headers,
        json={"full_name": "Temp Athlete", "dob": "2013-03-03", "notes": "temp"},
    )
    log_step("POST temp athlete", resp)
    temp_athlete = resp.json()["id"]

    resp = client.delete(f"{BASE}/coach/athletes/{temp_athlete}", headers=headers)
    log_step("DELETE temp athlete", resp)

    # Create extra workout to delete
    resp = client.post(
        f"{BASE}/coach/athletes/{primary_id}/assigned-workouts",
        headers=headers,
        json={"title": "Delete Me", "description": "test", "scheduled_date": str(today)},
    )
    log_step("POST assignment for deletion", resp)
    delete_assignment = resp.json()

    workout_payload = {
        "athlete_id": primary_id,
        "assigned_workout_id": delete_assignment["id"],
        "title": "Temp Workout",
        "date": str(today),
        "notes": "temp",
        "metrics": {"duration_min": 20},
    }
    resp = client.post(f"{BASE}/workouts", headers=headers, json=workout_payload)
    log_step("POST temp workout", resp)
    temp_workout = resp.json()

    resp = client.delete(f"{BASE}/workouts/{temp_workout['id']}", headers=headers)
    log_step("DELETE temp workout (should cascade)", resp)

    resp = client.get(f"{BASE}/coach/athletes/{primary_id}/assigned-workouts", headers=headers)
    log_step("GET athlete assignments after deletion", resp)

    client.close()


if __name__ == "__main__":
    main()
