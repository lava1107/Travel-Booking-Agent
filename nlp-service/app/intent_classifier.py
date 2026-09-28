"""
Intent Classification Engine for Travel Agent Management System.
Uses TF-IDF Vectorization with n-gram features and a calibrated linear
classifier (Logistic Regression / Calibrated LinearSVC) trained on travel domain dialogues.
"""

from typing import Tuple, Dict
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
import numpy as np


TRAINING_DATA = [
    # search_trips
    ("Show me trips to Goa", "search_trips"),
    ("I want to visit Paris", "search_trips"),
    ("Find beach vacations", "search_trips"),
    ("Looking for travel packages to Kerala", "search_trips"),
    ("Search trips for 2 people", "search_trips"),
    ("Are there any packages available for Manali", "search_trips"),
    ("Plan a trip to Bali for next month", "search_trips"),
    ("I need a holiday package", "search_trips"),
    ("Find mountain trekking trips in Himalayas", "search_trips"),
    ("Looking for weekend getaways", "search_trips"),
    ("Show me destinations to travel", "search_trips"),
    ("What places can I visit this summer", "search_trips"),
    ("Search flights and hotels in Dubai", "search_trips"),
    ("Can you suggest family vacation spots", "search_trips"),
    ("Looking for a romantic honeymoon package in Maldives", "search_trips"),
    ("Show available tours to Rajasthan", "search_trips"),
    ("I want to explore Europe", "search_trips"),
    ("Take me somewhere warm with beaches", "search_trips"),
    ("Search adventure tours", "search_trips"),
    ("Find cultural tours in Japan", "search_trips"),
    ("Show me trips", "search_trips"),
    ("Looking for packages", "search_trips"),
    ("Goa", "search_trips"),
    ("Paris trip", "search_trips"),
    ("Dubai tour", "search_trips"),
    ("I want to travel somewhere from Chennai next month", "search_trips"),
    ("Find me a trip from Chennai to Goa for 4 people under 80000", "search_trips"),
    ("Where can 4 people travel from Coimbatore for less than 1 lakh", "search_trips"),
    ("I want a beach trip but not Maldives", "search_trips"),
    ("Give me a family-friendly trip", "search_trips"),
    ("Plan a 5-day trip from Chennai to Kerala", "search_trips"),
    ("What destinations are available from Madurai", "search_trips"),
    ("Show international trips from Chennai", "search_trips"),
    ("Show me beach destinations", "search_trips"),
    ("I want international", "search_trips"),
    ("Find trips from Coimbatore to Singapore", "search_trips"),
    ("Trichy to Sri Lanka packages", "search_trips"),

    # budget_inquiry / refine_budget
    ("What trips are under 20000", "budget_inquiry"),
    ("My budget is 15000", "budget_inquiry"),
    ("Find cheap trips under 10000 rupees", "budget_inquiry"),
    ("Looking for budget friendly travel", "budget_inquiry"),
    ("Is there anything affordable around 50000", "budget_inquiry"),
    ("What is the price range for Goa trips", "budget_inquiry"),
    ("Lowest price packages", "budget_inquiry"),
    ("Trips under 30k", "budget_inquiry"),
    ("Can I travel under 5000", "budget_inquiry"),
    ("What are the most economical destinations", "budget_inquiry"),
    ("How much does a trip to Switzerland cost", "budget_inquiry"),
    ("What is the cost of 4 days in Kerala", "budget_inquiry"),
    ("Show me budget trips", "budget_inquiry"),
    ("Under 15000", "budget_inquiry"),
    ("Under 25000", "budget_inquiry"),
    ("Within 50k", "budget_inquiry"),
    ("I have 30k and want to go somewhere from Chennai", "budget_inquiry"),
    ("Budget is 1 lakh", "budget_inquiry"),
    ("Make the budget 50k", "budget_inquiry"),
    ("Show me something cheaper", "budget_inquiry"),
    ("Which package is best for my budget", "budget_inquiry"),
    ("Around 60,000", "budget_inquiry"),
    ("Actually make it 60k", "budget_inquiry"),

    # book_trip
    ("I want to book this trip", "book_trip"),
    ("Book 2 tickets to Goa", "book_trip"),
    ("Reserve a seat for the Manali tour", "book_trip"),
    ("How do I book a vacation package", "book_trip"),
    ("Proceed to booking", "book_trip"),
    ("Book package for 4 passengers", "book_trip"),
    ("Confirm my reservation", "book_trip"),
    ("Can I book now", "book_trip"),
    ("Reserve this itinerary", "book_trip"),
    ("I would like to complete my booking", "book_trip"),
    ("Buy tickets for Paris trip", "book_trip"),
    ("Book flight and hotel", "book_trip"),
    ("Book package 1", "book_trip"),
    ("Book package 2 for 2 travelers", "book_trip"),
    ("Book package 3 for 2 people", "book_trip"),
    ("I want to book package 6", "book_trip"),
    ("Please book Maldives Overwater Villa for 2", "book_trip"),
    ("Book trip to Bali for next week", "book_trip"),
    ("Book the Swiss Alps package", "book_trip"),
    ("Reserve Goa luxury vacation for 2", "book_trip"),
    ("Confirm booking for this package", "book_trip"),
    ("Book now with AI agent", "book_trip"),
    ("Book 2 seats for Paris", "book_trip"),
    ("Book the second one", "book_trip"),
    ("Book that one", "book_trip"),
    ("Book it", "book_trip"),
    ("I want to book a Goa trip from Chennai for 3 people", "book_trip"),
    ("Proceed with the booking", "book_trip"),
    ("Confirm reservation for 4 travelers", "book_trip"),

    # cancel_booking
    ("I want to cancel my booking", "cancel_booking"),
    ("How do I cancel my trip", "cancel_booking"),
    ("Cancel reservation", "cancel_booking"),
    ("What is your refund policy for cancellation", "cancel_booking"),
    ("Can I get a refund if I cancel", "cancel_booking"),
    ("Drop my booking", "cancel_booking"),
    ("I need to revoke my reservation", "cancel_booking"),
    ("Cancel my ticket to Goa", "cancel_booking"),
    ("Cancel my Goa booking", "cancel_booking"),
    ("Please cancel booking TRV-2026-8542", "cancel_booking"),
    ("I want to cancel my holiday", "cancel_booking"),

    # booking_status
    ("What is my booking status", "booking_status"),
    ("Check my booking", "booking_status"),
    ("When is my next trip", "booking_status"),
    ("Show my previous bookings", "booking_status"),
    ("Do I have any active trips", "booking_status"),
    ("Show my bookings", "booking_status"),
    ("Status of my reservation", "booking_status"),
    ("Track my booking", "booking_status"),

    # payment_status
    ("How much have I paid", "payment_status"),
    ("What is my payment status", "payment_status"),
    ("Did my payment go through", "payment_status"),
    ("Is payment confirmed", "payment_status"),
    ("Make payment for my booking", "payment_status"),
    ("Pay remaining balance", "payment_status"),

    # view_itinerary
    ("Show my itinerary", "view_itinerary"),
    ("What is the day by day plan", "view_itinerary"),
    ("Which one has breakfast", "view_itinerary"),
    ("Does the second package include breakfast", "view_itinerary"),
    ("What activities are included", "view_itinerary"),
    ("Show hotel details", "view_itinerary"),

    # support_handoff
    ("I want to talk to someone", "support_handoff"),
    ("Talk to human agent", "support_handoff"),
    ("Connect me to a real person", "support_handoff"),
    ("Customer care executive please", "support_handoff"),
    ("Speak with human consultant", "support_handoff"),
    ("I need a travel agent to help me", "support_handoff"),
    ("Human help", "support_handoff"),

    # compare_packages
    ("Compare these packages", "compare_packages"),
    ("Which package is better", "compare_packages"),
    ("What is the difference between these trips", "compare_packages"),
    ("Compare package 1 and 2", "compare_packages"),

    # destination_info
    ("Tell me about Goa", "destination_info"),
    ("What is the best time to visit Manali", "destination_info"),
    ("Is Paris good for couples", "destination_info"),
    ("What are popular attractions in Dubai", "destination_info"),
    ("Tell me about Kerala backwaters", "destination_info"),
    ("Weather in Shimla right now", "destination_info"),
    ("What to do in Bali", "destination_info"),
    ("Information about Switzerland tourism", "destination_info"),
    ("Best places to eat in Rome", "destination_info"),
    ("Is Maldives safe for solo travelers", "destination_info"),

    # greeting
    ("Hello", "greeting"),
    ("Hi", "greeting"),
    ("Hey there", "greeting"),
    ("Good morning", "greeting"),
    ("Good afternoon", "greeting"),
    ("Good evening", "greeting"),
    ("Greetings", "greeting"),
    ("Hey", "greeting"),
    ("Hi assistant", "greeting"),
    ("Hello bot", "greeting"),
    ("Namaste", "greeting"),

    # help
    ("What can you do", "help"),
    ("Help", "help"),
    ("How does this work", "help"),
    ("What are your features", "help"),
    ("Help me plan", "help"),
    ("Guide me", "help"),
]


