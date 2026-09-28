"""
Named Entity Recognition (NER) and Slot Extraction Engine for Travel Domain.
Integrates SpaCy pipeline with specialized travel domain patterns for:
- Origins (Tamil Nadu focus: Chennai, Coimbatore, Madurai, Trichy, Salem, Tirunelveli, etc.)
- Destinations (Domestic: Kerala, Goa, Rajasthan, Kashmir, Himachal, Andaman, etc.
                International: Maldives, Singapore, Dubai, Bali, Thailand, Malaysia, Sri Lanka, etc.)
- Budget (currency amounts, "under 50k", "less than 1 lakh", "budget 80,000", etc.)
- Passengers / Group size ("4 people", "family of 5", "couple", "solo", "actually 5")
- Categories (Budget, Economy, Standard, Premium, Luxury)
- Theme / Travel type (Beach, Adventure, Cultural, Honeymoon, Wildlife, Weekend, etc.)
- Ordinals & relative references ("the second one", "package 2", "3rd one", "that one")
- Booking identifiers (PNR / Booking codes)
- Meal and amenity requirements (e.g. "breakfast included")
"""

import re
from typing import Dict, Any, List, Optional
import spacy

try:
    nlp = spacy.load("en_core_web_sm")
except Exception:
    nlp = None

TAMIL_NADU_ORIGINS = {
    "chennai": "Chennai",
    "coimbatore": "Coimbatore",
    "madurai": "Madurai",
    "tiruchirappalli": "Tiruchirappalli",
    "trichy": "Tiruchirappalli",
    "salem": "Salem",
    "tirunelveli": "Tirunelveli",
    "thanjavur": "Thanjavur",
    "erode": "Erode",
    "vellore": "Vellore",
    "hosur": "Hosur",
    "puducherry": "Puducherry",
    "pondicherry": "Puducherry",
    "mumbai": "Mumbai",
    "delhi": "Delhi",
    "bangalore": "Bengaluru",
    "bengaluru": "Bengaluru",
    "hyderabad": "Hyderabad",
    "kolkata": "Kolkata",
    "kochi": "Kochi"
}

KNOWN_DESTINATIONS = {
    "goa": "Goa",
    "kerala": "Kerala",
    "munnar": "Kerala",
    "alleppey": "Kerala",
    "wayanad": "Kerala",
    "manali": "Manali",
    "shimla": "Himachal Pradesh",
    "himachal": "Himachal Pradesh",
    "kashmir": "Kashmir",
    "srinagar": "Kashmir",
    "gulmarg": "Kashmir",
    "rajasthan": "Rajasthan",
    "jaipur": "Rajasthan",
    "udaipur": "Rajasthan",
    "jodhpur": "Rajasthan",
    "jaisalmer": "Rajasthan",
    "andaman": "Andaman & Nicobar",
    "havelock": "Andaman & Nicobar",
    "ooty": "Ooty",
    "kodaikanal": "Kodaikanal",
    "coorg": "Karnataka",
    "mysore": "Karnataka",
    "karnataka": "Karnataka",
    "hyderabad": "Hyderabad",
    "delhi": "Delhi",
    "agra": "Agra",
    "mumbai": "Mumbai",
    "ladakh": "Ladakh",
    "leh": "Ladakh",
    "darjeeling": "West Bengal",
    "sikkim": "Sikkim",
    "gangtok": "Sikkim",
    "varanasi": "Varanasi",
    "rishikesh": "Uttarakhand",
    "meghalaya": "Meghalaya",
    "shillong": "Meghalaya",
    "tirupati": "Andhra Pradesh",
    # International
    "maldives": "Maldives",
    "singapore": "Singapore",
    "malaysia": "Malaysia",
    "kuala lumpur": "Malaysia",
    "thailand": "Thailand",
    "bangkok": "Thailand",
    "phuket": "Thailand",
    "dubai": "Dubai / UAE",
    "uae": "Dubai / UAE",
    "sri lanka": "Sri Lanka",
    "colombo": "Sri Lanka",
    "bali": "Bali, Indonesia",
    "indonesia": "Bali, Indonesia",
    "vietnam": "Vietnam",
    "hanoi": "Vietnam",
    "nepal": "Nepal",
    "kathmandu": "Nepal",
    "bhutan": "Bhutan",
    "europe": "Europe",
    "paris": "Paris",
    "switzerland": "Switzerland",
    "swiss": "Switzerland",
    "london": "London",
    "tokyo": "Tokyo",
    "japan": "Japan"
}

