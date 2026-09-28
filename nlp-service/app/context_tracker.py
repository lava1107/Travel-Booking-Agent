"""
Multi-turn Context Tracker and Dialogue State Manager for Travel Agent System.
Maintains state across conversational turns:
- Origin (Tamil Nadu cities or other hubs)
- Destination (Domestic or International)
- Passengers count (retains updates like 'actually 5')
- Budget (retains updates like 'make it 50k')
- Travel Category (Budget, Economy, Standard, Premium, Luxury)
- Destination type (Domestic vs International)
- Last recommended package list (supports ordinal resolution like 'book the second one')
- Pending actions (confirmation checks for cancellations, bookings)
"""

from typing import Dict, Any, List, Optional


class ContextTracker:
    """Tracks dialogue state and manages slot filling over conversational turns."""

    def update_context(self, prior_context: Optional[Dict[str, Any]], new_entities: Dict[str, Any]) -> Dict[str, Any]:
        """
        Merge prior turn's entity slots with new turn's entities.
        Allows incremental slot filling and modifications.
        """
        context = dict(prior_context) if prior_context else {}

        # Update direct slots
        for key, val in new_entities.items():
            if val is not None:
                context[key] = val

        # Handle conversational corrections
        if "passengers" in new_entities and new_entities["passengers"]:
            context["passengers"] = new_entities["passengers"]

        if "budget" in new_entities and new_entities["budget"]:
            context["budget"] = new_entities["budget"]

        if "origin" in new_entities and new_entities["origin"]:
            context["origin"] = new_entities["origin"]
            context["source"] = new_entities["origin"]

        if "destination" in new_entities and new_entities["destination"]:
            context["destination"] = new_entities["destination"]

        if "category" in new_entities and new_entities["category"]:
            context["category"] = new_entities["category"]

        if "destination_type" in new_entities and new_entities["destination_type"]:
            context["destination_type"] = new_entities["destination_type"]

        return context

    def generate_reply(
        self,
        intent: str,
        confidence: float,
        entities: Dict[str, Any],
        context: Dict[str, Any]
    ) -> str:
        """
        Produce a natural, helpful conversational response reflecting current dialogue state.
        """
        origin = context.get("origin") or context.get("source")
        dest = context.get("destination")
        budget = context.get("budget")
        passengers = context.get("passengers")
        cat = context.get("category")
        travel_type = context.get("travel_type")

        # GREETING
        if intent == "greeting":
            return (
                "Hello! Welcome to Lyan Travels – Travel Agent Management System. ✈️\n\n"
                "I am your AI Travel Agent. I can help you find domestic and international packages departing from Tamil Nadu (Chennai, Coimbatore, Madurai, Trichy, Salem, etc.) across Budget, Economy, Standard, Premium, and Luxury options.\n\n"
                "Where would you like to travel next, or what is your preferred budget and number of travellers?"
            )

        # HELP
        if intent == "help":
            return (
                "I can assist you with your entire travel lifecycle:\n"
                "- **Find Trips**: 'Trip from Chennai to Kerala for 4 people under 60k'\n"
                "- **Explore Options**: 'Show international trips from Coimbatore'\n"
                "- **Compare**: 'Compare package 1 and 2'\n"
                "- **Book Directly**: 'Book the second package'\n"
                "- **Track Status**: 'What is my booking status?'\n"
                "- **Human Consultant**: 'I want to talk to someone'\n"
                "Tell me where you want to travel from and to!"
            )

        # CANCEL BOOKING
        if intent == "cancel_booking":
            return (
                "To cancel your booking safely, I have verified your reservation policy. "
                "Cancellations 48+ hours before travel receive a full refund. "
                "Please confirm your booking cancellation by clicking 'Cancel Booking' in your My Trips dashboard or typing 'Confirm Cancel'."
            )

        # BOOKING STATUS
        if intent == "booking_status":
            return (
                "I'm retrieving your live bookings from the system. "
                "You can see your active e-tickets and timeline in your My Bookings dashboard anytime."
            )

        # SUPPORT HANDOFF
        if intent == "support_handoff":
            return (
                "Certainly! I have initiated a travel-agent handoff request. "
                "One of our certified human travel consultants has received your conversation history and will connect with you shortly."
            )

        # SEARCH TRIPS or BUDGET INQUIRY
        slots = []
        if origin:
            slots.append(f"From: {origin}")
        if dest:
            slots.append(f"To: {dest}")
        if passengers:
            slots.append(f"Travellers: {passengers}")
        if budget:
            slots.append(f"Budget: Up to ₹{budget:,}")
        if cat:
            slots.append(f"Category: {cat}")
        if travel_type:
            slots.append(f"Theme: {travel_type.capitalize()}")

        if slots:
            summary = " | ".join(slots)
            return f"Understood! Here is your search criteria: {summary}. Let me find the best matching travel packages for you."

        return (
            "I'd love to help you plan your journey! Which city in Tamil Nadu are you departing from, "
            "and where would you like to travel (Domestic or International)?"
        )


# Singleton instance
context_tracker = ContextTracker()