class IntentClassifier:
    """Classifies user travel query into intent categories using TF-IDF + Logistic Regression."""

    def __init__(self):
        self.pipeline: Pipeline = None
        self.is_trained: bool = False
        self.train()

    def train(self):
        texts = [x[0] for x in TRAINING_DATA]
        labels = [x[1] for x in TRAINING_DATA]

        self.pipeline = Pipeline([
            ("tfidf", TfidfVectorizer(
                ngram_range=(1, 3),
                lowercase=True,
                max_features=5000,
                sublinear_tf=True
            )),
            ("clf", LogisticRegression(
                C=10.0,
                max_iter=500,
                class_weight="balanced",
                random_state=42
            ))
        ])

        self.pipeline.fit(texts, labels)
        self.is_trained = True

    def predict(self, text: str) -> Tuple[str, float, Dict[str, float]]:
        """
        Classifies incoming user query into an intent.
        Returns:
            (best_intent, confidence, all_probabilities)
        """
        if not self.is_trained or not text.strip():
            return ("help", 0.5, {})

        clean_text = text.strip()
        probs = self.pipeline.predict_proba([clean_text])[0]
        classes = self.pipeline.classes_

        best_idx = int(np.argmax(probs))
        best_intent = str(classes[best_idx])
        confidence = float(probs[best_idx])

        # Semantic rule overrides for safety
        t_low = clean_text.lower()
        if any(w in t_low for w in ["cancel my", "cancel booking", "cancel reservation"]):
            best_intent = "cancel_booking"
            confidence = max(confidence, 0.95)
        elif any(w in t_low for w in ["booking status", "status of my booking", "when is my next trip", "show my bookings"]):
            best_intent = "booking_status"
            confidence = max(confidence, 0.95)
        elif any(w in t_low for w in ["talk to someone", "human agent", "talk to human", "speak with agent", "real person"]):
            best_intent = "support_handoff"
            confidence = max(confidence, 0.98)
        elif any(w in t_low for w in ["book the second", "book that one", "book it", "book package"]):
            best_intent = "book_trip"
            confidence = max(confidence, 0.95)

        class_prob_map = {str(c): float(p) for c, p in zip(classes, probs)}
        return (best_intent, round(confidence, 4), class_prob_map)


# Singleton instance
intent_classifier = IntentClassifier()
