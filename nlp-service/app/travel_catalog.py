import os
import json
from typing import List, Dict, Any, Optional

DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "data")
os.makedirs(DATA_DIR, exist_ok=True)
PACKAGES_FILE = os.path.join(DATA_DIR, "packages.json")

INITIAL_PACKAGES = [
    {
        "id": 1,
        "agent_id": 2,
        "agent_name": "Sarah Connor",
        "title": "Sun, Sand & Palms: Goa Luxury Beach Vacation",
        "source": "Mumbai",
        "destination": "Goa",
        "amount": 18499.0,
        "rating": 4.9,
        "transport": "Flight + Private Cab",
        "duration_days": 5,
        "available_seats": 18,
        "category": "Beach",
        "description": "Experience tropical paradise with North Goa beach clubs, serene South Goa shores, private sunset cruise on the Mandovi River, and water sports at Calangute.",
        "image_url": "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80",
        "is_featured": True
    },
    {
        "id": 2,
        "agent_id": 2,
        "agent_name": "Sarah Connor",
        "title": "Royal Rajasthan: Jaipur, Jodhpur & Udaipur Palaces",
        "source": "Delhi",
        "destination": "Jaipur & Udaipur, Rajasthan",
        "amount": 24999.0,
        "rating": 4.8,
        "transport": "Luxury AC Volvo + Private Cab",
        "duration_days": 6,
        "available_seats": 14,
        "category": "Cultural",
        "description": "Walk through grand palaces and royal heritage forts: Amber Fort, Hawa Mahal, Lake Pichola boat ride, City Palace Udaipur, and authentic Rajasthani Thali dinner.",
        "image_url": "https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=800&q=80",
        "is_featured": True
    },
    {
        "id": 3,
        "agent_id": 2,
        "agent_name": "Sarah Connor",
        "title": "Kashmir Heaven on Earth: Srinagar, Gulmarg & Pahalgam",
        "source": "Delhi",
        "destination": "Srinagar & Gulmarg, Kashmir",
        "amount": 29500.0,
        "rating": 5.0,
        "transport": "Flight + Shikara & Private Cab",
        "duration_days": 6,
        "available_seats": 10,
        "category": "Honeymoon",
        "description": "Stay in a romantic heritage wooden houseboat on Dal Lake, take a tranquil Shikara ride, ride the highest Gulmarg Gondola, and stroll through saffron fields of Pahalgam.",
        "image_url": "https://images.unsplash.com/photo-1595815771614-ade9d652a65d?auto=format&fit=crop&w=800&q=80",
        "is_featured": True
    },
    {
        "id": 4,
        "agent_id": 2,
        "agent_name": "Sarah Connor",
        "title": "Kerala God's Own Country: Alleppey Backwaters & Munnar Hills",
        "source": "Bengaluru",
        "destination": "Munnar & Alleppey, Kerala",
        "amount": 21999.0,
        "rating": 4.9,
        "transport": "Deluxe Houseboat + AC Cab",
        "duration_days": 5,
        "available_seats": 15,
        "category": "Luxury",
        "description": "Cruise through peaceful palm-lined backwaters in an overnight luxury houseboat, tour lush green tea plantations in misty Munnar, and visit spice gardens.",
        "image_url": "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=800&q=80",
        "is_featured": True
    },
    {
        "id": 5,
        "agent_id": 2,
        "agent_name": "Sarah Connor",
        "title": "Manali Snow Adventure & Rohtang Pass Expedition",
        "source": "Delhi",
        "destination": "Manali & Rohtang Pass, Himachal",
        "amount": 15499.0,
        "rating": 4.8,
        "transport": "Volvo Bus + 4x4 Mountain Cab",
        "duration_days": 5,
        "available_seats": 20,
        "category": "Adventure",
        "description": "Witness majestic snow-covered Himalayan peaks, paraglide over Solang Valley, drive through the Atal Tunnel to Sissu, and explore quaint cafes in Old Manali.",
        "image_url": "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=800&q=80",
        "is_featured": True
    },
    {
        "id": 6,
        "agent_id": 2,
        "agent_name": "Sarah Connor",
        "title": "Spiritual Varanasi: Ganga Evening Aarti & Sarnath Odyssey",
        "source": "Kolkata",
        "destination": "Varanasi, Uttar Pradesh",
        "amount": 11999.0,
        "rating": 4.9,
        "transport": "Vande Bharat Express Train + Private Cab",
        "duration_days": 4,
        "available_seats": 22,
        "category": "Cultural",
        "description": "Witness the divine Ganga Maha Aarti at Dashashwamedh Ghat, take a sunrise boat tour along historic ghats, visit Kashi Vishwanath corridor and ancient Sarnath.",
        "image_url": "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=800&q=80",
        "is_featured": True
    },
    {
        "id": 7,
        "agent_id": 2,
        "agent_name": "Sarah Connor",
        "title": "Andaman Emerald Islands: Havelock Radhanagar & Scuba Diving",
        "source": "Chennai",
        "destination": "Port Blair & Havelock Island, Andaman",
        "amount": 38500.0,
        "rating": 4.9,
        "transport": "Flight + High-Speed Catamaran",
        "duration_days": 6,
        "available_seats": 12,
        "category": "Beach",
        "description": "Relax on Radhanagar Beach (Asia's best beach), explore coral reefs with certified PADI scuba diving at Elephant Beach, and experience Cellular Jail sound & light show.",
        "image_url": "https://images.unsplash.com/photo-1589308078059-be1415eab4c3?auto=format&fit=crop&w=800&q=80",
        "is_featured": True
    },
    {
        "id": 8,
        "agent_id": 2,
        "agent_name": "Sarah Connor",
        "title": "Golden Triangle Splendor: Delhi, Agra Taj Mahal & Jaipur",
        "source": "Delhi",
        "destination": "Agra & Jaipur",
        "amount": 14500.0,
        "rating": 4.7,
        "transport": "AC Express Train + Chauffeur Cab",
        "duration_days": 4,
        "available_seats": 25,
        "category": "Cultural",
        "description": "Marvel at the world wonder Taj Mahal at sunrise, explore Agra Fort, Fatehpur Sikri, and discover the vibrant bazaars and pink palaces of Jaipur.",
        "image_url": "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=800&q=80",
        "is_featured": False
    },
    {
        "id": 9,
        "agent_id": 2,
        "agent_name": "Sarah Connor",
        "title": "Darjeeling & Gangtok: Kanchenjunga Vistas & Himalayan Monasteries",
        "source": "Kolkata",
        "destination": "Darjeeling & Gangtok, Sikkim",
        "amount": 23500.0,
        "rating": 4.8,
        "transport": "Heritage Toy Train + Mountain SUV",
        "duration_days": 6,
        "available_seats": 16,
        "category": "Luxury",
        "description": "Catch golden sunrise over Mt. Kanchenjunga from Tiger Hill, ride the Darjeeling Himalayan Railway toy train, explore Rumtek Monastery, and visit glacial Tsomgo Lake.",
        "image_url": "https://images.unsplash.com/photo-1622308644420-a937a07be28a?auto=format&fit=crop&w=800&q=80",
        "is_featured": False
    },
    {
        "id": 10,
        "agent_id": 2,
        "agent_name": "Sarah Connor",
        "title": "Nilgiri Blue Mountain Escape: Ooty, Coonoor & Tea Estates",
        "source": "Bengaluru",
        "destination": "Ooty & Coonoor, Tamil Nadu",
        "amount": 16200.0,
        "rating": 4.8,
        "transport": "Nilgiri Mountain Railway + AC Cab",
        "duration_days": 4,
        "available_seats": 18,
        "category": "Adventure",
        "description": "Ride the UNESCO Nilgiri Mountain Toy Train, stroll through aromatic eucalyptus forests, visit Doddabetta Peak, Sims Park Coonoor, and taste homemade Ooty chocolates.",
        "image_url": "https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?auto=format&fit=crop&w=800&q=80",
        "is_featured": False
    }
]

