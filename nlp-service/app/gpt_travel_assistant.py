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
        ctx["conversation_id"] = conv_id

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
