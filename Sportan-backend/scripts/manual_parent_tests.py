import sys
import threading
import time
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
PORT = 8107
BASE = f"http://127.0.0.1:{PORT}"


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
    token = get_token()
    headers = {"Authorization": f"Bearer {token}"}

    server_thread = threading.Thread(target=start_server, daemon=True)
    server_thread.start()
    time.sleep(3)
    client = httpx.Client(timeout=30)

    resp = client.get(f"{BASE}/parent/me", headers=headers)
    log_step("GET /parent/me", resp)

    resp = client.get(f"{BASE}/parent/athlete", headers=headers)
    log_step("GET /parent/athlete", resp)

    resp = client.get(f"{BASE}/parent/athlete/summary", headers=headers)
    log_step("GET /parent/athlete/summary", resp)

    resp = client.get(f"{BASE}/parent/athlete/workouts", headers=headers)
    log_step("GET /parent/athlete/workouts", resp)

    resp = client.get(f"{BASE}/parent/athlete/assigned-workouts", headers=headers)
    log_step("GET /parent/athlete/assigned-workouts", resp)

    resp = client.get(f"{BASE}/parent/athlete/ai/talent-recognition", headers=headers)
    log_step("GET /parent/athlete/ai/talent-recognition", resp)

    resp = client.get(f"{BASE}/parent/athlete/ai/weekly-insights", headers=headers)
    log_step("GET /parent/athlete/ai/weekly-insights", resp)

    client.close()


if __name__ == "__main__":
    main()
