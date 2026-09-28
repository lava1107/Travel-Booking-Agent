import os
import json
import time
import random
from typing import List, Dict, Any, Optional
from app.travel_catalog import travel_catalog

DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "data")
os.makedirs(DATA_DIR, exist_ok=True)
BOOKINGS_FILE = os.path.join(DATA_DIR, "bookings.json")

class BookingService:
    def __init__(self):
        self.bookings: Dict[int, Dict[str, Any]] = {}
        self.next_id = 1
        self.load_bookings()

    def load_bookings(self):
        if os.path.exists(BOOKINGS_FILE):
            try:
                with open(BOOKINGS_FILE, 'r', encoding='utf-8') as f:
                    raw = json.load(f)
                    self.bookings = {int(b["id"]): b for b in raw}
                    if self.bookings:
                        self.next_id = max(self.bookings.keys()) + 1
                    return
            except Exception as e:
                print(f"Failed to load bookings.json: {e}")
        self.bookings = {}

    def save_bookings(self):
        try:
            with open(BOOKINGS_FILE, 'w', encoding='utf-8') as f:
                json.dump(list(self.bookings.values()), f, indent=2)
        except Exception as e:
            print(f"Failed to save bookings.json: {e}")

    def create_booking(
        self,
        user_id: int,
        user_name: str,
        user_email: str,
        trip_id: int,
        travel_date: str,
        travelers_count: int = 1,
        traveler_names: Optional[List[str]] = None,
        special_requests: str = "",
        payment_method: str = "UPI (Google Pay / PhonePe)",
        departure_city: Optional[str] = None,
        source: Optional[str] = None
    ) -> Dict[str, Any]:
        trip = travel_catalog.get_by_id(trip_id)
        if not trip:
            raise ValueError("Travel package not found.")

        pax = max(1, int(travelers_count))
        if trip["available_seats"] < pax:
            raise ValueError(f"Only {trip['available_seats']} seats available for this trip.")

        # Decrement seats in catalog
        travel_catalog.decrement_seats(trip_id, pax)

        # Calculate amounts
        base_amount = trip["amount"] * pax
        tax = round(base_amount * 0.05, 2)
        total_amount = round(base_amount + tax, 2)

        booking_id = self.next_id
        self.next_id += 1

        booking_code = f"TRV-{time.strftime('%Y')}-{random.randint(1000, 9999)}"
        txn_id = f"TXN-{int(time.time()*1000)}-{random.randint(100, 999)}"

        actual_source = departure_city or source or trip.get("source") or "Mumbai, India"

        status = "confirmed" if payment_method != "Pending Payment" else "pending"
        payment_status = "completed" if status == "confirmed" else "pending"

        booking = {
            "id": booking_id,
            "booking_code": booking_code,
            "user_id": user_id,
            "customer_name": user_name,
            "customer_email": user_email,
            "trip_id": trip_id,
            "trip_title": trip["title"],
            "source": actual_source,
            "origin": actual_source,
            "departure_city": actual_source,
            "destination": trip["destination"],
            "destination_type": trip.get("destination_type", "Domestic"),
            "category": trip.get("category", "Standard"),
            "transport": trip["transport"],
            "hotel_category": trip.get("hotel_category", "3-Star Deluxe"),
            "image_url": trip.get("image_url"),
            "travel_date": travel_date,
            "travelers_count": pax,
            "traveler_names": traveler_names or [user_name],
            "total_amount": total_amount,
            "special_requests": special_requests,
            "status": status,
            "timeline_step": 2 if status == "confirmed" else 1,
            "transaction_id": txn_id,
            "payment_method": payment_method,
            "payment_status": payment_status,
            "itinerary": trip.get("itinerary", []),
            "created_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
        }

        self.bookings[booking_id] = booking
        self.save_bookings()

        return {
            "bookingId": booking_id,
            "bookingCode": booking_code,
            "transactionId": txn_id,
            "tripTitle": trip["title"],
            "source": actual_source,
            "origin": actual_source,
            "destination": trip["destination"],
            "transport": trip["transport"],
            "totalAmount": total_amount,
            "status": status,
            "id": booking_id,
            "booking_id": booking_id,
            "booking_code": booking_code,
            "trip_title": trip["title"],
            "total_amount": total_amount,
            "travel_date": travel_date,
            "travelers_count": pax,
            "payment_status": payment_status,
            "timeline_step": booking["timeline_step"],
            "itinerary": booking["itinerary"]
        }

    def get_by_user(self, user_id: int) -> List[Dict[str, Any]]:
        self.load_bookings()
        user_bookings = [b for b in self.bookings.values() if b.get("user_id") == user_id]
        return sorted(user_bookings, key=lambda x: x["id"], reverse=True)

    def get_by_id(self, booking_id: int) -> Optional[Dict[str, Any]]:
        self.load_bookings()
        return self.bookings.get(booking_id)

    def get_by_code(self, code: str) -> Optional[Dict[str, Any]]:
        self.load_bookings()
        for b in self.bookings.values():
            if b.get("booking_code", "").lower() == code.strip().lower():
                return b
        return None

    def get_by_agent(self, agent_id: int) -> List[Dict[str, Any]]:
        self.load_bookings()
        # Return bookings assigned to this agent or accessible in the agent's regional portfolio
        agent_bookings = [
            b for b in self.bookings.values()
            if b.get("agent_id") in (agent_id, None) or (b.get("id", 0) % 2 == agent_id % 2)
        ]
        return sorted(agent_bookings, key=lambda x: x["id"], reverse=True)

    def get_all(self) -> List[Dict[str, Any]]:
        self.load_bookings()
        return sorted(list(self.bookings.values()), key=lambda x: x["id"], reverse=True)

    def modify_booking(self, booking_id: int, travel_date: Optional[str] = None, travelers_count: Optional[int] = None, special_requests: Optional[str] = None) -> Dict[str, Any]:
        self.load_bookings()
        if booking_id not in self.bookings:
            raise ValueError("Booking not found.")
        booking = self.bookings[booking_id]
        if travel_date:
            booking["travel_date"] = travel_date
        if travelers_count and travelers_count > 0:
            booking["travelers_count"] = travelers_count
        if special_requests is not None:
            booking["special_requests"] = special_requests
        self.save_bookings()
        return booking

    def cancel(self, booking_id: int, user_id: int, role: str) -> Dict[str, Any]:
        self.load_bookings()
        if booking_id not in self.bookings:
            raise ValueError("Booking not found.")

        booking = self.bookings[booking_id]
        if role != "admin" and booking["user_id"] != user_id:
            raise PermissionError("Not authorized to cancel this booking.")

        if booking["status"] == "cancelled":
            raise ValueError("Booking is already cancelled.")

        # Restore seats
        travel_catalog.restore_seats(booking["trip_id"], booking["travelers_count"])

        booking["status"] = "cancelled"
        booking["payment_status"] = "refunded"
        booking["timeline_step"] = 0
        self.save_bookings()

        return {"success": True, "bookingId": booking_id, "status": "cancelled"}

    def update_status(self, booking_id: int, status: str, payment_status: Optional[str] = None) -> Dict[str, Any]:
        self.load_bookings()
        if booking_id not in self.bookings:
            raise ValueError("Booking not found.")
        self.bookings[booking_id]["status"] = status
        if payment_status:
            self.bookings[booking_id]["payment_status"] = payment_status
        elif status == "confirmed":
            self.bookings[booking_id]["payment_status"] = "completed"
            self.bookings[booking_id]["timeline_step"] = 2
        elif status == "completed":
            self.bookings[booking_id]["timeline_step"] = 8
        elif status == "cancelled":
            self.bookings[booking_id]["payment_status"] = "refunded"
            self.bookings[booking_id]["timeline_step"] = 0
        self.save_bookings()
        return {"id": booking_id, "status": status, "payment_status": self.bookings[booking_id].get("payment_status")}

booking_service = BookingService()
