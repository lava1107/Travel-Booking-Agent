"""
Lyan Travels – Real AI Travel Agent Engine with Multi-step Tool Calling.
Supports natural language travel inquiries, context tracking, tool execution,
and end-to-end booking for travelers departing from Tamil Nadu and across India.
"""

import os
import re
import json
import time
from typing import Dict, Any, List, Optional, Tuple
from app.travel_catalog import travel_catalog
from app.booking_service import booking_service

DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "data")
AI_CONV_FILE = os.path.join(DATA_DIR, "ai_conversations.json")
SUPPORT_FILE = os.path.join(DATA_DIR, "support_requests.json")
DESTINATIONS_FILE = os.path.join(DATA_DIR, "destinations.json")
HOSTELS_FILE = os.path.join(DATA_DIR, "hostels.json")


class AITravelAgent:
    """
    Intelligent Conversational Travel Agent with Function/Tool Calling & Context Management.
    """

    def __init__(self):
        pass

    # ==========================================
    # TOOL / FUNCTION REPOSITORY
    # ==========================================

    def tool_search_packages(
        self,
        origin: Optional[str] = None,
        destination: Optional[str] = None,
        destination_type: Optional[str] = None,
        budget: Optional[float] = None,
        category: Optional[str] = None,
        travel_type: Optional[str] = None,
        limit: int = 5
    ) -> List[Dict[str, Any]]:
        """Searches packages from the live database."""
        pkgs = travel_catalog.get_all(
            source=origin,
            origin=origin,
            destination=destination,
            destination_type=destination_type,
            category=category,
            max_price=budget,
            limit=limit
        )

        # If strict search yielded nothing, broaden search gracefully
        if not pkgs and destination:
            pkgs = travel_catalog.get_all(destination=destination, limit=limit)
        if not pkgs and origin:
            pkgs = travel_catalog.get_all(origin=origin, limit=limit)
        if not pkgs and destination_type:
            pkgs = travel_catalog.get_all(destination_type=destination_type, limit=limit)
        if not pkgs:
            pkgs = travel_catalog.get_all(featured_only=True, limit=limit)

        return pkgs[:limit]

    def tool_get_package_details(self, package_id: int) -> Optional[Dict[str, Any]]:
        return travel_catalog.get_by_id(package_id)

    def tool_calculate_price(
        self,
        package_id: int,
        pax: int = 1,
        hotel_tier: str = "Standard",
        addons: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        pkg = travel_catalog.get_by_id(package_id)
        if not pkg:
            return {"error": "Package not found"}
        base_price = float(pkg["amount"])
        subtotal = base_price * pax
        gst = round(subtotal * 0.05, 2)
        total = round(subtotal + gst, 2)
        return {
            "package_id": package_id,
            "title": pkg["title"],
            "base_price_per_person": base_price,
            "travelers": pax,
            "subtotal": subtotal,
            "gst_tax_5_percent": gst,
            "total_price": total,
            "currency": "INR (₹)"
        }

    def tool_check_availability(self, package_id: int, pax: int = 1) -> Dict[str, Any]:
        pkg = travel_catalog.get_by_id(package_id)
        if not pkg:
            return {"available": False, "reason": "Package not found"}
        available_seats = pkg.get("available_seats", 0)
        return {
            "package_id": package_id,
            "title": pkg["title"],
            "requested_pax": pax,
            "available_seats": available_seats,
            "available": available_seats >= pax
        }

    def tool_compare_packages(self, package_ids: List[int]) -> Dict[str, Any]:
        pkgs = [travel_catalog.get_by_id(pid) for pid in package_ids if travel_catalog.get_by_id(pid)]
        if not pkgs:
            return {"error": "No packages found to compare"}
        return {
            "count": len(pkgs),
            "packages": pkgs,
            "comparison_summary": "Comparison data ready for side-by-side display"
        }

    def tool_get_customer_bookings(self, user_id: int) -> List[Dict[str, Any]]:
        return booking_service.get_by_user(user_id)

    def tool_cancel_booking(self, booking_id: int, user_id: int, role: str = "customer") -> Dict[str, Any]:
        return booking_service.cancel(booking_id, user_id, role)

    def tool_create_support_request(
        self,
        user_name: str,
        user_email: str,
        subject: str,
        message: str,
        conversation_id: str
    ) -> Dict[str, Any]:
        reqs = []
        if os.path.exists(SUPPORT_FILE):
            try:
                with open(SUPPORT_FILE, "r", encoding="utf-8") as f:
                    reqs = json.load(f)
            except Exception:
                reqs = []

        new_id = (max([r["id"] for r in reqs], default=0) + 1)
        ticket = {
            "id": new_id,
            "customer_name": user_name,
            "customer_email": user_email,
            "subject": subject,
            "message": message,
            "status": "Assigned to Agent",
            "assigned_agent": "Sarah Connor",
            "conversation_id": conversation_id,
            "priority": "High",
            "created_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
        }
        reqs.append(ticket)
        try:
            with open(SUPPORT_FILE, "w", encoding="utf-8") as f:
                json.dump(reqs, f, indent=2)
        except Exception as e:
            print(f"Error saving support request: {e}")
        return ticket

    def record_conversation_log(
        self,
        conversation_id: str,
        user_name: str,
        user_email: str,
        intent: str,
        confidence: float,
        entities: Dict[str, Any],
        tools_called: List[str],
        booking_created: bool,
        human_handoff: bool,
        user_msg: str,
        ai_reply: str
    ):
        """Persists AI agent interaction for Admin monitoring & human takeover."""
        convs = []
        if os.path.exists(AI_CONV_FILE):
            try:
                with open(AI_CONV_FILE, "r", encoding="utf-8") as f:
                    convs = json.load(f)
            except Exception:
                convs = []

        now_str = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
        existing = next((c for c in convs if c.get("conversation_id") == conversation_id), None)

        if not existing:
            existing = {
                "conversation_id": conversation_id,
                "customer_name": user_name,
                "customer_email": user_email,
                "started_at": now_str,
                "last_updated_at": now_str,
                "intent": intent,
                "confidence": confidence,
                "entities": entities,
                "tools_called": tools_called,
                "booking_created": booking_created,
                "human_handoff": human_handoff,
                "status": "Handoff to Agent" if human_handoff else ("Booking Completed" if booking_created else "Active"),
                "messages": []
            }
            convs.insert(0, existing)
        else:
            existing["last_updated_at"] = now_str
            existing["intent"] = intent
            existing["confidence"] = confidence
            existing["entities"].update(entities)
            for t in tools_called:
                if t not in existing["tools_called"]:
                    existing["tools_called"].append(t)
            if booking_created:
                existing["booking_created"] = True
                existing["status"] = "Booking Completed"
            if human_handoff:
                existing["human_handoff"] = True
                existing["status"] = "Handoff to Agent"

        existing["messages"].append({"role": "user", "text": user_msg})
        existing["messages"].append({"role": "assistant", "text": ai_reply})

        try:
            with open(AI_CONV_FILE, "w", encoding="utf-8") as f:
                json.dump(convs[:50], f, indent=2)
        except Exception as e:
            print(f"Error saving AI conversation log: {e}")

    # ==========================================
    # DOMAIN KNOWLEDGE ENCYCLOPEDIA & DEEP DIVES
    # ==========================================

    def handle_website_inquiry(
        self,
        topic: str,
        ctx: Dict[str, Any],
        user: Optional[Dict[str, Any]],
        raw_msg: str
    ) -> Dict[str, Any]:
        """Provides an exhaustive, structured guide to everything on the Lyan Travels platform."""
        reply = (
            "🌐 **Welcome to Lyan Travels — Travel Agent Management & Booking System**\n\n"
            "Lyan Travels is an all-in-one travel intelligence platform built specifically for travelers departing from Tamil Nadu (Chennai, Coimbatore, Madurai, Trichy, Salem, Vellore) and across India.\n\n"
            "Here is **everything** you can do on our website:\n\n"
            "────────────────────────────────────────\n"
            "### 🗺️ 1. Tour Package Explorer & Custom Itinerary Planner\n"
            "- **Extensive Catalog:** 100+ curated domestic & international packages departing from major Tamil Nadu transit hubs.\n"
            "- **Categories:** Budget, Economy, Standard, Premium, and Ultra-Luxury tiers.\n"
            "- **Smart Search:** Filter by departure city, budget cap, duration, and theme (Beach, Hills, Heritage, Honeymoon, Wildlife, Adventure).\n"
            "- **Custom Trip Planner:** Input your origin, destination, days, and traveler count to automatically build a custom day-by-day itinerary.\n\n"
            "────────────────────────────────────────\n"
            "### 🤖 2. Conversational AI Travel Concierge (Voice Enabled)\n"
            "- **24/7 Machine Learning Travel Brain:** Multi-turn conversational agent with context tracking, intent classification, and NER.\n"
            "- **🎙️ Speech-to-Text (Voice Input):** Tap the microphone button in the chat input bar to speak your destination or questions naturally!\n"
            "- **🔊 Text-to-Speech (Voice Output):** Tap the speaker icon on any message to listen aloud, or turn on 'Auto-Voice' in the header for automatic speech readout.\n"
            "- **Instant In-Chat Bookings:** Reserve tour packages right inside this chat window and receive official PNR boarding vouchers instantly.\n\n"
            "────────────────────────────────────────\n"
            "### 🏨 3. Backpacker Hostels & Youth Stays\n"
            "- Direct partnerships with **Zostel**, **The Hosteller**, and certified boutique backpacker hostels across Goa, Kerala, Ooty, Kodaikanal, Manali, and Pondicherry.\n"
            "- AC dorm beds and private pods starting from **₹499/night** with high-speed WiFi, cafes, and social events.\n\n"
            "────────────────────────────────────────\n"
            "### 🎫 4. My Bookings & Boarding Pass Dashboard\n"
            "- Check live PNR status (`TRV-2026-XXX`), view travel dates, traveler rosters, and download digital e-tickets anytime in the **My Bookings** tab.\n\n"
            "────────────────────────────────────────\n"
            "### 💳 5. 100% Safe Payments\n"
            "- **UPI:** Google Pay, PhonePe, Paytm, BHIM (instant zero-fee verification).\n"
            "- **Cards:** Visa, MasterCard, RuPay (credit & debit cards).\n"
            "- **Net Banking & EMI:** Zero-cost 3-month and 6-month EMI plans available on trips above ₹20,000.\n\n"
            "────────────────────────────────────────\n"
            "### 🛡️ 6. 48-Hour Free Cancellation & Full Refund\n"
            "- Cancel any reservation up to 48 hours prior to departure for a **100% full refund** to your original payment method with zero hidden penalties.\n\n"
            "────────────────────────────────────────\n"
            "### 🎁 7. Active Promo Codes\n"
            "- **`TAMILNADU10`** — Flat 10% instant discount for departures from any Tamil Nadu city.\n"
            "- **`LYANFIRST`** — Flat ₹1,500 off your very first vacation booking.\n"
            "- **`SUMMER25`** — 25% discount on Luxury and Honeymoon packages.\n\n"
            "────────────────────────────────────────\n"
            "### 👤 8. 24/7 Human Agent Concierge\n"
            "- Need personalized travel consulting? Connect directly with Senior Consultant **Sarah Connor** (+91 98400 11223) with a single tap!\n\n"
            "💡 *What would you like to explore next? You can ask me **'Tell me everything about Goa'**, **'Find trips from Chennai under 40k'**, or **'Hostels in Kerala'**!*"
        )
        return {
            "intent": "help",
            "confidence": 0.99,
            "entities": {},
            "context": ctx,
            "reply": reply,
            "packages": [],
            "suggestions": [
                "Everything about Goa",
                "Trips from Chennai under 40k",
                "Hostels & Dorms",
                "Talk to human agent"
            ]
        }

    def handle_destination_deep_dive(
        self,
        dest_name: str,
        ctx: Dict[str, Any],
        user: Optional[Dict[str, Any]],
        raw_msg: str
    ) -> Dict[str, Any]:
        """Provides an exhaustive, structured encyclopedia guide and packages for any destination."""
        dest_clean = dest_name.strip().title()
        if "Goa" in dest_clean or "goa" in raw_msg.lower():
            dest_clean = "Goa"

        origin = ctx.get("origin") or "Chennai"

        # Load live packages matching this destination
        pkgs = travel_catalog.get_all(destination=dest_clean, limit=6)
        if not pkgs:
            pkgs = travel_catalog.get_all(destination="Goa", limit=6)

        ctx["last_packages"] = pkgs[:4]

        # Format package lines
        pkg_summaries = []
        for i, p in enumerate(pkgs[:4], 1):
            pkg_summaries.append(
                f"**{i}. {p['title']}**\n"
                f"   - 📍 **Route:** {p.get('source', 'Chennai')} ➔ {p['destination']} ({p.get('destination_type', 'Domestic')})\n"
                f"   - 💰 **Price:** ₹{int(p['amount']):,} per person | ⭐ {p.get('rating', 4.9)}/5\n"
                f"   - ⏱️ **Duration:** {p.get('duration', '5D / 4N')} | 🏷️ **Tier:** {p.get('category', 'Standard')}\n"
                f"   - 🚀 **Transport:** {p.get('transport', 'Flight + Cab')} | 🏨 **Stay:** {p.get('hotel_category', '4-Star Beach Resort')}\n"
                f"   - 🍳 **Meals:** {p.get('meals', 'Buffet Breakfast & Dinner Cruise')}"
            )
        pkg_text = "\n\n".join(pkg_summaries)

        if dest_clean.lower() == "goa":
            reply = (
                "🌴 **Complete Travel & Vacation Guide: Goa, India** 🌴\n\n"
                "Welcome to Goa — India's premier coastal haven! Where 450 years of Portuguese heritage, sun-drenched Arabian Sea beaches, swaying coconut palms, vibrant beach shacks, and a relaxed 'Susegad' lifestyle meet thrilling water sports and electrifying nightlife.\n\n"
                "Here is **everything** you need to know about Goa and our top travel offerings:\n\n"
                "────────────────────────────────────────\n"
                "### 📦 1. Curated Tour Packages (Departing from Tamil Nadu)\n"
                f"We offer direct departures from **Chennai, Coimbatore, Madurai, Trichy, and Salem**:\n\n"
                f"{pkg_text}\n\n"
                "────────────────────────────────────────\n"
                "### 🏖️ 2. North Goa vs. South Goa Sightseeing Highlights\n"
                "**North Goa (Buzzing Beaches, Water Sports & Nightlife):**\n"
                "- **Baga & Calangute Beach:** High-energy water sports (Parasailing, Jet Ski, Banana Boat), famous beach shacks (Britto's, Souza Lobo).\n"
                "- **Anjuna & Vagator Beach:** Stunning red laterite cliffs, sunset views, Curlies Beach Shack, and Wednesday Anjuna Flea Market.\n"
                "- **Chapora Fort:** Panoramic clifftop fortress made legendary by *Dil Chahta Hai* overlooking Vagator bay.\n"
                "- **Fort Aguada & Lighthouse:** 17th-century Portuguese coastal bastion with pristine Arabian Sea views.\n"
                "- **Tito's Lane:** World-renowned party promenade featuring Club Tito's and Café Mambo.\n\n"
                "**South Goa (Pristine Shores, Heritage & Peaceful Nature):**\n"
                "- **Palolem & Butterfly Beach:** Crescent-shaped beach with gentle turquoise waves, kayaking, and dolphin spotting.\n"
                "- **Colva & Benaulim Beach:** Miles of powdery white sand, serene sunsets, and luxury beachfront dining.\n"
                "- **Dudhsagar Waterfalls:** Majestic 310m 4-tiered waterfall in Bhagwan Mahavir Sanctuary with exhilarating 4x4 Jeep safaris.\n"
                "- **Old Goa Basilicas (UNESCO World Heritage):** Basilica of Bom Jesus (sacred relics of St. Francis Xavier) and Se Cathedral.\n"
                "- **Sahakari Spice Plantation:** Traditional guided walk with organic spice tastings, elephant bathing, and authentic Goan buffet lunch.\n\n"
                "────────────────────────────────────────\n"
                "### 🏨 3. Accommodation & Hostel Options\n"
                "- **Backpacker & Youth Hostels (from ₹799/night):**\n"
                "  • *Zostel Morjim:* Beachfront location, rooftop cafe, surf lessons, vibrant community.\n"
                "  • *The Hosteller Anjuna:* Poolside lounge, container pods, game room, organized pub crawls.\n"
                "- **Luxury Beachfront Resorts (from ₹9,500/night):**\n"
                "  • *Taj Exotica Resort & Spa (Benaulim):* 56 acres of Mediterranean luxury with private beach.\n"
                "  • *W Goa (Vagator):* Trendy cliffside luxury, rock pool, and world-class spa.\n"
                "  • *Caravela Beach Resort (Varca):* Pristine white-sand direct access with golf putting green.\n\n"
                "────────────────────────────────────────\n"
                "### ✈️ 4. Travel & Transit Connectivity from Tamil Nadu\n"
                "- **Direct Flights:** Daily non-stop flights from Chennai (MAA) & Coimbatore (CJB) to Goa Dabolim (GOI) / Manohar Mopa (GOX) (1h 45m).\n"
                "- **Express Trains:** Vasco Da Gama Express departing from Chennai Central & Coimbatore Junction.\n"
                "- **Luxury Sleeper Buses:** Daily overnight multi-axle Volvo & Scania AC sleepers from Chennai, Coimbatore, and Bengaluru.\n\n"
                "────────────────────────────────────────\n"
                "### 🏄 5. Must-Do Activities & Experiences\n"
                "- **Scuba Diving & Snorkeling:** Explore coral reefs and shipwrecks at Grande Island with certified PADI divemasters.\n"
                "- **Mandovi River Sunset Dinner Cruise:** 2-hour cruise with live Goan folk dance (Dekhni & Fugdi), DJ, and open buffet.\n"
                "- **Offshore Floating Casinos:** Deltin Royale & Casino Pride for gaming, entertainment, and gourmet dining.\n\n"
                "────────────────────────────────────────\n"
                "### 💡 6. Best Season & Local Travel Advice\n"
                "- **Peak Season (October to April):** Perfect beach weather (28°C–32°C), all shacks open, water sports operating.\n"
                "- **Monsoon Season (June to September):** Emerald-green countryside, Dudhsagar Falls in full power, 40% cheaper luxury resorts.\n"
                "- **Scooter Rentals:** Available everywhere for ₹350–₹500/day (helmets & valid license mandatory).\n\n"
                "💡 *You can click **'Book This'** on any package below, or say **'Book the first one'**, **'Show hostels in Goa'**, or **'Talk to human agent'**!*"
            )

            suggestions = [
                "Book package 1",
                "Show hostels in Goa",
                "Which package has flights?",
                "Talk to human agent"
            ]
        elif dest_clean.lower() in ["kerala", "munnar", "alleppey"]:
            reply = (
                "🌿 **Complete Travel & Vacation Guide: Kerala & Munnar** 🌿\n\n"
                "Welcome to God's Own Country! Celebrated for mist-covered tea plantations in Munnar, serene emerald backwaters in Alleppey, Ayurvedic wellness sanctuaries, and dramatic ocean cliffs in Varkala.\n\n"
                "────────────────────────────────────────\n"
                "### 📦 1. Curated Kerala Tour Packages\n"
                f"{pkg_text}\n\n"
                "────────────────────────────────────────\n"
                "### 🏞️ 2. Top Sightseeing & Highlights\n"
                "- **Munnar Tea Valleys:** Sprawling Tata Tea Museum, Mattupetty Dam, Top Station, and Nilgiri Tahr sightings at Eravikulam National Park.\n"
                "- **Alleppey Backwaters:** Private traditional Kettuvallam houseboats with onboard chefs serving fresh Karimeen fish fry.\n"
                "- **Varkala Cliff Beach:** Red laterite cliffs overlooking the Arabian Sea, yoga retreats, and sunset cafes.\n"
                "- **Thekkady (Periyar):** Bamboo rafting, spice plantation walks, and wild elephant boat safaris.\n\n"
                "────────────────────────────────────────\n"
                "### 🏨 3. Hostels & Resorts\n"
                "- *Zostel Munnar & The Lost Hostels Varkala Beach Cliff* (Dorms from ₹650/night).\n"
                "- *3-Star & 5-Star Luxury:* Fragrant Nature Resort Munnar, Kumarakom Lake Resort.\n\n"
                "────────────────────────────────────────\n"
                "### ✈️ 4. Connectivity from Tamil Nadu\n"
                "- Vande Bharat Express & daily trains from Chennai Central, Coimbatore, and Madurai to Ernakulam / Kottayam.\n"
                "- Direct luxury AC sleeper buses from Chennai, Coimbatore, and Salem.\n\n"
                "💡 *Click **'Book This'** on any package card below to confirm with AI Concierge!*"
            )
            suggestions = [
                "Book package 1",
                "Houseboat details",
                "Hostels in Kerala",
                "Talk to human agent"
            ]
        elif dest_clean.lower() in ["ooty", "coonoor"]:
            reply = (
                "🌲 **Complete Travel & Vacation Guide: Ooty & Coonoor** 🌲\n\n"
                "Welcome to the Queen of Hill Stations! Nestled in the Nilgiri Hills of Tamil Nadu at an elevation of 2,240m, famed for cool climate, eucalyptus forests, and English colonial charm.\n\n"
                "────────────────────────────────────────\n"
                "### 📦 1. Curated Ooty Tour Packages\n"
                f"{pkg_text}\n\n"
                "────────────────────────────────────────\n"
                "### 🚂 2. Sightseeing Highlights\n"
                "- **UNESCO Nilgiri Mountain Toy Train:** Century-old steam railway bridging Mettupalayam, Coonoor, and Ooty through 16 tunnels.\n"
                "- **Doddabetta Peak:** Highest point in the Nilgiris (2,637m) with telescope house.\n"
                "- **Ooty Botanical Gardens & Rose Garden:** 20,000+ varieties of exotic flora.\n"
                "- **Pykara Falls & Speed Boating:** Pine forests and cascading mountain streams.\n"
                "- **Homemade Chocolate & Tea Shopping:** Nilgiri CTC tea and hazelnut fudges.\n\n"
                "────────────────────────────────────────\n"
                "### 🚗 3. Transit from Tamil Nadu\n"
                "- Coimbatore Airport/Railway Station (85 km) with direct private cab transfers.\n"
                "- Overnight luxury sleeper buses departing daily from Chennai, Madurai, and Trichy.\n\n"
                "💡 *Click **'Book This'** below to reserve your mountain getaway!*"
            )
            suggestions = [
                "Book package 1",
                "Toy train tickets",
                "Ooty weekend trips",
                "Talk to human agent"
            ]
        elif dest_clean.lower() in ["andaman", "havelock"]:
            reply = (
                "🏝️ **Complete Travel & Vacation Guide: Andaman Islands** 🏝️\n\n"
                "India's tropical paradise in the Bay of Bengal, featuring Asia's finest turquoise beaches, vibrant living coral reefs, and profound freedom history.\n\n"
                "────────────────────────────────────────\n"
                "### 📦 1. Curated Andaman Tour Packages\n"
                f"{pkg_text}\n\n"
                "────────────────────────────────────────\n"
                "### 🌊 2. Sightseeing & Activities\n"
                "- **Radhanagar Beach (Havelock):** Awarded Asia's Best Beach by Time Magazine with white sands and calm sunset waters.\n"
                "- **Scuba Diving & Snorkeling at Elephant Beach:** Certified PADI dive with clownfish, sea turtles, and corals.\n"
                "- **Cellular Jail (Port Blair):** Historic Kaala Paani memorial with moving evening Light & Sound narration.\n"
                "- **Makruzz Catamaran:** High-speed luxury ferry cruising between Port Blair, Havelock, and Neil Island.\n\n"
                "────────────────────────────────────────\n"
                "### ✈️ 3. Transit from Tamil Nadu\n"
                "- Daily non-stop 2-hour flights from Chennai International Airport (MAA) to Port Blair Veer Savarkar Airport (IXZ).\n\n"
                "💡 *Click **'Book This'** below to reserve your island getaway!*"
            )
            suggestions = [
                "Book package 1",
                "Scuba diving details",
                "Flights from Chennai",
                "Talk to human agent"
            ]
        elif dest_clean.lower() in ["dubai", "uae"]:
            reply = (
                "🏙️ **Complete Travel & Vacation Guide: Dubai & Abu Dhabi** 🏙️\n\n"
                "The futuristic metropolis of world records, desert adventures, luxury shopping, and golden skylines.\n\n"
                "────────────────────────────────────────\n"
                "### 📦 1. Curated Dubai Tour Packages\n"
                f"{pkg_text}\n\n"
                "────────────────────────────────────────\n"
                "### 🌟 2. Top Attractions\n"
                "- **Burj Khalifa 'At The Top':** Observation decks on 124th & 148th floors.\n"
                "- **Desert Dune Safari:** 4x4 red dune bashing, camel rides, belly dance, and BBQ dinner under the stars.\n"
                "- **Marina Dhow Dinner Cruise:** Luxury traditional boat gliding along Dubai Marina.\n"
                "- **Museum of the Future & Dubai Mall:** Indoor Olympic ice rink and giant aquarium.\n\n"
                "────────────────────────────────────────\n"
                "### ✈️ 3. Transit from Tamil Nadu\n"
                "- Direct daily 4-hour flights from Chennai (MAA) and Coimbatore (CJB) to Dubai (DXB).\n"
                "- Fast 48-hour UAE tourist visa processing included in our international packages.\n\n"
                "💡 *Click **'Book This'** below to book your Dubai holiday!*"
            )
            suggestions = [
                "Book package 1",
                "Visa requirements",
                "Desert safari details",
                "Talk to human agent"
            ]
        elif dest_clean.lower() in ["singapore"]:
            reply = (
                "🦁 **Complete Travel & Vacation Guide: Singapore** 🦁\n\n"
                "The world's premier Garden City blending futuristic architecture, family theme parks, and Michelin-star street food.\n\n"
                "────────────────────────────────────────\n"
                "### 📦 1. Curated Singapore Tour Packages\n"
                f"{pkg_text}\n\n"
                "────────────────────────────────────────\n"
                "### 🎡 2. Top Attractions\n"
                "- **Universal Studios Singapore:** Sentosa Island's world-class theme park with Transformers and Battlestar Galactica.\n"
                "- **Gardens by the Bay:** Supertree Grove light show, Cloud Forest indoor waterfall, and Flower Dome.\n"
                "- **Marina Bay Sands SkyPark:** 57th floor panoramic observation deck.\n"
                "- **Singapore Night Safari:** World's first nocturnal wildlife park.\n\n"
                "────────────────────────────────────────\n"
                "### ✈️ 3. Transit from Tamil Nadu\n"
                "- Direct daily flights from Chennai (MAA) and Trichy (TRZ) to Singapore Changi Airport (SIN) (3h 50m).\n\n"
                "💡 *Click **'Book This'** below to lock in your Singapore trip!*"
            )
            suggestions = [
                "Book package 1",
                "Universal Studios pass",
                "Flights from Trichy/Chennai",
                "Talk to human agent"
            ]
        elif dest_clean.lower() in ["maldives"]:
            reply = (
                "🌊 **Complete Travel & Vacation Guide: Maldives Islands** 🌊\n\n"
                "The ultimate tropical luxury retreat featuring turquoise lagoons, overwater villas with private glass floors, and world-class marine life.\n\n"
                "────────────────────────────────────────\n"
                "### 📦 1. Curated Maldives Tour Packages\n"
                f"{pkg_text}\n\n"
                "────────────────────────────────────────\n"
                "### 🤿 2. Highlights & Inclusions\n"
                "- **Overwater Pool Villas:** Direct ladder into coral lagoons.\n"
                "- **Speedboat / Seaplane Airport Transfers:** Breathtaking aerial views from Velana International Airport.\n"
                "- **All-Inclusive Dining:** Daily gourmet buffet meals and sunset cocktails.\n"
                "- **Free 30-Day Visa on Arrival** for Indian passport holders.\n\n"
                "────────────────────────────────────────\n"
                "### ✈️ 3. Transit from Tamil Nadu\n"
                "- Quick direct flights from Chennai (MAA) and Kochi to Male (MLE) (under 2 hours).\n\n"
                "💡 *Click **'Book This'** below to confirm your luxury villa!*"
            )
            suggestions = [
                "Book package 1",
                "Overwater villa rates",
                "Honeymoon complimentary perks",
                "Talk to human agent"
            ]
        else:
            # Generic smart destination fallback
            reply = (
                f"🌍 **Complete Travel & Vacation Guide: {dest_clean}** 🌍\n\n"
                f"Here is our complete vacation breakdown for **{dest_clean}**, featuring top-rated packages departing from Tamil Nadu ({origin}):\n\n"
                "────────────────────────────────────────\n"
                f"### 📦 1. Curated Vacation Packages\n"
                f"{pkg_text}\n\n"
                "────────────────────────────────────────\n"
                f"### ✈️ 2. Transport & Accommodation Details\n"
                f"- Verified transport from **{origin}** (Direct Flights / AC Sleeper Coach / Vande Bharat Express).\n"
                f"- Accommodations: Deluxe 3-Star and 4-Star resorts with daily buffet breakfast.\n"
                f"- 24/7 on-trip emergency support and dedicated local sightseeing guide.\n\n"
                f"💡 *Click **'Book This'** below or ask me to customize this journey for you!*"
            )
            suggestions = [
                "Book package 1",
                "Which one has breakfast?",
                "Change departure city",
                "Talk to human agent"
            ]

        return {
            "intent": "search_trips",
            "confidence": 0.99,
            "entities": {"destination": dest_clean},
            "context": ctx,
            "reply": reply,
            "packages": pkgs[:4],
            "suggestions": suggestions
        }

    # ==========================================
    # CORE REASONING & RESPONSE GENERATION
    # ==========================================

    def process_turn(
        self,
        user_message: str,
        context: Optional[Dict[str, Any]] = None,
        user: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Executes the agentic pipeline:
        1. NLP Intent & Entity extraction
        2. Context state reconciliation
        3. Clarification check / Missing information detector
        4. Tool selection & execution
        5. Natural language response generation
        """
        from app.intent_classifier import intent_classifier
        from app.entity_extractor import entity_extractor

        msg = user_message.strip()
        t_low = msg.lower()
        ctx = dict(context or {})

        # Step 1: Detect Intent & Extract Entities
        intent, confidence, _ = intent_classifier.predict(msg)
        new_entities = entity_extractor.extract_entities(msg)

        # Merge slots into conversation context
        for k, v in new_entities.items():
            if v is not None:
                ctx[k] = v

        tools_called: List[str] = []
        user_name = user["name"] if user else "Guest Traveler"
        user_email = user["email"] if user else "guest@lyantravel.com"
        conv_id = ctx.get("conversation_id") or f"conv-{int(time.time()*1000)}"
        # =========================================================
        # INTENT 0A: WEBSITE & PLATFORM INQUIRY
        # =========================================================
        website_triggers = [
            "about website", "about the website", "tell me about website", "tell me about the website",
            "about this website", "website features", "features of website", "what can this website do",
            "what does this website do", "how to use this website", "how does this website work",
            "how to book", "payment methods", "payment options", "how to pay",
            "cancellation policy", "refund policy", "refunds", "cancel policy",
            "special offers", "coupons", "discounts", "promo code", "promo codes",
            "who are you", "what can you do", "website details", "everything about website",
            "about lyan", "about lyan travels", "what is lyan travels"
        ]
        if any(w in t_low for w in website_triggers) or (t_low in ["website", "features", "about"]):
            return self.handle_website_inquiry(t_low, ctx, user, msg)

        # =========================================================
        # INTENT 0B: DESTINATION DEEP DIVE ("goa", "tell me about goa", "everything about goa")
        # =========================================================
        dest_val = new_entities.get("destination") or ctx.get("destination")
        is_goa_explicit = "goa" in t_low
        dest_deep_triggers = ["tell me about", "everything about", "details", "info", "what to do in", "explore", "about", "guide"]
        is_deep_ask = any(w in t_low for w in dest_deep_triggers)
        single_dest_tokens = [
            "goa", "kerala", "munnar", "alleppey", "ooty", "coonoor", "kodaikanal",
            "andaman", "manali", "kashmir", "jaipur", "udaipur", "dubai",
            "singapore", "maldives", "thailand", "sri lanka", "bali", "pondicherry"
        ]

        if is_goa_explicit or is_deep_ask or (t_low in single_dest_tokens) or (dest_val and len(t_low.split()) <= 3):
            # Ensure user did not intend an immediate booking or cancellation
            if not any(w in t_low for w in ["book", "cancel", "reservation", "status", "confirm", "pnr"]):
                target_dest = "Goa" if is_goa_explicit else (dest_val or (t_low if t_low in single_dest_tokens else "Goa"))
                return self.handle_destination_deep_dive(target_dest, ctx, user, msg)

        # =========================================================
        # INTENT 1: HUMAN AGENT HANDOFF ("I want to talk to someone")
        # =========================================================
        if intent == "support_handoff" or any(w in t_low for w in ["talk to someone", "human agent", "talk to human", "real person", "speak with agent"]):
            tools_called.append("createSupportRequest")
            summary = f"Customer requested human consultant. Current context: Origin={ctx.get('origin', 'N/A')}, Destination={ctx.get('destination', 'N/A')}, Pax={ctx.get('passengers', 'N/A')}, Budget={ctx.get('budget', 'N/A')}."
            ticket = self.tool_create_support_request(
                user_name=user_name,
                user_email=user_email,
                subject=f"AI Chat Handoff: Travel Inquiry for {ctx.get('destination', 'Vacation')}",
                message=summary,
                conversation_id=conv_id
            )

            reply = (
                f"🤝 **Connecting You with a Certified Travel Consultant**\n\n"
                f"I've created request **#{ticket['id']}** for our senior travel consultant **Sarah Connor**.\n\n"
                f"She has received your chat history and travel preferences ({ctx.get('origin', 'Tamil Nadu')} ➔ {ctx.get('destination', 'your desired destination')}).\n"
                f"Our agent can take over this conversation directly, assist with custom itineraries, or call you at your registered phone number.\n\n"
                f"Is there anything specific you would like me to note for Sarah in the meantime?"
            )

            self.record_conversation_log(
                conv_id, user_name, user_email, "support_handoff", confidence, ctx,
                tools_called, False, True, msg, reply
            )

            return {
                "intent": "support_handoff",
                "confidence": confidence,
                "entities": new_entities,
                "context": ctx,
                "reply": reply,
                "packages": [],
                "human_handoff": True,
                "support_ticket": ticket,
                "suggestions": ["Leave phone number", "View package catalogue", "Check my bookings"]
            }

        # =========================================================
        # INTENT 2: BOOKING STATUS INQUIRY ("What is my booking status?")
        # =========================================================
        if intent == "booking_status" or any(w in t_low for w in ["booking status", "status of my booking", "when is my next trip", "show my bookings", "check my booking"]):
            tools_called.append("getCustomerBookings")
            if not user:
                reply = (
                    "🔒 **Sign In Required to View Bookings**\n\n"
                    "To check your active reservations, boarding vouchers, and real-time trip status, "
                    "please **Sign In** to your Lyan Travels account."
                )
                return {
                    "intent": "booking_status",
                    "confidence": confidence,
                    "entities": new_entities,
                    "context": ctx,
                    "reply": reply,
                    "requires_login": True,
                    "suggestions": ["Sign In", "Search Packages"]
                }

            user_bookings = self.tool_get_customer_bookings(user["id"])
            if not user_bookings:
                reply = (
                    f"Hello {user['name']}! You currently don't have any bookings in your account.\n\n"
                    f"Would you like me to help you find an affordable package from Chennai, Coimbatore, or Madurai?"
                )
                return {
                    "intent": "booking_status",
                    "confidence": confidence,
                    "entities": new_entities,
                    "context": ctx,
                    "reply": reply,
                    "suggestions": ["Find trips from Chennai", "Show Goa packages", "Weekend getaways"]
                }

            latest = user_bookings[0]
            status_emoji = "✅" if latest["status"] == "confirmed" else ("⏳" if latest["status"] == "pending" else "ℹ️")
            reply = (
                f"📋 **Your Latest Travel Reservation:**\n\n"
                f"- **Booking PNR:** `{latest.get('booking_code')}`\n"
                f"- **Trip:** {latest.get('trip_title')}\n"
                f"- **Route:** {latest.get('source')} ➔ {latest.get('destination')}\n"
                f"- **Travel Date:** {latest.get('travel_date')}\n"
                f"- **Travelers:** {latest.get('travelers_count')} Guest(s)\n"
                f"- **Total Amount:** ₹{latest.get('total_amount', 0):,}\n"
                f"- **Booking Status:** {status_emoji} **{latest.get('status', '').upper()}**\n"
                f"- **Payment Status:** {latest.get('payment_status', '').upper()}\n\n"
                f"You have **{len(user_bookings)}** total trip(s) on file. You can download your full itinerary in **My Trips**!"
            )

            self.record_conversation_log(
                conv_id, user_name, user_email, "booking_status", confidence, ctx,
                tools_called, False, False, msg, reply
            )

            return {
                "intent": "booking_status",
                "confidence": confidence,
                "entities": new_entities,
                "context": ctx,
                "reply": reply,
                "booking": latest,
                "suggestions": ["View My Trips", "Download e-Ticket", "Plan another vacation"]
            }

        # =========================================================
        # INTENT 3: CANCEL BOOKING ("Cancel my Goa booking")
        # =========================================================
        if intent == "cancel_booking" or any(w in t_low for w in ["cancel my", "cancel booking", "cancel reservation", "cancel the trip"]):
            tools_called.append("getCustomerBookings")
            if not user:
                return {
                    "intent": "cancel_booking",
                    "confidence": confidence,
                    "entities": new_entities,
                    "context": ctx,
                    "reply": "🔒 Please sign in to view and manage cancellations for your travel bookings.",
                    "requires_login": True
                }

            user_bks = self.tool_get_customer_bookings(user["id"])
            active_bks = [b for b in user_bks if b.get("status") in ("confirmed", "pending")]

            # Check if user mentioned specific destination or code
            target = None
            dest_query = ctx.get("destination") or new_entities.get("destination")
            code_query = new_entities.get("booking_code")

            if code_query:
                target = next((b for b in active_bks if b.get("booking_code") == code_query), None)
            elif dest_query:
                target = next((b for b in active_bks if dest_query.lower() in b.get("destination", "").lower() or dest_query.lower() in b.get("trip_title", "").lower()), None)
            elif active_bks:
                target = active_bks[0]

            if not target:
                reply = "I couldn't locate an active booking matching that criteria to cancel. Please check your **My Bookings** dashboard for your active reference code."
                return {
                    "intent": "cancel_booking",
                    "confidence": confidence,
                    "entities": new_entities,
                    "context": ctx,
                    "reply": reply,
                    "suggestions": ["View My Bookings", "Contact Travel Agent"]
                }

            # Check if user explicitly confirmed cancellation
            if "confirm cancel" in t_low or "yes cancel" in t_low or ctx.get("awaiting_cancellation_confirm"):
                tools_called.append("cancelBooking")
                cancel_res = self.tool_cancel_booking(target["id"], user["id"], user.get("role", "customer"))
                ctx.pop("awaiting_cancellation_confirm", None)
                reply = (
                    f"✅ **Booking {target['booking_code']} Has Been Cancelled**\n\n"
                    f"Your reservation for **{target['trip_title']}** has been updated to **Cancelled**.\n"
                    f"- **Refund Status:** Initiated to original payment method ({target.get('payment_method', 'UPI')}).\n"
                    f"- **Timeline:** 2-3 business days as per Lyan Travels 48-hour cancellation policy."
                )
                return {
                    "intent": "cancel_booking",
                    "confidence": confidence,
                    "entities": new_entities,
                    "context": ctx,
                    "reply": reply,
                    "booking": cancel_res.get("data", target),
                    "suggestions": ["View My Bookings", "Search other trips"]
                }
            else:
                # Require confirmation before cancelling!
                ctx["awaiting_cancellation_confirm"] = target["id"]
                reply = (
                    f"⚠️ **Cancellation Confirmation Required**\n\n"
                    f"Are you sure you want to cancel booking **{target['booking_code']}** ({target['trip_title']} on {target['travel_date']})?\n\n"
                    f"**Cancellation Policy Summary:**\n"
                    f"- Full refund if cancelled 48+ hours prior to departure.\n"
                    f"- Seat count: {target['travelers_count']} traveler(s).\n\n"
                    f"To proceed, please reply **'Confirm Cancel'** or click the cancel button in your dashboard."
                )
                return {
                    "intent": "cancel_booking",
                    "confidence": confidence,
                    "entities": new_entities,
                    "context": ctx,
                    "reply": reply,
                    "suggestions": ["Confirm Cancel", "Keep My Booking"]
                }

        # =========================================================
        # INTENT 4: ORDINAL / RELATIVE QUESTIONS ("Which one has breakfast?", "Show cheaper ones")
        # =========================================================
        last_pkgs = ctx.get("last_packages", [])
        if "breakfast" in t_low and last_pkgs:
            tools_called.append("getPackageDetails")
            breakfast_matches = []
            for idx, p in enumerate(last_pkgs, 1):
                meals_text = str(p.get("meals", "")).lower()
                desc_text = str(p.get("description", "")).lower()
                inc_text = " ".join(p.get("inclusions", [])).lower()
                if "breakfast" in meals_text or "breakfast" in desc_text or "breakfast" in inc_text:
                    breakfast_matches.append(f"**Option {idx}: {p['title']}** (includes {p.get('meals', 'Buffet Breakfast')})")

            if breakfast_matches:
                reply = (
                    f"🍳 **Breakfast Inclusions for Your Selected Packages:**\n\n"
                    + "\n\n".join(breakfast_matches) +
                    "\n\nWould you like to book one of these options or check flight transfers?"
                )
            else:
                reply = "From the packages currently shown, breakfast can be added as a custom meal plan for ₹450/day per guest. Would you like me to include that?"

            return {
                "intent": "view_itinerary",
                "confidence": 0.92,
                "entities": new_entities,
                "context": ctx,
                "reply": reply,
                "packages": last_pkgs,
                "suggestions": ["Book the first one", "Book the second one", "Check flight timings"]
            }

        # =========================================================
        # INTENT 5: BOOKING ACTION ("Book the second one", "Book package 2", "Book that one")
        # =========================================================
        selected_idx = new_entities.get("selected_index")
        explicit_pkg_id = new_entities.get("package_id")
        is_booking = (
            intent == "book_trip"
            or selected_idx is not None
            or any(w in t_low for w in ["book the second", "book that one", "book it", "book this", "book package", "i want to book"])
        )

        if is_booking:
            target_pkg = None
            if explicit_pkg_id:
                target_pkg = travel_catalog.get_by_id(explicit_pkg_id)
            elif selected_idx is not None and last_pkgs and 1 <= selected_idx <= len(last_pkgs):
                target_pkg = last_pkgs[selected_idx - 1]
            elif ctx.get("target_package_id"):
                target_pkg = travel_catalog.get_by_id(ctx["target_package_id"])
            elif last_pkgs:
                target_pkg = last_pkgs[0]
            elif ctx.get("destination"):
                matches = self.tool_search_packages(
                    origin=ctx.get("origin"),
                    destination=ctx.get("destination"),
                    limit=1
                )
                if matches:
                    target_pkg = matches[0]

            if target_pkg:
                ctx["target_package_id"] = target_pkg["id"]
                pax = ctx.get("passengers") or 1
                pax = max(1, min(int(pax), target_pkg.get("available_seats", 15)))

                travel_date = ctx.get("travel_date")
                if not travel_date:
                    default_date = time.strftime("%Y-%m-%d", time.localtime(time.time() + 10 * 86400))
                    travel_date = default_date

                # Authenticated booking creation
                if not user:
                    reply = (
                        f"### 🎟️ Selected Package: {target_pkg['title']}\n\n"
                        f"- **Destination:** {target_pkg['destination']}\n"
                        f"- **Origin:** {target_pkg.get('source', 'Chennai')}\n"
                        f"- **Category:** {target_pkg.get('category', 'Standard')}\n"
                        f"- **Rate:** ₹{target_pkg['amount']:,} per traveler\n"
                        f"- **Travelers:** {pax} Guest(s)\n"
                        f"- **Estimated Total:** ₹{(target_pkg['amount'] * pax * 1.05):,.2f} (incl. 5% GST)\n\n"
                        f"🔒 **Authentication Required**: Please **Sign In** to confirm this reservation and generate your VIP PNR Voucher."
                    )
                    return {
                        "intent": "book_trip",
                        "confidence": 0.95,
                        "entities": new_entities,
                        "context": ctx,
                        "reply": reply,
                        "packages": [target_pkg],
                        "requires_login": True,
                        "suggestions": ["Sign In Now", "View Package Itinerary", "Browse Other Packages"]
                    }

                # User is logged in -> Create Real Booking in Database!
                tools_called.extend(["checkAvailability", "calculatePrice", "createBooking"])
                try:
                    booking_res = booking_service.create_booking(
                        user_id=user["id"],
                        user_name=user["name"],
                        user_email=user["email"],
                        trip_id=target_pkg["id"],
                        travel_date=travel_date,
                        travelers_count=pax,
                        traveler_names=[user["name"]],
                        special_requests="Booked via Lyan Travels AI Concierge",
                        payment_method="UPI (Instant Simulation)",
                        departure_city=target_pkg.get("source", ctx.get("origin", "Chennai")),
                        source=target_pkg.get("source", ctx.get("origin", "Chennai"))
                    )

                    b_code = booking_res.get("booking_code") or booking_res.get("bookingCode")
                    tot = booking_res.get("total_amount") or booking_res.get("totalAmount")

                    reply = (
                        f"🎉 **Booking Confirmed by Lyan Travels AI Agent!**\n\n"
                        f"Congratulations {user['name']}! Your itinerary for **{target_pkg['title']}** has been created in our operational booking engine.\n\n"
                        f"**📋 Reservation Voucher & PNR Details:**\n"
                        f"- **Booking ID / PNR:** `{b_code}`\n"
                        f"- **Origin:** {target_pkg.get('source', 'Chennai')}\n"
                        f"- **Destination:** {target_pkg['destination']}\n"
                        f"- **Travel Date:** {travel_date}\n"
                        f"- **Travelers:** {pax} Guest(s)\n"
                        f"- **Category:** {target_pkg.get('category', 'Standard')}\n"
                        f"- **Total Amount:** ₹{tot:,.2f} (Inclusive of GST)\n"
                        f"- **Status:** Confirmed ✅\n\n"
                        f"✨ *This booking is now visible in your **Customer Dashboard**, **Admin Dashboard**, and **My Trips**!*"
                    )

                    self.record_conversation_log(
                        conv_id, user_name, user_email, "book_trip", confidence, ctx,
                        tools_called, True, False, msg, reply
                    )

                    return {
                        "intent": "book_trip",
                        "confidence": 0.98,
                        "entities": new_entities,
                        "context": ctx,
                        "booking": booking_res,
                        "booking_confirmed": True,
                        "booking_note": f"Confirmed #{b_code} for {target_pkg['title']}",
                        "reply": reply,
                        "packages": [target_pkg],
                        "suggestions": ["View My Trips", "What should I pack?", "Need flight details"]
                    }
                except Exception as e:
                    return {
                        "intent": "book_trip",
                        "confidence": 0.90,
                        "entities": new_entities,
                        "context": ctx,
                        "reply": f"⚠️ Booking could not be completed: {str(e)}. Please check available seats or use website booking.",
                        "packages": [target_pkg]
                    }

        # =========================================================
        # INTENT 6: SEARCH & FILTER PACKAGES (with Clarification Flow)
        # =========================================================
        tools_called.append("searchPackages")

        # Clarification Check (Section 15):
        # If user only said e.g. "I want to travel somewhere from Chennai next month" without budget or pax
        origin = ctx.get("origin")
        dest = ctx.get("destination")
        pax = ctx.get("passengers")
        budget = ctx.get("budget")
        cat = ctx.get("category")
        dest_type = ctx.get("destination_type")

        # Case A: User gave origin but no travellers or budget
        if origin and not dest and not pax and not budget:
            reply = (
                f"Fantastic! Departing from **{origin}** is very convenient with our extensive domestic and international network.\n\n"
                f"To find you the ideal travel package:\n"
                f"1. How many people are travelling?\n"
                f"2. What is your approximate total budget?\n\n"
                f"*(You can also let me know if you prefer beach, hills, cultural, or an international trip!)*"
            )
            return {
                "intent": "search_trips",
                "confidence": confidence,
                "entities": new_entities,
                "context": ctx,
                "reply": reply,
                "suggestions": ["2 people, under ₹50,000", "4 people, budget 1 lakh", "International from Chennai"]
            }

        # Case B: User gave origin & pax & budget, but no domestic/international choice
        if origin and pax and budget and not dest and not dest_type:
            # Provide sample options in both domestic and international
            pkgs = self.tool_search_packages(origin=origin, budget=budget, limit=3)
            ctx["last_packages"] = pkgs
            reply = (
                f"Got it! For **{pax} travelers** departing from **{origin}** with a budget around **₹{budget:,}**:\n\n"
                f"Do you prefer a **Domestic trip** (like Kerala backwaters or Goa) or an **International getaway** (such as Sri Lanka, Malaysia, or Thailand)?"
            )
            return {
                "intent": "search_trips",
                "confidence": confidence,
                "entities": new_entities,
                "context": ctx,
                "reply": reply,
                "packages": pkgs,
                "suggestions": ["Domestic travel", "International travel", "Beach destinations"]
            }

        # Case C: Standard search execution
        pkgs = self.tool_search_packages(
            origin=origin,
            destination=dest,
            destination_type=dest_type,
            budget=budget,
            category=cat,
            travel_type=ctx.get("travel_type"),
            limit=4
        )

        ctx["last_packages"] = pkgs

        # Format package recommendations
        if pkgs:
            p_lines = []
            for i, p in enumerate(pkgs, 1):
                p_lines.append(
                    f"**{i}. {p['title']}**\n"
                    f"   - 📍 **Route:** {p.get('source', 'Chennai')} ➔ {p['destination']} ({p.get('destination_type', 'Domestic')})\n"
                    f"   - 🏷️ **Category:** {p.get('category', 'Standard')} | ⭐ {p.get('rating', 4.8)}/5\n"
                    f"   - 💰 **Price:** ₹{p['amount']:,} per person\n"
                    f"   - 🚀 **Transport:** {p.get('transport', 'Flight/Cab')} | 🏨 {p.get('hotel_category', 'Deluxe')}"
                )

            pkg_summary = "\n\n".join(p_lines)
            reply = (
                f"Here are the top matching packages for your journey:\n\n"
                f"{pkg_summary}\n\n"
                f"💡 *You can say **\"Book the second one\"**, **\"Which one has breakfast?\"**, or **\"Show cheaper ones\"** to refine!*"
            )
        else:
            reply = (
                f"I searched our catalog for trips matching your preferences ({origin or 'Tamil Nadu'} ➔ {dest or 'Destinations'}), "
                f"but found no direct packages currently available under ₹{budget:,} if specified.\n\n"
                f"Would you like to increase the budget slightly, or look at nearby destinations such as Kerala, Goa, or Sri Lanka?"
            )

        self.record_conversation_log(
            conv_id, user_name, user_email, intent, confidence, ctx,
            tools_called, False, False, msg, reply
        )

        return {
            "intent": intent,
            "confidence": confidence,
            "entities": new_entities,
            "context": ctx,
            "reply": reply,
            "packages": pkgs,
            "suggestions": [
                "Book the first one",
                "Book the second one",
                "Which one has breakfast?",
                "Talk to human agent"
            ]
        }


# Singleton instance
gpt_travel_assistant = AITravelAgent()
