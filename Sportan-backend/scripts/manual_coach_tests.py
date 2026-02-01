import json
import sys
import threading
import time
from datetime import date, timedelta
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
PORT = 8103
BASE = f"http://127.0.0.1:{PORT}"
STATE_PATH = Path("qa_state.json")


def get_token():
    supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
    resp = supabase.auth.sign_in_with_password({"email": TEST_EMAIL, "password": TEST_PASSWORD})
    if not resp.session:
        raise RuntimeError("Sign in failed")
    return resp.session.access_token


def start_server():
    uvicorn.run("app.main:app", host="127.0.0.1", port=PORT, log_level="warning")


def log_step(name: str, response: httpx.Response):
    print(f"[{response.status_code}] {name}")
    try:
        print(response.json())
    except Exception:
        print(response.text)


def main():
    token = get_token()
    headers = {"Authorization": f"Bearer {token}"}
    server_thread = threading.Thread(target=start_server, daemon=True)
    server_thread.start()
    time.sleep(3)
    client = httpx.Client(timeout=45)
    state: dict[str, object] = {}

    resp = client.get(f"{BASE}/coach/me", headers=headers)
    log_step("GET /coach/me", resp)

    resp = client.post(
        f"{BASE}/coach/groups",
        headers=headers,
        json={"name": "QA Group 1", "description": "Primary group"},
    )
    log_step("POST /coach/groups", resp)
    group1 = resp.json()
    state["group1_id"] = group1["id"]

    resp = client.post(
        f"{BASE}/coach/groups",
        headers=headers,
        json={"name": "QA Group 2", "description": "Secondary group"},
    )
    log_step("POST /coach/groups (2)", resp)
    group2 = resp.json()
    state["group2_id"] = group2["id"]

    resp = client.get(f"{BASE}/coach/groups", headers=headers)
    log_step("GET /coach/groups", resp)

    resp = client.get(f"{BASE}/coach/groups/{group1['id']}", headers=headers)
    log_step("GET /coach/groups/{group1}", resp)

    resp = client.put(
        f"{BASE}/coach/groups/{group1['id']}",
        headers=headers,
        json={"name": "QA Group 1", "description": "Updated description"},
    )
    log_step("PUT /coach/groups/{group1}", resp)

    resp = client.get(f"{BASE}/coach/groups/{group1['id']}/athletes", headers=headers)
    log_step("GET /coach/groups/{group1}/athletes (empty)", resp)

    resp = client.post(
        f"{BASE}/coach/groups/{group1['id']}/athletes",
        headers=headers,
        json={"full_name": "Primary Athlete", "dob": "2012-05-01", "notes": "Created via QA"},
    )
    log_step("POST /coach/groups/{group1}/athletes", resp)
    athlete_primary = resp.json()
    state["athlete_primary_id"] = athlete_primary["id"]

    resp = client.get(f"{BASE}/coach/groups/{group1['id']}/athletes", headers=headers)
    log_step("GET /coach/groups/{group1}/athletes", resp)

    resp = client.post(
        f"{BASE}/coach/groups/{group2['id']}/athletes/{athlete_primary['id']}",
        headers=headers,
    )
    log_step("POST existing athlete into group2", resp)

    resp = client.get(f"{BASE}/coach/groups/{group2['id']}/athletes", headers=headers)
    log_step("GET /coach/groups/{group2}/athletes", resp)

    resp = client.delete(
        f"{BASE}/coach/groups/{group2['id']}/athletes/{athlete_primary['id']}",
        headers=headers,
    )
    log_step("DELETE membership from group2", resp)

    resp = client.delete(
        f"{BASE}/coach/groups/{group1['id']}/athletes/{athlete_primary['id']}",
        headers=headers,
    )
    log_step("DELETE membership from group1 (expected 400)", resp)

    resp = client.get(f"{BASE}/coach/athletes/{athlete_primary['id']}", headers=headers)
    log_step("GET /coach/athletes/{athlete}", resp)

    resp = client.put(
        f"{BASE}/coach/athletes/{athlete_primary['id']}",
        headers=headers,
        json={"notes": "Updated notes"},
    )
    log_step("PUT /coach/athletes/{athlete}", resp)

    resp = client.get(
        f"{BASE}/coach/athletes/{athlete_primary['id']}/summary",
        headers=headers,
    )
    log_step("GET /coach/athletes/{athlete}/summary (pre-workouts)", resp)

    today = date.today()
    resp = client.post(
        f"{BASE}/coach/groups/{group1['id']}/assigned-workouts",
        headers=headers,
        json={
            "title": "Group Run",
            "description": "Tempo",
            "scheduled_date": str(today + timedelta(days=1)),
        },
    )
    log_step("POST group assigned workouts", resp)
    group_assignments = resp.json()
    state["group_assignment_ids"] = [item["id"] for item in group_assignments]

    resp = client.post(
        f"{BASE}/coach/athletes/{athlete_primary['id']}/assigned-workouts",
        headers=headers,
        json={
            "title": "Solo Drills",
            "description": "Footwork",
            "scheduled_date": str(today),
        },
    )
    log_step("POST athlete assigned workout", resp)
    athlete_assignment = resp.json()
    state.setdefault("athlete_assignments", []).append(athlete_assignment["id"])

    resp = client.get(f"{BASE}/coach/groups/{group1['id']}/assigned-workouts", headers=headers)
    log_step("GET group assigned workouts", resp)

    resp = client.get(
        f"{BASE}/coach/athletes/{athlete_primary['id']}/assigned-workouts",
        headers=headers,
    )
    log_step("GET athlete assigned workouts (coach view)", resp)

    resp = client.patch(
        f"{BASE}/coach/assigned-workouts/{athlete_assignment['id']}",
        headers=headers,
        json={"status": "completed"},
    )
    log_step("PATCH assigned workout status", resp)

    workout_payload = {
        "athlete_id": athlete_primary["id"],
        "assigned_workout_id": athlete_assignment["id"],
        "title": "Solo Drills",
        "date": str(today),
        "notes": "Looked good",
        "metrics": {"duration_min": 45},
    }
    resp = client.post(f"{BASE}/workouts", headers=headers, json=workout_payload)
    log_step("POST /workouts", resp)
    workout = resp.json()
    state.setdefault("workout_ids", []).append(workout["id"])

    resp = client.get(f"{BASE}/workouts/{workout['id']}", headers=headers)
    log_step("GET /workouts/{id}", resp)

    resp = client.put(
        f"{BASE}/workouts/{workout['id']}",
        headers=headers,
        json={"notes": "Updated notes", "metrics": {"duration_min": 50}},
    )
    log_step("PUT /workouts/{id}", resp)

    resp = client.post(
        f"{BASE}/coach/athletes/{athlete_primary['id']}/ai/talent-recognition",
        headers=headers,
    )
    log_step("POST talent recognition", resp)
    state["talent_report_id"] = resp.json()["id"]

    resp = client.get(
        f"{BASE}/coach/athletes/{athlete_primary['id']}/ai/talent-recognition",
        headers=headers,
    )
    log_step("GET talent recognition", resp)

    resp = client.post(
        f"{BASE}/coach/athletes/{athlete_primary['id']}/ai/weekly-insights",
        headers=headers,
    )
    log_step("POST weekly insights", resp)
    state["weekly_report_id"] = resp.json()["id"]

    resp = client.get(
        f"{BASE}/coach/athletes/{athlete_primary['id']}/ai/weekly-insights",
        headers=headers,
    )
    log_step("GET weekly insights", resp)

    resp = client.post(
        f"{BASE}/coach/parents",
        headers=headers,
        json={
            "full_name": "Parent One",
            "email": "parent1@example.com",
            "athlete_id": athlete_primary["id"],
        },
    )
    log_step("POST /coach/parents", resp)

    resp = client.post(
        f"{BASE}/system/update-statuses",
        headers={"X-System-Token": settings.SYSTEM_CRON_TOKEN},
    )
    log_step("POST /system/update-statuses", resp)

    STATE_PATH.write_text(json.dumps(state, indent=2))
    client.close()
    print("State saved to qa_state.json")


if __name__ == "__main__":
    main()
