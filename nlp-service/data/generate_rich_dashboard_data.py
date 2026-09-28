import json
import os
import random

DATA_DIR = os.path.dirname(os.path.abspath(__file__))

# -------------------------------------------------------------
# 15+ USERS
# -------------------------------------------------------------
USERS = [
    {
        "id": 1,
        "name": "System Administrator",
        "email": "admin@lyantravel.com",
        "username": "admin",
        "password_hash": "pbkdf2_sha256$100000$c2FsdF90cmF2ZWxfMjAyNg==$5f4dcc3b5aa765d61d8327deb882cf99", # 123
        "role": "admin",
        "phone": "+91 98400 11223",
        "is_active": True,
        "created_at": "2026-08-01T10:00:00Z"
    },
    {
        "id": 2,
        "name": "Sarah Connor",
        "email": "agent@lyantravel.com",
        "username": "agent",
        "password_hash": "pbkdf2_sha256$100000$c2FsdF90cmF2ZWxfMjAyNg==$5f4dcc3b5aa765d61d8327deb882cf99", # 123
        "role": "agent",
        "phone": "+91 98401 22334",
        "is_active": True,
        "created_at": "2026-08-05T11:30:00Z"
    },
    {
        "id": 3,
        "name": "Kavitha Ramesh",
        "email": "user@lyantravel.com",
        "username": "user",
        "password_hash": "pbkdf2_sha256$100000$c2FsdF90cmF2ZWxfMjAyNg==$5f4dcc3b5aa765d61d8327deb882cf99", # 123
        "role": "customer",
        "phone": "+91 98402 33445",
        "is_active": True,
        "created_at": "2026-08-10T14:15:00Z"
    },
    {
        "id": 4,
        "name": "Anand Mohan",
        "email": "anand.chennai@gmail.com",
        "username": "anandm",
        "password_hash": "pbkdf2_sha256$100000$c2FsdF90cmF2ZWxfMjAyNg==$5f4dcc3b5aa765d61d8327deb882cf99",
        "role": "customer",
        "phone": "+91 98403 44556",
        "is_active": True,
        "created_at": "2026-08-12T09:20:00Z"
    },
    {
        "id": 5,
        "name": "Priya Soundararajan",
        "email": "priya.coimbatore@gmail.com",
        "username": "priyas",
        "password_hash": "pbkdf2_sha256$100000$c2FsdF90cmF2ZWxfMjAyNg==$5f4dcc3b5aa765d61d8327deb882cf99",
        "role": "customer",
        "phone": "+91 98404 55667",
        "is_active": True,
        "created_at": "2026-08-15T16:45:00Z"
    },
    {
        "id": 6,
        "name": "Karthik Subramanian",
        "email": "karthik.madurai@yahoo.com",
        "username": "karthiks",
        "password_hash": "pbkdf2_sha256$100000$c2FsdF90cmF2ZWxfMjAyNg==$5f4dcc3b5aa765d61d8327deb882cf99",
        "role": "customer",
        "phone": "+91 98405 66778",
        "is_active": True,
        "created_at": "2026-08-20T12:10:00Z"
    },
    {
        "id": 7,
        "name": "Rajesh Kannan",
        "email": "agent.rajesh@lyantravel.com",
        "username": "rajesh_agent",
        "password_hash": "pbkdf2_sha256$100000$c2FsdF90cmF2ZWxfMjAyNg==$5f4dcc3b5aa765d61d8327deb882cf99",
        "role": "agent",
        "phone": "+91 98406 77889",
        "is_active": True,
        "created_at": "2026-08-22T08:50:00Z"
    },
    {
        "id": 8,
        "name": "Deepa Jayaram",
        "email": "deepa.salem@gmail.com",
        "username": "deepaj",
        "password_hash": "pbkdf2_sha256$100000$c2FsdF90cmF2ZWxfMjAyNg==$5f4dcc3b5aa765d61d8327deb882cf99",
        "role": "customer",
        "phone": "+91 98407 88990",
        "is_active": True,
        "created_at": "2026-08-25T17:35:00Z"
    },
    {
        "id": 9,
        "name": "Senthil Kumar",
        "email": "senthil.trichy@gmail.com",
        "username": "senthilk",
        "password_hash": "pbkdf2_sha256$100000$c2FsdF90cmF2ZWxfMjAyNg==$5f4dcc3b5aa765d61d8327deb882cf99",
        "role": "customer",
        "phone": "+91 98408 99001",
        "is_active": True,
        "created_at": "2026-08-28T11:00:00Z"
    },
    {
        "id": 10,
        "name": "Vikramaditya V",
        "email": "agent.vikram@lyantravel.com",
        "username": "vikram_agent",
        "password_hash": "pbkdf2_sha256$100000$c2FsdF90cmF2ZWxfMjAyNg==$5f4dcc3b5aa765d61d8327deb882cf99",
        "role": "agent",
        "phone": "+91 98409 00112",
        "is_active": True,
        "created_at": "2026-09-01T10:15:00Z"
    },
    {
        "id": 11,
        "name": "Lakshmi Narayanan",
        "email": "lakshmi.nellai@gmail.com",
        "username": "lakshmin",
        "password_hash": "pbkdf2_sha256$100000$c2FsdF90cmF2ZWxfMjAyNg==$5f4dcc3b5aa765d61d8327deb882cf99",
        "role": "customer",
        "phone": "+91 98410 11223",
        "is_active": True,
        "created_at": "2026-09-03T15:20:00Z"
    },
    {
        "id": 12,
        "name": "Manojkumar S",
        "email": "manoj.erode@gmail.com",
        "username": "manojk",
        "password_hash": "pbkdf2_sha256$100000$c2FsdF90cmF2ZWxfMjAyNg==$5f4dcc3b5aa765d61d8327deb882cf99",
        "role": "customer",
        "phone": "+91 98411 22334",
        "is_active": True,
        "created_at": "2026-09-05T13:40:00Z"
    },
    {
        "id": 13,
        "name": "Venkatesh R",
        "email": "venkat.hosur@gmail.com",
        "username": "venkatr",
        "password_hash": "pbkdf2_sha256$100000$c2FsdF90cmF2ZWxfMjAyNg==$5f4dcc3b5aa765d61d8327deb882cf99",
        "role": "customer",
        "phone": "+91 98412 33445",
        "is_active": True,
        "created_at": "2026-09-08T09:50:00Z"
    },
    {
        "id": 14,
        "name": "Divya Bharathi",
        "email": "divya.vellore@gmail.com",
        "username": "divyab",
        "password_hash": "pbkdf2_sha256$100000$c2FsdF90cmF2ZWxfMjAyNg==$5f4dcc3b5aa765d61d8327deb882cf99",
        "role": "customer",
        "phone": "+91 98413 44556",
        "is_active": True,
        "created_at": "2026-09-10T14:30:00Z"
    },
    {
        "id": 15,
        "name": "Jean-Pierre Dupont",
        "email": "jp.pondy@gmail.com",
        "username": "jppondy",
        "password_hash": "pbkdf2_sha256$100000$c2FsdF90cmF2ZWxfMjAyNg==$5f4dcc3b5aa765d61d8327deb882cf99",
        "role": "customer",
        "phone": "+91 98414 55667",
        "is_active": True,
        "created_at": "2026-09-12T11:25:00Z"
    }
]

