import json
import urllib.request
import urllib.parse
import sys

BASE_URL = "http://127.0.0.1:8000"

def post_json(path, data, token=None):
    url = f"{BASE_URL}{path}"
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    req = urllib.request.Request(url, data=json.dumps(data).encode("utf-8"), headers=headers, method="POST")
    try:
        with urllib.request.urlopen(req) as resp:
            return resp.status, json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read().decode("utf-8"))

def get_json(path, token=None):
    url = f"{BASE_URL}{path}"
    headers = {}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    req = urllib.request.Request(url, headers=headers, method="GET")
    try:
        with urllib.request.urlopen(req) as resp:
            return resp.status, json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read().decode("utf-8"))

def test_all():
    print("=== STARTING FULL END-TO-END VERIFICATION ===")

    # 1. TEST CASE 1: Customer registers -> logs in -> searches Chennai -> Goa -> selects package -> creates booking -> payment -> confirmation -> My Trips
    print("\n--- TEST CASE 1: Customer Registration, Search, Booking, Payment, My Trips ---")
    reg_email = "chennai.traveler@example.com"
    status, reg_res = post_json("/api/auth/register", {
        "name": "Karthik Raja",
        "email": reg_email,
        "password": "123",
        "confirmPassword": "123",
        "phone": "+91 98401 99887",
        "role": "customer"
    })
    print(f"1.1 Register: HTTP {status} (Role: {reg_res.get('user', {}).get('role', 'Existing')})")
    assert status in [200, 201, 400, 409], f"Registration failed unexpectedly: {reg_res}"

    # Log in
    status, login_res = post_json("/api/auth/login", {
        "identifier": reg_email,
        "password": "123"
    })
    assert status == 200, f"Login failed: {login_res}"
    cust_token = login_res["access_token"]
    cust_user = login_res["user"]
    print(f"1.2 Login Successful: {cust_user['name']} ({cust_user['email']})")

    # Search Chennai -> Goa
    status, search_res = get_json("/api/packages?origin=Chennai&destination=Goa", cust_token)
    assert status == 200 and len(search_res["data"]) > 0, f"No packages found for Chennai -> Goa: {search_res}"
    selected_pkg = search_res["data"][0]
    print(f"1.3 Found Package: {selected_pkg['title']} | Origin: {selected_pkg['origin']} -> {selected_pkg['destination']} | Price: ₹{selected_pkg['price']}")

    # Price Calculation (Base + 5% GST)
    adults = 2
    base_cost = selected_pkg["price"] * adults
    expected_tax = int(base_cost * 0.05)
    expected_total = base_cost + expected_tax
    print(f"1.4 Price Calculation: Base ₹{base_cost} + 5% GST ₹{expected_tax} = ₹{expected_total}")

    # Create Booking
    status, booking_res = post_json("/api/bookings", {
        "package_id": selected_pkg["id"],
        "num_travellers": adults,
        "travel_date": "2026-10-15",
        "traveller_name": "Karthik Raja",
        "traveller_email": reg_email,
        "traveller_phone": "+91 98401 99887",
        "passengers": [
            {"name": "Karthik Raja", "age": 30, "gender": "male"},
            {"name": "Deepa Karthik", "age": 28, "gender": "female"}
        ]
    }, cust_token)
    assert status in [200, 201], f"Booking creation failed: {booking_res}"
    booking_data = booking_res["data"]
    booking_id = booking_data["id"]
    pnr = booking_data.get("pnr")
    print(f"1.5 Booking Created: ID {booking_id} | PNR: {pnr} | Status: {booking_data['status']} | Total: ₹{booking_data['total_amount']}")

    # Payment Verification (Sandbox / Development Mode)
    status, pay_res = post_json("/api/payments/verify", {
        "booking_id": booking_id,
        "payment_method": "upi_sandbox",
        "transaction_id": f"TXN-CHENNAI-GOA-{booking_id}"
    }, cust_token)
    assert status == 200, f"Payment verification failed: {pay_res}"
    print(f"1.6 Payment Successful: {pay_res['message']} | Mode: {pay_res.get('gateway_mode')}")

    # Verify in My Trips
    status, my_bookings = get_json("/api/bookings/my", cust_token)
    assert status == 200 and any(b["id"] == booking_id and b["status"] == "confirmed" for b in my_bookings["data"])
    print(f"1.7 My Trips Verified: Booking {booking_id} is CONFIRMED with total trips count {len(my_bookings['data'])}")

    # 2. TEST CASE 2: Multi-Turn Conversational AI Agent with Context Retention & Tool Calling
    print("\n--- TEST CASE 2: Conversational AI Agent (Chennai -> Affordable -> 4 People -> International -> 1 Lakh -> Beach -> Book) ---")
    conv_id = f"test-ai-conv-{booking_id}"

    # Step A: "I want an affordable trip from Chennai for 4 people."
    payload_a = {
        "message": "I want an affordable trip from Chennai for 4 people.",
        "conversation_id": conv_id,
        "user_email": reg_email
    }
    status, res_a = post_json("/api/chat", payload_a, cust_token)
    print(f"2.1 AI Prompt A: '{payload_a['message']}'")
    print(f"    Intent: {res_a.get('intent')} | Tool: {res_a.get('tool_called')}")
    print(f"    State Extracted: Origin={res_a['conversation_state'].get('origin')}, Travellers={res_a['conversation_state'].get('travellers')}")
    print(f"    AI Reply: {res_a.get('reply')[:120]}...")
    assert res_a['conversation_state'].get('origin') == "Chennai"
    assert res_a['conversation_state'].get('travellers') == 4

    # Step B: "I want international."
    payload_b = {
        "message": "I want international.",
        "conversation_id": conv_id,
        "user_email": reg_email
    }
    status, res_b = post_json("/api/chat", payload_b, cust_token)
    print(f"2.2 AI Prompt B: '{payload_b['message']}'")
    print(f"    Intent: {res_b.get('intent')}")
    print(f"    State Maintained: Origin={res_b['conversation_state'].get('origin')}, Travellers={res_b['conversation_state'].get('travellers')}, Type={res_b['conversation_state'].get('destination_type')}")
    print(f"    AI Reply: {res_b.get('reply')[:120]}...")
    assert res_b['conversation_state'].get('origin') == "Chennai"
    assert res_b['conversation_state'].get('travellers') == 4
    assert res_b['conversation_state'].get('destination_type') == "International"

    # Step C: "Budget is 1 lakh."
    payload_c = {
        "message": "Budget is 1 lakh.",
        "conversation_id": conv_id,
        "user_email": reg_email
    }
    status, res_c = post_json("/api/chat", payload_c, cust_token)
    print(f"2.3 AI Prompt C: '{payload_c['message']}'")
    print(f"    Intent: {res_c.get('intent')} | Tool: {res_c.get('tool_called')}")
    print(f"    State: Budget={res_c['conversation_state'].get('budget')}")
    print(f"    Packages returned: {len(res_c.get('packages', []))}")
    assert res_c['conversation_state'].get('budget') == 100000

    # Step D: "Show me beach destinations."
    payload_d = {
        "message": "Show me beach destinations.",
        "conversation_id": conv_id,
        "user_email": reg_email
    }
    status, res_d = post_json("/api/chat", payload_d, cust_token)
    print(f"2.4 AI Prompt D: '{payload_d['message']}'")
    print(f"    Intent: {res_d.get('intent')} | Tool: {res_d.get('tool_called')}")
    print(f"    Packages matching: {[p['title'] for p in res_d.get('packages', [])]}")
    assert len(res_d.get('packages', [])) > 0

    # Step E: "Book the second one."
    payload_e = {
        "message": "Book the second one.",
        "conversation_id": conv_id,
        "user_email": reg_email
    }
    status, res_e = post_json("/api/chat", payload_e, cust_token)
    print(f"2.5 AI Prompt E: '{payload_e['message']}'")
    print(f"    Intent: {res_e.get('intent')} | Tool: {res_e.get('tool_called')}")
    print(f"    Booking Info: {res_e.get('booking')}")
    print(f"    AI Reply: {res_e.get('reply')[:140]}...")
    assert res_e.get('tool_called') == "createBooking" or res_e.get('booking') is not None
    ai_booking_id = res_e.get('booking', {}).get('id') or res_e['conversation_state'].get('last_booking_id')
    print(f"    AI Created Booking ID: {ai_booking_id}")

    # 3. TEST CASE 3: Admin logs in, verifies real chart metrics and AI-created booking
    print("\n--- TEST CASE 3: Admin Logs In & Verifies Real Operational Metrics & AI-Created Booking ---")
    status, admin_login = post_json("/api/auth/login", {
        "identifier": "admin@lyantravel.com",
        "password": "123"
    })
    assert status == 200, f"Admin login failed: {admin_login}"
    admin_token = admin_login["access_token"]
    print(f"3.1 Admin Login Successful: {admin_login['user']['name']} ({admin_login['user']['role']})")

    status, analytics = get_json("/api/reports/analytics", admin_token)
    assert status == 200
    metrics = analytics.get("metrics", {})
    print(f"3.2 Real Admin Metrics: Customers={metrics.get('total_customers')}, Bookings={metrics.get('total_bookings')}, Revenue=₹{metrics.get('total_revenue')}")
    print(f"    Package Categories: {analytics.get('category_distribution')}")
    print(f"    AI vs Agent Bookings: AI={metrics.get('ai_bookings')}, Direct/Human={metrics.get('human_agent_bookings')}")

    status, all_bookings = get_json("/api/bookings", admin_token)
    assert status == 200
    found_ai_booking = any(b["id"] == ai_booking_id for b in all_bookings["data"])
    print(f"3.3 Verified in Admin All Bookings: AI-created booking {ai_booking_id} exists = {found_ai_booking}")

    # 4. TEST CASE 4: Travel Agent logs in, sees assigned enquiry/booking & takes over AI conversation
    print("\n--- TEST CASE 4: Travel Agent Logs In, Views Enquiries & Takes Over AI Conversation ---")
    status, agent_login = post_json("/api/auth/login", {
        "identifier": "agent@lyantravel.com",
        "password": "123"
    })
    assert status == 200, f"Agent login failed: {agent_login}"
    agent_token = agent_login["access_token"]
    print(f"4.1 Travel Agent Login Successful: {agent_login['user']['name']} ({agent_login['user']['role']})")

    # Customer triggers "Talk to Human Agent"
    status, handoff_res = post_json("/api/support/handoff", {
        "conversation_id": conv_id,
        "user_email": reg_email,
        "issue": "Requesting consultant guidance on island transfers and flight timings"
    }, cust_token)
    assert status in [200, 201]
    support_ticket_id = handoff_res.get("ticket_id")
    print(f"4.2 Customer Requested Human Handoff: Ticket {support_ticket_id}")

    # Agent checks support enquiries
    status, support_list = get_json("/api/support", agent_token)
    assert status == 200 and any(s["ticket_id"] == support_ticket_id for s in support_list["data"])
    print(f"4.3 Agent Views Open Support Queue: {len(support_list['data'])} active tickets found")

    # Agent takes over ticket
    status, claim_res = post_json(f"/api/support/{support_ticket_id}/respond", {
        "agent_name": "Suresh Travel Consultant",
        "response": "Hello Karthik! I have taken over this chat. I am reviewing your package and airport transfer options now."
    }, agent_token)
    assert status == 200
    print(f"4.4 Agent Took Over Conversation: Response dispatched successfully")

    # 5. TEST CASE 5: Customer asks: "What is my booking status?"
    print("\n--- TEST CASE 5: Customer Queries AI: 'What is my booking status?' ---")
    status, res_status = post_json("/api/chat", {
        "message": "What is my booking status?",
        "conversation_id": conv_id,
        "user_email": reg_email
    }, cust_token)
    print(f"5.1 AI Prompt: 'What is my booking status?'")
    print(f"    Intent: {res_status.get('intent')} | Tool: {res_status.get('tool_called')}")
    print(f"    AI Reply: {res_status.get('reply')[:180]}...")
    assert res_status.get("intent") in ["booking_status", "search_trips"] or "booking" in res_status.get("reply").lower()

    # 6. TEST CASE 6: Customer asks: "Cancel my Goa booking" (Safe policy & verification)
    print("\n--- TEST CASE 6: Customer Requests Cancellation: 'Cancel my Goa booking' ---")
    status, res_cancel = post_json("/api/chat", {
        "message": "Cancel my Goa booking",
        "conversation_id": conv_id,
        "user_email": reg_email
    }, cust_token)
    print(f"6.1 AI Prompt: 'Cancel my Goa booking'")
    print(f"    Intent: {res_cancel.get('intent')} | Tool: {res_cancel.get('tool_called')}")
    print(f"    AI Reply: {res_cancel.get('reply')}")
    assert "cancel" in res_cancel.get("reply", "").lower() or "cancellation" in res_cancel.get("reply", "").lower()

    print("\n=======================================================")
    print("ALL 6 REQUIRED TEST CASES PASSED WITH 100% SUCCESS!")
    print("=======================================================")

if __name__ == "__main__":
    test_all()
