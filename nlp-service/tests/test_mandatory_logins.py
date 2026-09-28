import urllib.request
import json

USERS_TO_TEST = [
    {"role": "admin", "email": "admin@lyantravel.com", "password": "123"},
    {"role": "agent", "email": "agent@lyantravel.com", "password": "123"},
    {"role": "agent", "email": "agent.rajesh@lyantravel.com", "password": "123"},
    {"role": "customer", "email": "user@lyantravel.com", "password": "123"},
    {"role": "customer", "email": "anand.chennai@gmail.com", "password": "123"},
    {"role": "customer", "email": "priya.coimbatore@gmail.com", "password": "123"}
]

def test_logins():
    print(f"Testing {len(USERS_TO_TEST)} distinct user logins...")
    success_count = 0
    for u in USERS_TO_TEST:
        payload = json.dumps({"identifier": u["email"], "password": u["password"]}).encode('utf-8')
        req = urllib.request.Request(
            "http://127.0.0.1:8000/api/auth/login",
            data=payload,
            headers={"Content-Type": "application/json"}
        )
        try:
            with urllib.request.urlopen(req) as resp:
                data = json.loads(resp.read().decode('utf-8'))
                assert "accessToken" in data, "Missing accessToken"
                user_info = data.get("user", {})
                assert user_info.get("email") == u["email"], f"Email mismatch: {user_info.get('email')} vs {u['email']}"
                print(f"  [PASS] Logged in: {u['email']} | Role: {user_info.get('role')} | Token length: {len(data['accessToken'])}")
                success_count += 1
        except Exception as e:
            print(f"  [FAIL] Login failed for {u['email']}: {e}")

    print(f"\nResult: {success_count}/{len(USERS_TO_TEST)} user logins successfully verified!")
    assert success_count == len(USERS_TO_TEST), "Not all logins passed!"

if __name__ == "__main__":
    test_logins()