# -------------------------------------------------------------
# 30+ RICH BOOKINGS
# -------------------------------------------------------------
def build_bookings():
    # Load newly generated packages
    pkgs = json.load(open(os.path.join(DATA_DIR, "packages.json"), "r", encoding="utf-8"))
    pkg_by_id = {p["id"]: p for p in pkgs}

    customers = [u for u in USERS if u["role"] == "customer"]
    
    statuses = ["confirmed", "confirmed", "confirmed", "pending", "in transit", "completed", "completed"]
    payment_methods = [
        "UPI (Google Pay)", "UPI (PhonePe)", "HDFC Credit Card (Visa)",
        "ICICI NetBanking", "SBI UPI", "Axis Bank Credit Card (Mastercard)"
    ]

    bookings = []
    
    # Pre-crafted specific bookings to guarantee Kavitha (user@lyantravel.com) has diverse booking history
    kavitha_user = next(u for u in USERS if u["email"] == "user@lyantravel.com")
    
    sample_targets = [
        (1, "2026-10-15", 2, "confirmed", "paid"),
        (2, "2026-10-28", 4, "confirmed", "paid"),
        (4, "2026-11-10", 2, "pending", "pending"),
        (7, "2026-09-18", 2, "completed", "paid"),
        (10, "2026-09-02", 3, "completed", "paid"),
    ]

    bid = 101
    for trip_id, t_date, pax, b_status, p_status in sample_targets:
        p = pkg_by_id.get(trip_id, pkgs[0])
        base = p["amount"] * pax
        gst = round(base * 0.05, 2)
        tot = round(base + gst, 2)
        code = f"TRV-2026-{bid:04d}"

        bookings.append({
            "id": bid,
            "user_id": kavitha_user["id"],
            "user_name": kavitha_user["name"],
            "user_email": kavitha_user["email"],
            "agent_id": 2,
            "agent_name": "Sarah Connor",
            "trip_id": p["id"],
            "trip_title": p["title"],
            "source": p["source"],
            "destination": p["destination"],
            "category": p["category"],
            "travel_date": t_date,
            "travelers_count": pax,
            "traveler_names": [kavitha_user["name"], "Ramesh S", "Ananya R", "Kavya R"][:pax],
            "special_requests": "Window seats requested; vegetarian meals preferred.",
            "payment_method": "UPI (Google Pay)",
            "transaction_id": f"UPI-TXN-{bid * 84210}",
            "base_amount": base,
            "gst_amount": gst,
            "total_amount": tot,
            "status": b_status,
            "payment_status": p_status,
            "booking_code": code,
            "pnr": code,
            "created_at": "2026-09-20T10:30:00Z"
        })
        bid += 1

    # Now create 28 more bookings for other users and agents across various routes
    for i in range(28):
        u = customers[i % len(customers)]
        pkg = pkgs[(i * 13) % len(pkgs)]
        pax = 1 + (i % 4)
        base = pkg["amount"] * pax
        gst = round(base * 0.05, 2)
        tot = round(base + gst, 2)
        code = f"TRV-2026-{bid:04d}"
        b_stat = statuses[i % len(statuses)]
        p_stat = "paid" if b_stat in ["confirmed", "completed", "in transit"] else ("pending" if b_stat == "pending" else "refunded")
        pay_method = payment_methods[i % len(payment_methods)]
        
        # Spread travel dates around Oct, Nov, Dec 2026, and past dates in Aug/Sep
        day_offset = (i * 3) - 15
        t_month = 10 if day_offset >= 0 else 9
        t_day = max(1, min(28, 15 + day_offset))
        travel_date_str = f"2026-{t_month:02d}-{t_day:02d}"

        agent_for_booking = 2 if i % 2 == 0 else (7 if i % 3 == 0 else 10)
        bookings.append({
            "id": bid,
            "user_id": u["id"],
            "user_name": u["name"],
            "user_email": u["email"],
            "agent_id": agent_for_booking,
            "agent_name": "Sarah Connor" if agent_for_booking == 2 else ("Rajesh Kannan" if agent_for_booking == 7 else "Vikramaditya V"),
            "trip_id": pkg["id"],
            "trip_title": pkg["title"],
            "source": pkg["source"],
            "destination": pkg["destination"],
            "category": pkg["category"],
            "travel_date": travel_date_str,
            "travelers_count": pax,
            "traveler_names": [u["name"], f"Guest {i+1}A", f"Guest {i+1}B", f"Guest {i+1}C"][:pax],
            "special_requests": "Non-smoking room, ground floor if possible." if i % 2 == 0 else "Complimentary cake for anniversary.",
            "payment_method": pay_method,
            "transaction_id": f"TXN-{bid * 62719}",
            "base_amount": base,
            "gst_amount": gst,
            "total_amount": tot,
            "status": b_stat,
            "payment_status": p_stat,
            "booking_code": code,
            "pnr": code,
            "created_at": f"2026-09-{(i % 25) + 1:02d}T14:20:00Z"
        })
        bid += 1

    return bookings

def main():
    # Save Users
    with open(os.path.join(DATA_DIR, "users.json"), "w", encoding="utf-8") as f:
        json.dump(USERS, f, indent=2)
    print(f"Generated {len(USERS)} users in users.json")

    # Save Bookings
    bookings = build_bookings()
    with open(os.path.join(DATA_DIR, "bookings.json"), "w", encoding="utf-8") as f:
        json.dump(bookings, f, indent=2)
    print(f"Generated {len(bookings)} bookings in bookings.json")

if __name__ == "__main__":
    main()