class TravelCatalog:
    def __init__(self):
        self.packages: Dict[int, Dict[str, Any]] = {}
        self.next_id = 1
        self.load_packages()

    def load_packages(self):
        if os.path.exists(PACKAGES_FILE):
            try:
                with open(PACKAGES_FILE, 'r', encoding='utf-8') as f:
                    raw = json.load(f)
                    self.packages = {int(p["id"]): p for p in raw}
                    if self.packages:
                        self.next_id = max(self.packages.keys()) + 1
                    return
            except Exception as e:
                print(f"Failed to load packages.json: {e}")

        self.packages = {p["id"]: p for p in INITIAL_PACKAGES}
        self.next_id = max(self.packages.keys()) + 1
        self.save_packages()

    def save_packages(self):
        try:
            with open(PACKAGES_FILE, 'w', encoding='utf-8') as f:
                json.dump(list(self.packages.values()), f, indent=2)
        except Exception as e:
            print(f"Failed to save packages.json: {e}")

    def get_all(
        self,
        source: Optional[str] = None,
        origin: Optional[str] = None,
        destination: Optional[str] = None,
        destination_type: Optional[str] = None,
        transport: Optional[str] = None,
        category: Optional[str] = None,
        max_price: Optional[float] = None,
        min_rating: Optional[float] = None,
        search: Optional[str] = None,
        featured_only: bool = False,
        popular_from_tn_only: bool = False,
        sort_by: Optional[str] = None,
        limit: Optional[int] = None
    ) -> List[Dict[str, Any]]:
        # Reload to reflect any file updates
        self.load_packages()
        results = list(self.packages.values())

        if featured_only:
            results = [p for p in results if p.get("is_featured")]

        if popular_from_tn_only:
            results = [p for p in results if p.get("popular_from_tn")]

        effective_origin = origin or source
        if effective_origin:
            s_low = effective_origin.lower()
            results = [p for p in results if s_low in p.get("source", "").lower() or s_low in p.get("origin", "").lower()]

        if destination:
            d_low = destination.lower()
            results = [p for p in results if d_low in p.get("destination", "").lower() or d_low in p.get("title", "").lower()]

        if destination_type:
            dt_low = destination_type.lower()
            results = [p for p in results if dt_low == p.get("destination_type", "").lower()]

        if transport:
            t_low = transport.lower()
            results = [p for p in results if t_low in p.get("transport", "").lower()]

        if category:
            c_low = category.lower()
            results = [p for p in results if c_low == p.get("category", "").lower()]

        if max_price is not None:
            results = [p for p in results if p.get("amount", 0) <= max_price]

        if min_rating is not None:
            results = [p for p in results if p.get("rating", 0) >= min_rating]

        if search:
            q = search.lower()
            results = [
                p for p in results
                if q in p.get("title", "").lower()
                or q in p.get("destination", "").lower()
                or q in p.get("source", "").lower()
                or q in p.get("origin", "").lower()
                or q in p.get("description", "").lower()
                or q in p.get("transport", "").lower()
                or q in p.get("category", "").lower()
                or q in p.get("destination_type", "").lower()
            ]

        # Sorting logic
        if sort_by == "price_asc":
            results = sorted(results, key=lambda x: x.get("amount", 0))
        elif sort_by == "price_desc":
            results = sorted(results, key=lambda x: x.get("amount", 0), reverse=True)
        elif sort_by == "rating_desc":
            results = sorted(results, key=lambda x: x.get("rating", 0), reverse=True)
        elif sort_by == "duration_asc":
            results = sorted(results, key=lambda x: x.get("duration_days", 0))
        elif sort_by == "duration_desc":
            results = sorted(results, key=lambda x: x.get("duration_days", 0), reverse=True)
        elif sort_by == "featured":
            results = sorted(results, key=lambda x: (not x.get("is_featured", False), -x["id"]))
        else:
            results = sorted(results, key=lambda x: x["id"], reverse=True)

        if limit:
            results = results[:limit]
        return results

    def get_by_id(self, package_id: int) -> Optional[Dict[str, Any]]:
        self.load_packages()
        return self.packages.get(package_id)

    def get_by_agent(self, agent_id: int) -> List[Dict[str, Any]]:
        return [p for p in self.packages.values() if p.get("agent_id") == agent_id]

    def create(self, data: Dict[str, Any], agent_id: int = 1, agent_name: str = "Admin") -> Dict[str, Any]:
        pkg_id = self.next_id
        self.next_id += 1
        pkg = {
            "id": pkg_id,
            "title": data.get("title", "Untitled Trip"),
            "source": data.get("source", "Departures from India"),
            "destination": data.get("destination", "Destination"),
            "amount": float(data.get("amount", 5000)),
            "rating": float(data.get("rating", 4.9)),
            "transport": data.get("transport", "Flight + Private Cab"),
            "duration_days": int(data.get("duration_days") or data.get("durationDays") or 5),
            "available_seats": int(data.get("available_seats") or data.get("availableSeats") or 20),
            "category": data.get("category", "Adventure"),
            "description": data.get("description", ""),
            "image_url": data.get("image_url") or data.get("imageUrl") or "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80",
            "is_featured": data.get("is_featured", data.get("isFeatured", True))
        }
        self.packages[pkg_id] = pkg
        self.save_packages()
        return pkg

    def update(self, package_id: int, data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        if package_id not in self.packages:
            return None
        pkg = self.packages[package_id]
        for k in ["title", "source", "destination", "transport", "category", "description"]:
            if k in data and data[k] is not None:
                pkg[k] = data[k]
        if "image_url" in data and data["image_url"]:
            pkg["image_url"] = data["image_url"]
        elif "imageUrl" in data and data["imageUrl"]:
            pkg["image_url"] = data["imageUrl"]
        if "amount" in data and data["amount"] is not None:
            pkg["amount"] = float(data["amount"])
        if "rating" in data and data["rating"] is not None:
            pkg["rating"] = float(data["rating"])
        if "duration_days" in data and data["duration_days"] is not None:
            pkg["duration_days"] = int(data["duration_days"])
        elif "durationDays" in data and data["durationDays"] is not None:
            pkg["duration_days"] = int(data["durationDays"])
        if "available_seats" in data and data["available_seats"] is not None:
            pkg["available_seats"] = int(data["available_seats"])
        elif "availableSeats" in data and data["availableSeats"] is not None:
            pkg["available_seats"] = int(data["availableSeats"])
        self.save_packages()
        return pkg

    def decrement_seats(self, package_id: int, count: int = 1) -> bool:
        if package_id in self.packages and self.packages[package_id]["available_seats"] >= count:
            self.packages[package_id]["available_seats"] -= count
            self.save_packages()
            return True
        return False

    def restore_seats(self, package_id: int, count: int = 1):
        if package_id in self.packages:
            self.packages[package_id]["available_seats"] += count
            self.save_packages()

    def delete(self, package_id: int) -> bool:
        if package_id in self.packages:
            del self.packages[package_id]
            self.save_packages()
            return True
        return False

    def nlp_search(self, query_text: str, entities: Dict[str, Any]) -> Dict[str, Any]:
        """
        NLP Search: Ranks packages against SpaCy extracted entities and fuzzy query keywords.
        """
        all_trips = list(self.packages.values())
        matched = []

        q_low = query_text.lower()
        ent_source = entities.get("source") or entities.get("origin")
        ent_dest = entities.get("destination")
        ent_budget = entities.get("budget") or entities.get("max_price")
        ent_transport = entities.get("transport")
        ent_category = entities.get("travel_type") or entities.get("category")

        for trip in all_trips:
            score = 0
            match_reasons = []

            # 1. Destination match
            if ent_dest and (ent_dest.lower() in trip["destination"].lower() or ent_dest.lower() in trip["title"].lower()):
                score += 40
                match_reasons.append(f"Destination match: {trip['destination']}")
            elif any(w in trip["destination"].lower() for w in q_low.split() if len(w) > 3):
                score += 15
                match_reasons.append(f"Destination keyword match")

            # 2. Source / Origin match
            if ent_source and (ent_source.lower() in trip["source"].lower()):
                score += 30
                match_reasons.append(f"Origin city match: {trip['source']}")
            elif any(w in trip["source"].lower() for w in q_low.split() if len(w) > 3):
                score += 10
                match_reasons.append(f"Origin keyword match: {trip['source']}")

            # 3. Budget / Price constraint
            if ent_budget:
                try:
                    b_val = float(ent_budget)
                    if trip["amount"] <= b_val:
                        score += 25
                        match_reasons.append(f"Under budget: ₹{trip['amount']:,.0f} ≤ ₹{b_val:,.0f}")
                    else:
                        score -= 20
                except (ValueError, TypeError):
                    pass

            # 4. Transport mode match
            if ent_transport and (ent_transport.lower() in trip["transport"].lower()):
                score += 20
                match_reasons.append(f"Transport mode: {trip['transport']}")

            # 5. Travel category / theme match
            if ent_category and (ent_category.lower() in trip.get("category", "").lower()):
                score += 20
                match_reasons.append(f"Travel theme: {trip.get('category')}")
            elif any(cat.lower() in q_low for cat in ["beach", "luxury", "adventure", "cultural", "honeymoon"] if cat.lower() in trip.get("category", "").lower()):
                score += 15
                match_reasons.append(f"Theme match: {trip.get('category')}")

            # General keyword relevance
            if any(term in trip["title"].lower() or term in trip.get("description", "").lower() for term in q_low.split() if len(term) > 3):
                score += 10

            if score > 0:
                matched.append({
                    "trip": trip,
                    "match_score": score,
                    "reasons": match_reasons
                })

        matched.sort(key=lambda x: x["match_score"], reverse=True)
        return {
            "query": query_text,
            "parsed_entities": entities,
            "total_matches": len(matched),
            "results": [m["trip"] for m in matched],
            "match_details": matched[:5]
        }

travel_catalog = TravelCatalog()