TRAVEL_TYPES = {
    "beach": ["beach", "sea", "ocean", "coastal", "island", "shores"],
    "adventure": ["adventure", "trekking", "hiking", "rafting", "camping", "scuba"],
    "honeymoon": ["honeymoon", "romantic", "couple"],
    "family": ["family", "kids", "parents", "children"],
    "heritage": ["heritage", "cultural", "history", "historical", "monument", "temple", "pilgrimage", "spiritual"],
    "wildlife": ["wildlife", "safari", "nature", "jungle", "national park"],
    "mountain": ["mountain", "hill station", "snow", "himalayas", "valley"],
    "weekend": ["weekend", "getaway", "short trip"]
}

PACKAGE_CATEGORIES = {
    "budget": ["budget", "cheap", "low cost", "economical", "pocket friendly", "affordable"],
    "economy": ["economy", "saver", "standard budget"],
    "standard": ["standard", "mid range", "regular", "normal"],
    "premium": ["premium", "deluxe", "executive", "comfort plus"],
    "luxury": ["luxury", "5 star", "vip", "presidential", "ultra luxury"]
}

ORDINAL_MAP = {
    "first": 1,
    "1st": 1,
    "one": 1,
    "second": 2,
    "2nd": 2,
    "two": 2,
    "third": 3,
    "3rd": 3,
    "three": 3,
    "fourth": 4,
    "4th": 4,
    "last": -1
}


