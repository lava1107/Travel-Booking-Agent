import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_full_pipeline():
    print("Testing /api/health...")
    r = client.get("/api/health")
    assert r.status_code == 200, r.text
    assert r.json()["status"] == "ok"
    print(" Health OK")

    print("Testing NLP Search endpoint...")
    r = client.post("/api/nlp/search", json={"query": "Looking for a beach holiday in Goa under 25000"})
    assert r.status_code == 200, r.text
    if hasattr(sys.stdout, 'reconfigure'):
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    data = r.json()
    assert data["total_matches"] > 0
    assert "data" in data
    print(f" NLP Search returned {data['total_matches']} matches with intent {data['intent']}")

    print("Testing Chatbot endpoint...")
    r = client.post("/api/chat/message", json={"message": "I want to visit Goa with flights"})
    assert r.status_code == 200, r.text
    c_data = r.json()
    assert "reply" in c_data
    assert "intent" in c_data
    print(f" Chatbot OK: intent={c_data['intent']}")

    print("Testing Trips catalog...")
    r = client.get("/api/trips")
    assert r.status_code == 200, r.text
    trips = r.json()["data"]
    assert len(trips) >= 8
    print(f" Trips catalog returned {len(trips)} packages")

    print("Testing User Registration...")
    test_email = f"traveler_{int(__import__('time').time())}@test.com"
    r = client.post("/api/auth/register", json={
        "name": "Alex Traveler",
        "email": test_email,
        "password": "Password@123",
        "role": "customer"
    })
    assert r.status_code == 200, r.text
    auth_data = r.json()
    token = auth_data["accessToken"]
    assert token is not None
    print(" Registration OK")

    print("Testing User Login...")
    r = client.post("/api/auth/login", json={
        "email": test_email,
        "password": "Password@123"
    })
    assert r.status_code == 200, r.text
    login_token = r.json()["accessToken"]
    print(" Login OK")

    headers = {"Authorization": f"Bearer {login_token}"}

    print("Testing Auth /me...")
    r = client.get("/api/auth/me", headers=headers)
    assert r.status_code == 200, r.text
    assert r.json()["user"]["email"] == test_email
    print(" /auth/me OK")

    print("Testing Booking Creation...")
    r = client.post("/api/bookings", headers=headers, json={
        "tripId": 1,
        "travelDate": "2026-10-15",
        "travelersCount": 2,
        "travelerNames": ["Alex Traveler", "Jordan Traveler"],
        "specialRequests": "Ocean view room please",
        "paymentMethod": "Credit Card (Visa)"
    })
    assert r.status_code == 200, r.text
    booking_res = r.json()["data"]
    booking_id = booking_res["bookingId"]
    assert booking_id is not None
    print(f" Booking created: ID={booking_id}, Code={booking_res['bookingCode']}")

    print("Testing Customer Bookings list...")
    r = client.get("/api/bookings/my", headers=headers)
    assert r.status_code == 200, r.text
    my_bks = r.json()["data"]
    assert len(my_bks) >= 1
    print(f" Customer has {len(my_bks)} booking(s)")

    print("Testing Dashboard Stats...")
    r = client.get("/api/dashboard/stats", headers=headers)
    assert r.status_code == 200, r.text
    stats = r.json()["stats"]
    assert stats["totalBookings"] >= 1
    print(f" Dashboard Stats OK: totalBookings={stats['totalBookings']}")

    print("Testing AI Agent Chatbot Booking with NLP...")
    r = client.post("/api/chat/message", headers=headers, json={
        "message": "Book package 2 for 2 travelers on 2026-11-20"
    })
    assert r.status_code == 200, r.text
    chat_res = r.json()
    assert chat_res.get("booking_confirmed") is True
    assert "booking" in chat_res
    print(f" AI Agent Chatbot Booking OK: PNR={chat_res['booking']['booking_code']}")

    print("Testing Booking Cancellation...")
    r = client.put(f"/api/bookings/{booking_id}/cancel", headers=headers)
    assert r.status_code == 200, r.text
    print(" Booking cancellation OK")

    print("\nALL BACKEND API TESTS PASSED PERFECTLY!\n")

if __name__ == "__main__":
    test_full_pipeline()