class EntityExtractor:
    """Extracts domain-specific travel entities and slots from natural language."""

    def __init__(self):
        self.nlp = nlp

    def extract_origin(self, text: str) -> Optional[str]:
        """Extract travel origin, prioritizing Tamil Nadu cities."""
        t = text.lower()
        # Explicit patterns: from Chennai, departing Coimbatore, out of Madurai
        pattern = r"\b(?:from|departing(?:\s+from)?|leaving(?:\s+from)?|out of|origin(?:ating)?(?:\s+from)?)\s+([a-zA-Z\s]+?)(?:\s+(?:to|for|towards|next|under|on|in|with|for)|\b|$)"
        match = re.search(pattern, t)
        if match:
            candidate = match.group(1).strip()
            for key, name in TAMIL_NADU_ORIGINS.items():
                if key in candidate:
                    return name

        # Direct token scan if preceding words mention travel from
        for key, name in TAMIL_NADU_ORIGINS.items():
            if re.search(rf"\bfrom\s+{re.escape(key)}\b", t):
                return name

        # General occurrence of TN city if sentence implies starting point
        if any(w in t for w in ["flight from", "train from", "bus from", "drive from"]):
            for key, name in TAMIL_NADU_ORIGINS.items():
                if key in t:
                    return name

        return None

    def extract_destination(self, text: str, doc=None) -> Optional[str]:
        """Extract travel destination (domestic or international)."""
        t = text.lower()

        # Handle 'to X', 'visiting X', 'trip to X'
        to_pattern = r"\b(?:to|in|visit(?:ing)?|towards|for)\s+([a-zA-Z\s]+?)(?:\s+(?:from|under|for|with|on|in|\d)|\b|$)"
        match = re.search(to_pattern, t)
        if match:
            cand = match.group(1).strip()
            for key, name in KNOWN_DESTINATIONS.items():
                if key == cand or f" {key} " in f" {cand} ":
                    return name

        # Direct dictionary match
        for key, name in KNOWN_DESTINATIONS.items():
            if re.search(rf"\b{re.escape(key)}\b", t):
                # Ensure it's not the origin (e.g. 'from Chennai')
                if not re.search(rf"\bfrom\s+{re.escape(key)}\b", t):
                    return name

        # SpaCy NER fallback for GPE/LOC
        if doc is not None:
            for ent in doc.ents:
                if ent.label_ in {"GPE", "LOC"}:
                    clean_ent = ent.text.strip().title()
                    if clean_ent.lower() not in {"today", "tomorrow", "next week", "summer", "winter", "tamil nadu", "india"}:
                        return clean_ent

        return None

    def extract_budget(self, text: str) -> Optional[Dict[str, Any]]:
        """
        Extract budget amount from text.
        Handles 'under 15000', 'below 20k', 'budget is 30,000 INR', '1 lakh', '1.5 lakhs', '50k'.
        """
        t = text.lower()

        # Handle Lakhs e.g. "1 lakh", "1.5 lakhs", "under 2 lakh"
        lakh_pattern = r"(?:under|below|less than|max|within|budget of|budget is|around|upto)?\s*[\$₹rs\.]*\s*(\d+(?:\.\d+)?)\s*(?:lakhs?|lac|lacs?)\b"
        match_lakh = re.search(lakh_pattern, t)
        if match_lakh:
            amount = int(float(match_lakh.group(1)) * 100000)
            return {"max_budget": amount, "currency": "INR", "raw": match_lakh.group(0).strip()}

        # Match e.g. 15k, 25k, 50k, 80k
        k_pattern = r"(?:under|below|less than|max|within|budget of|budget is|around|upto)?\s*[\$₹rs\.]*\s*(\d+(?:\.\d+)?)\s*k\b"
        match_k = re.search(k_pattern, t)
        if match_k:
            amount = int(float(match_k.group(1)) * 1000)
            return {"max_budget": amount, "currency": "INR", "raw": match_k.group(0).strip()}

        # Match numbers e.g. 15000, 15,000, 20000
        num_pattern = r"(?:under|below|less than|max|within|budget of|budget is|around|upto|approx)?\s*[\$₹rs\.]*\s*(\d{1,3}(?:,\d{3})+|\d{4,7})(?:\s*(?:inr|rs|rupees|bucks))?"
        match_num = re.search(num_pattern, t)
        if match_num:
            raw_str = match_num.group(1).replace(",", "")
            amount = int(raw_str)
            # Filter out obvious years (like 2024, 2025, 2026, 2027) unless preceded by budget keyword
            if amount in {2024, 2025, 2026, 2027}:
                if not re.search(r"(?:budget|cost|price|rupees|inr|rs)", match_num.group(0), re.IGNORECASE):
                    return None
            return {"max_budget": amount, "currency": "INR", "raw": match_num.group(0).strip()}

        return None

    def extract_passengers(self, text: str) -> Optional[int]:
        """Extract number of passengers/people, including conversational updates like 'actually 5'."""
        t = text.lower()
        if "solo" in t or "alone" in t or "for myself" in t:
            return 1
        if "couple" in t:
            return 2

        # Conversational correction: "actually 5", "make it 4", "change to 3"
        correct_pattern = r"\b(?:actually|make it|change to|update to)\s+(\d+)\b"
        match_correct = re.search(correct_pattern, t)
        if match_correct:
            return int(match_correct.group(1))

        # Explicit passenger count
        pattern = r"\b(\d+)\s*(?:people|persons|passengers|pax|members|travelers|travellers|seats|adults)\b"
        match = re.search(pattern, t)
        if match:
            return int(match.group(1))

        family_pattern = r"\bfamily of\s*(\d+)\b"
        match_fam = re.search(family_pattern, t)
        if match_fam:
            return int(match_fam.group(1))

        # Single number response if short query e.g. "4", "2", "3"
        if re.fullmatch(r"\s*\d{1,2}\s*", t):
            val = int(t.strip())
            if 1 <= val <= 30:
                return val

        return None

    def extract_travel_type(self, text: str) -> Optional[str]:
        """Detect travel style / theme."""
        t = text.lower()
        for travel_type, keywords in TRAVEL_TYPES.items():
            for kw in keywords:
                if re.search(rf"\b{re.escape(kw)}\b", t):
                    return travel_type
        return None

    def extract_package_category(self, text: str) -> Optional[str]:
        """Detect package category: Budget, Economy, Standard, Premium, Luxury."""
        t = text.lower()
        # Negative luxury ("not luxury", "don't want luxury", "not very expensive luxury")
        if "not luxury" in t or "don't want luxury" in t or "no luxury" in t or "not a luxury" in t:
            return "Standard"

        for cat_name, keywords in PACKAGE_CATEGORIES.items():
            for kw in keywords:
                if re.search(rf"\b{re.escape(kw)}\b", t):
                    return cat_name.capitalize()
        return None

    def extract_destination_type(self, text: str) -> Optional[str]:
        """Detect domestic vs international."""
        t = text.lower()
        if "international" in t or "abroad" in t or "foreign" in t:
            return "International"
        if "domestic" in t or "within india" in t or "inside india" in t:
            return "Domestic"
        return None

    def extract_ordinal_selection(self, text: str) -> Optional[int]:
        """Detect ordinal selection: 'book the second one', 'select package 2', 'first one'."""
        t = text.lower()
        pattern = r"\b(?:book|select|choose|take)?\s*(?:the)?\s*(first|1st|second|2nd|third|3rd|fourth|4th|package\s*1|package\s*2|package\s*3)\b"
        match = re.search(pattern, t)
        if match:
            phrase = match.group(1).replace("package", "").strip()
            if phrase in ORDINAL_MAP:
                return ORDINAL_MAP[phrase]
            if phrase.isdigit():
                return int(phrase)

        # "the second one", "that one"
        if "second one" in t or "second package" in t or "2nd one" in t:
            return 2
        if "first one" in t or "first package" in t or "1st one" in t:
            return 1
        if "third one" in t or "third package" in t or "3rd one" in t:
            return 3
        if "book that one" in t or "book it" in t:
            return 1

        return None

    def extract_duration(self, text: str) -> Optional[str]:
        """Extract duration (e.g. '5 days', 'a week', 'weekend')."""
        t = text.lower()
        if "weekend" in t:
            return "3 days (weekend)"

        pattern = r"\b(\d+)\s*(?:days?|nights?|weeks?)\b"
        match = re.search(pattern, t)
        if match:
            return match.group(0)

        if "a week" in t or "one week" in t:
            return "7 days"

        return None

    def extract_package_id(self, text: str) -> Optional[int]:
        """Extract explicit package ID e.g. 'package 1', 'pkg 3', 'package #5'."""
        pattern = r"\b(?:package|pkg|trip)\s*(?:#|no\.?|id)?\s*(\d+)\b"
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            return int(match.group(1))
        return None

    def extract_booking_code(self, text: str) -> Optional[str]:
        """Extract booking reference code e.g. TRV-2026-1234."""
        match = re.search(r"\b(TRV-\d{4}-\d{4,6})\b", text, re.IGNORECASE)
        if match:
            return match.group(1).upper()
        return None

    def extract_travel_date(self, text: str) -> Optional[str]:
        """Extract travel date in ISO or DD/MM/YYYY or text month format."""
        iso_match = re.search(r"\b(\d{4}-\d{2}-\d{2})\b", text)
        if iso_match:
            return iso_match.group(1)
        d_match = re.search(r"\b(\d{1,2})[/-](\d{1,2})[/-](\d{4})\b", text)
        if d_match:
            d, m, y = d_match.groups()
            return f"{y}-{int(m):02d}-{int(d):02d}"

        # Month text e.g. 'October 12', '12th October'
        month_pattern = r"\b(?:on\s+)?([A-Za-z]+)\s+(\d{1,2})(?:st|nd|rd|th)?\b"
        match_m = re.search(month_pattern, text)
        if match_m:
            month_str, day_str = match_m.groups()
            months = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"]
            m_low = month_str.lower()
            for idx, m_name in enumerate(months, 1):
                if m_low.startswith(m_name[:3]):
                    return f"2026-{idx:02d}-{int(day_str):02d}"

        return None

    def extract_entities(self, text: str) -> Dict[str, Any]:
        """Extract all entities and slots from text input."""
        doc = self.nlp(text) if self.nlp else None
        entities: Dict[str, Any] = {}

        origin = self.extract_origin(text)
        if origin:
            entities["origin"] = origin
            entities["source"] = origin

        dest = self.extract_destination(text, doc)
        if dest:
            entities["destination"] = dest

        budget = self.extract_budget(text)
        if budget:
            entities["budget"] = budget["max_budget"]

        passengers = self.extract_passengers(text)
        if passengers:
            entities["passengers"] = passengers

        travel_type = self.extract_travel_type(text)
        if travel_type:
            entities["travel_type"] = travel_type

        cat = self.extract_package_category(text)
        if cat:
            entities["category"] = cat

        dest_type = self.extract_destination_type(text)
        if dest_type:
            entities["destination_type"] = dest_type

        ordinal = self.extract_ordinal_selection(text)
        if ordinal is not None:
            entities["selected_index"] = ordinal

        duration = self.extract_duration(text)
        if duration:
            entities["duration"] = duration

        pkg_id = self.extract_package_id(text)
        if pkg_id:
            entities["package_id"] = pkg_id

        booking_code = self.extract_booking_code(text)
        if booking_code:
            entities["booking_code"] = booking_code

        travel_date = self.extract_travel_date(text)
        if travel_date:
            entities["travel_date"] = travel_date

        if "breakfast" in text.lower():
            entities["has_breakfast"] = True

        return entities


# Singleton instance
entity_extractor = EntityExtractor()
