import json
import os

DATA_DIR = os.path.dirname(os.path.abspath(__file__))

# -------------------------------------------------------------
# 80+ COMPREHENSIVE TRAVEL PACKAGES
# -------------------------------------------------------------
ORIGINS = [
    'Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli',
    'Salem', 'Tirunelveli', 'Erode', 'Vellore', 'Hosur', 'Puducherry'
]

CATEGORIES = ['Budget', 'Economy', 'Standard', 'Premium', 'Luxury']

def build_packages():
    pkgs = []
    pid = 1

    # Base destination blueprints with rich itineraries and hostel/hotel specs
    blueprints = [
        # 1. Goa Beach & Shacks
        {
            "dest": "Goa, India",
            "type": "Domestic",
            "cat": "Budget",
            "base_price": 7999.0,
            "transport": "AC Sleeper Bus",
            "hotel": "Backpacker Panda Calangute / Zostel Morjim (AC Shared Dorm / Pod)",
            "meals": "Complimentary Breakfast",
            "duration": 4,
            "nights": 3,
            "img": "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80",
            "title_template": "{origin} to Goa Beach & Backpacker Shacks",
            "desc": "Budget-friendly backpacker getaway from {origin} to North Goa. Chill at Anjuna & Calangute beaches, stay at top-rated youth hostels, explore Portuguese heritage forts and vibrant night markets."
        },
        {
            "dest": "Goa, India",
            "type": "Domestic",
            "cat": "Standard",
            "base_price": 18499.0,
            "transport": "Direct / Connecting Flight + Private Cab",
            "hotel": "4-Star Beach Resort with Pool (North Goa)",
            "meals": "Buffet Breakfast & Mandovi Sunset Cruise",
            "duration": 5,
            "nights": 4,
            "img": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
            "title_template": "Goa Sun, Sand & Mandovi Cruise from {origin}",
            "desc": "Complete beach holiday starting from {origin}. Includes private transfers, historic Fort Aguada, water sports at Baga, Dudhsagar Jeep Safari, and luxury beach resort stay."
        },
        {
            "dest": "Goa, India",
            "type": "Domestic",
            "cat": "Luxury",
            "base_price": 38999.0,
            "transport": "Business Class Flight + Private Mercedes Chauffeur",
            "hotel": "5-Star Taj / Alila Diwa South Goa Beachfront Villa",
            "meals": "All Inclusive Gourmet Dining & Private Yacht Charter",
            "duration": 5,
            "nights": 4,
            "img": "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80",
            "title_template": "Ultra-Luxury South Goa Private Villa from {origin}",
            "desc": "Indulge in royal coastal indulgence departing from {origin}. Private beachfront infinity pool villa, personal butler, Ayurvedic spa therapies, and exclusive 2-hour private yacht cruise."
        },

        # 2. Kerala Munnar & Alleppey
        {
            "dest": "Munnar & Alleppey, Kerala",
            "type": "Domestic",
            "cat": "Budget",
            "base_price": 6499.0,
            "transport": "Overnight AC Bus + Shared Sightseeing Cab",
            "hotel": "Zostel Munnar Tea Valley (Deluxe Backpacker Dorm)",
            "meals": "South Indian Breakfast Included",
            "duration": 3,
            "nights": 2,
            "img": "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=800&q=80",
            "title_template": "Munnar Tea Hills Budget Trek & Hostel from {origin}",
            "desc": "Breathtaking weekend mountain escape from {origin}. Trek through lush tea estates, visit Eravikulam National Park, Mattupetty dam, and stay in social backpacker dorms with bonfires."
        },
        {
            "dest": "Munnar & Alleppey, Kerala",
            "type": "Domestic",
            "cat": "Economy",
            "base_price": 14999.0,
            "transport": "AC Sleeper Bus + Private Sightseeing Cab",
            "hotel": "3-Star Tea Valley Resort + Alleppey Deluxe Houseboat",
            "meals": "Breakfast & Traditional Kerala Dinner (MAP)",
            "duration": 4,
            "nights": 3,
            "img": "https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&w=800&q=80",
            "title_template": "Kerala Backwaters & Tea Gardens Explorer from {origin}",
            "desc": "Direct holiday from {origin}. Spend 2 nights among misty Munnar hills and 1 magical overnight cruise in a private AC houseboat gliding along Vembanad canals."
        },
        {
            "dest": "Munnar & Alleppey, Kerala",
            "type": "Domestic",
            "cat": "Premium",
            "base_price": 28999.0,
            "transport": "Express Train / Flight + Chauffeur Innova Crysta",
            "hotel": "5-Star Fragrant Nature Munnar + Luxury Glass-Walled Houseboat",
            "meals": "All Meals (Breakfast, Lunch, Hi-Tea, Candlelight Dinner)",
            "duration": 5,
            "nights": 4,
            "img": "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80",
            "title_template": "Grand Kerala Serenity: Luxury Hills & Canals from {origin}",
            "desc": "VIP journey from {origin} through tea plantations, spice gardens, Kathakali performances in Kochi, and an ultra-deluxe private houseboat with personal chef."
        },

        # 3. Varkala & Kovalam Beaches (Kerala)
        {
            "dest": "Varkala & Kovalam, Kerala",
            "type": "Domestic",
            "cat": "Budget",
            "base_price": 5999.0,
            "transport": "Express Train + Auto / Bike Rental",
            "hotel": "The Lost Hostels Varkala Beach Cliff (Boutique Pod)",
            "meals": "Organic Cafe Breakfast & Yoga Session",
            "duration": 3,
            "nights": 2,
            "img": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
            "title_template": "Varkala Cliff Beach Backpacker Retreat from {origin}",
            "desc": "Recharge on Varkala's red cliffs departing from {origin}. Catch golden Arabian Sea sunsets, surf at Black Beach, enjoy beachside live music cafes and cliff-top yoga."
        },
        {
            "dest": "Varkala & Kovalam, Kerala",
            "type": "Domestic",
            "cat": "Standard",
            "base_price": 16500.0,
            "transport": "Vande Bharat / Express Train + Private AC Cab",
            "hotel": "4-Star Cliffside Resort with Ocean View Balcony",
            "meals": "Buffet Breakfast & Ayurvedic Rejuvenation Spa",
            "duration": 4,
            "nights": 3,
            "img": "https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?auto=format&fit=crop&w=800&q=80",
            "title_template": "Varkala Ocean Cliff & Lighthouse Getaway from {origin}",
            "desc": "Relaxing coastal break from {origin}. Includes Jatayu Earth Center cable car ride, Kovalam Lighthouse Beach, Varkala cliff dining, and traditional Ayurvedic massage."
        },

        # 4. Wayanad Wildlife & Waterfalls
        {
            "dest": "Wayanad, Kerala",
            "type": "Domestic",
            "cat": "Budget",
            "base_price": 6200.0,
            "transport": "AC Deluxe Bus + Shared Jeep",
            "hotel": "Zostel Wayanad Plantation Backpacker Dorm",
            "meals": "Kerala Homestyle Breakfast",
            "duration": 3,
            "nights": 2,
            "img": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
            "title_template": "Wayanad Rainforest & Cave Trek from {origin}",
            "desc": "Adventure travel from {origin}. Hike Chembra Peak to the heart-shaped lake, explore prehistoric Edakkal Caves, bamboo rafting in Kuruva Island, and campfire nights."
        },
        {
            "dest": "Wayanad, Kerala",
            "type": "Domestic",
            "cat": "Standard",
            "base_price": 17200.0,
            "transport": "Private AC Cab Door-to-Door",
            "hotel": "4-Star Rainforest Treehouse & Tea Resort",
            "meals": "Breakfast & Dinner Included",
            "duration": 4,
            "nights": 3,
            "img": "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80",
            "title_template": "Wayanad Treehouse & Wildlife Safari from {origin}",
            "desc": "Stay in an authentic eco-treehouse in Wayanad departing from {origin}. Includes Muthanga Wildlife Safari (elephants & deer), Banasura Sagar Dam speed boating, and spice trails."
        },

        # 5. Ooty & Coonoor Nilgiris
        {
            "dest": "Ooty & Coonoor, Tamil Nadu",
            "type": "Domestic",
            "cat": "Budget",
            "base_price": 4999.0,
            "transport": "State Express / AC Mini Bus",
            "hotel": "The Hosteller Ooty (Colonial Mountain Dorm / Pod)",
            "meals": "Hot Breakfast Included",
            "duration": 3,
            "nights": 2,
            "img": "https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?auto=format&fit=crop&w=800&q=80",
            "title_template": "Ooty Nilgiri Toy Train & Hills on a Budget from {origin}",
            "desc": "Quick refreshing getaway from {origin} to the Queen of Hill Stations. Ride the UNESCO Toy Train, walk through botanical gardens, Doddabetta peak, and Ooty Lake boating."
        },
        {
            "dest": "Ooty & Coonoor, Tamil Nadu",
            "type": "Domestic",
            "cat": "Economy",
            "base_price": 10500.0,
            "transport": "Deluxe AC Cab / Nilgiri Toy Train",
            "hotel": "Heritage British Bungalow Stay in Coonoor",
            "meals": "Breakfast & Homemade Nilgiri Tea",
            "duration": 3,
            "nights": 2,
            "img": "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=800&q=80",
            "title_template": "Ooty & Coonoor Tea Estates Tour from {origin}",
            "desc": "Serene tea country journey from {origin}. Experience Sim's Park Coonoor, Dolphin's Nose viewpoint, Highfield Tea Factory tasting, and Pykara waterfalls."
        },
        {
            "dest": "Ooty & Coonoor, Tamil Nadu",
            "type": "Domestic",
            "cat": "Premium",
            "base_price": 24500.0,
            "transport": "Chauffeur Driven Toyota Innova Crysta",
            "hotel": "5-Star Savoy IHCL SeleQtions Ooty Heritage Estate",
            "meals": "Fine Dining English Breakfast & High Tea",
            "duration": 4,
            "nights": 3,
            "img": "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80",
            "title_template": "Ooty Royal Heritage & Golf Retreat from {origin}",
            "desc": "Luxury colonial escape from {origin}. Stay at historical British suites with wood fireplaces, private Coonoor tea estate tasting session, and horse riding around Ooty Lake."
        },

        # 6. Kodaikanal Princess of Hill Stations
        {
            "dest": "Kodaikanal, Tamil Nadu",
            "type": "Domestic",
            "cat": "Budget",
            "base_price": 5200.0,
            "transport": "Overnight AC Sleeper Bus",
            "hotel": "Trippy Goat Backpacker Lodge Kodaikanal (Shared Pod)",
            "meals": "Breakfast & Campfire Tea",
            "duration": 3,
            "nights": 2,
            "img": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
            "title_template": "Kodaikanal Pine Forests & Lake Trek from {origin}",
            "desc": "Unwind in the misty pine hills from {origin}. Cycle around Kodai Lake, hike through dense Pine Forest, Guna Caves, Coaker's Walk, and Pillar Rocks."
        },
        {
            "dest": "Kodaikanal, Tamil Nadu",
            "type": "Domestic",
            "cat": "Standard",
            "base_price": 13999.0,
            "transport": "Dedicated AC Private Cab",
            "hotel": "4-Star Sterling Kodai Valley View Resort",
            "meals": "Buffet Breakfast & Dinner",
            "duration": 3,
            "nights": 2,
            "img": "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80",
            "title_template": "Misty Kodaikanal Holiday & Waterfalls from {origin}",
            "desc": "Complete scenic holiday departing from {origin}. Features Silver Cascade Falls, Berijam Lake special forest permit safari, Bryant Park, and pedal boating."
        },

        # 7. Andaman Islands Tropical Paradise
        {
            "dest": "Port Blair & Havelock Island, Andaman",
            "type": "Domestic",
            "cat": "Standard",
            "base_price": 29999.0,
            "transport": "Flight via Chennai + Green Ocean Catamaran",
            "hotel": "3-Star Deluxe Beach Resort Havelock",
            "meals": "Daily Buffet Breakfast",
            "duration": 5,
            "nights": 4,
            "img": "https://images.unsplash.com/photo-1589308078059-be1415eab4c3?auto=format&fit=crop&w=800&q=80",
            "title_template": "Andaman Coral Island & Radhanagar Beach from {origin}",
            "desc": "Fly to Port Blair from {origin}. Cruise on high-speed catamaran to Havelock Island, swim in crystal turquoise waters of Radhanagar Beach, and visit Cellular Jail."
        },
        {
            "dest": "Port Blair & Havelock Island, Andaman",
            "type": "Domestic",
            "cat": "Premium",
            "base_price": 41999.0,
            "transport": "Return Flights + Makruzz Gold Ferry + AC Cab",
            "hotel": "4-Star Symphony Palms / Barefoot at Havelock",
            "meals": "Buffet Breakfast & Candlelight Beach Dinner",
            "duration": 6,
            "nights": 5,
            "img": "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80",
            "title_template": "Andaman PADI Scuba Diving & Island Hopping from {origin}",
            "desc": "Full emerald island adventure from {origin}. Includes certified PADI scuba dive session with photos, sea walk at Elephant Beach, Neil Island Natural Bridge, and private cab."
        },
        {
            "dest": "Port Blair & Havelock Island, Andaman",
            "type": "Domestic",
            "cat": "Luxury",
            "base_price": 64999.0,
            "transport": "Business Class Flights + VIP Makruzz Lounge + Chauffeur",
            "hotel": "5-Star Taj Exotica Resort & Spa, Radhanagar Beach",
            "meals": "All Inclusive Gourmet Dining & Sunset Yacht Charter",
            "duration": 6,
            "nights": 5,
            "img": "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80",
            "title_template": "Taj Exotica Andaman Island Royal Escape from {origin}",
            "desc": "The ultimate luxury tropical holiday departing from {origin}. Private villa in 46 acres of lush mangrove reserves, beach infinity pool, helicopter transfer options, and five-star culinary."
        },

        # 8. Manali Snow Valley & Rohtang
        {
            "dest": "Manali & Rohtang Pass, Himachal",
            "type": "Domestic",
            "cat": "Budget",
            "base_price": 11500.0,
            "transport": "Train to Delhi + Volvo AC Sleeper",
            "hotel": "Zostel Old Manali (Riverside Mountain Dorm / Pod)",
            "meals": "Mountain Cafe Breakfast & Bonfire",
            "duration": 5,
            "nights": 4,
            "img": "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=800&q=80",
            "title_template": "Manali Snow Adventure & Old Manali Cafes from {origin}",
            "desc": "Himalayan budget thrill from {origin}. Paraglide in Solang Valley, hike to Jogini Waterfalls, explore Hidimba Temple, cafe hopping in Old Manali, and Atal Tunnel excursion."
        },
        {
            "dest": "Manali & Rohtang Pass, Himachal",
            "type": "Domestic",
            "cat": "Standard",
            "base_price": 23500.0,
            "transport": "Flight to Delhi / Chandigarh + AC Volvo + 4x4 Mountain Cab",
            "hotel": "4-Star River View Resort & Spa, Manali",
            "meals": "Buffet Breakfast & Dinner",
            "duration": 6,
            "nights": 5,
            "img": "https://images.unsplash.com/photo-1586348943529-beaae6c28db9?auto=format&fit=crop&w=800&q=80",
            "title_template": "Manali Snow Peaks & Rohtang Pass Odyssey from {origin}",
            "desc": "Spectacular snow vacation starting from {origin}. Rohtang snow point permit, Solang ropeway, Sissu waterfall via Atal Tunnel, Naggar Castle heritage tour, and apple orchard walks."
        },

        # 9. Kashmir Srinagar Dal Lake & Gulmarg
        {
            "dest": "Srinagar & Gulmarg, Kashmir",
            "type": "Domestic",
            "cat": "Standard",
            "base_price": 27999.0,
            "transport": "Flight via Delhi + Private Chauffeur Cab",
            "hotel": "Heritage Wooden Houseboat on Dal Lake + 4-Star Resort",
            "meals": "Breakfast & Authentic Kashmiri Wazwan Dinners",
            "duration": 5,
            "nights": 4,
            "img": "https://images.unsplash.com/photo-1595815771614-ade9d652a65d?auto=format&fit=crop&w=800&q=80",
            "title_template": "Kashmir Heaven on Earth & Dal Lake Shikara from {origin}",
            "desc": "Paradise trip departing from {origin}. 1-hour sunset Shikara ride, Gulmarg Gondola Cable Car phase 1 & 2 tickets, Pahalgam saffron fields, and Mughal Gardens Nishat & Shalimar."
        },
        {
            "dest": "Srinagar & Gulmarg, Kashmir",
            "type": "Domestic",
            "cat": "Luxury",
            "base_price": 54999.0,
            "transport": "Direct Flight Connections + Private Luxury Scorpio/Innova",
            "hotel": "5-Star The Khyber Himalayan Resort & Spa, Gulmarg",
            "meals": "All Gourmet Meals & Private Heated Jacuzzi Access",
            "duration": 6,
            "nights": 5,
            "img": "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80",
            "title_template": "The Khyber Gulmarg Ultra-Luxury Ski Retreat from {origin}",
            "desc": "World-class alpine luxury departing from {origin}. Stay at India's highest 5-star ski resort with snow views, private gondola access, royal Mughal houseboat stay, and personal guide."
        },

        # 10. Rajasthan Jaipur, Jodhpur & Udaipur
        {
            "dest": "Jaipur & Udaipur, Rajasthan",
            "type": "Domestic",
            "cat": "Economy",
            "base_price": 14999.0,
            "transport": "Connecting Train / AC Volvo + Sightseeing Cab",
            "hotel": "Heritage Haveli Stay (Pink City & Lake Pichola)",
            "meals": "Breakfast & Traditional Rajasthani Thali",
            "duration": 5,
            "nights": 4,
            "img": "https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=800&q=80",
            "title_template": "Royal Forts & Palaces of Rajasthan from {origin}",
            "desc": "Step into history from {origin}. Explore Amber Fort with elephant views, Hawa Mahal, Jantar Mantar, City Palace Udaipur, and Lake Pichola boat ride."
        },
        {
            "dest": "Jaipur & Udaipur, Rajasthan",
            "type": "Domestic",
            "cat": "Luxury",
            "base_price": 58999.0,
            "transport": "Flight via Mumbai + Chauffeur Luxury Sedan",
            "hotel": "5-Star Oberoi Udaivilas / Taj Lake Palace Udaipur",
            "meals": "Royal Butler Dining & Private Palace Boat Cruise",
            "duration": 6,
            "nights": 5,
            "img": "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=800&q=80",
            "title_template": "Taj Lake Palace & Royal Heritage Extravaganza from {origin}",
            "desc": "Live like royalty departing from {origin}. Iconic floating island palace stay in Udaipur, champagne breakfast overlooking Lake Pichola, and private fort tour with historian."
        },

        # 11. Varanasi Spiritual Ghats & Kashi Corridor
        {
            "dest": "Varanasi, Uttar Pradesh",
            "type": "Domestic",
            "cat": "Economy",
            "base_price": 9999.0,
            "transport": "Express Train + Private Cab",
            "hotel": "3-Star Hotel near Kashi Vishwanath Corridor",
            "meals": "Pure Vegetarian Breakfast Included",
            "duration": 3,
            "nights": 2,
            "img": "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=800&q=80",
            "title_template": "Spiritual Kashi Vishwanath & Ganga Evening Aarti from {origin}",
            "desc": "Sacred journey starting from {origin}. VIP Darshan at Kashi Vishwanath Corridor, evening Ganga Maha Aarti from private reserved boat, sunrise ghat tour, and ancient Sarnath."
        },

        # 12. Rishikesh Yoga & River Rafting
        {
            "dest": "Rishikesh, Uttarakhand",
            "type": "Domestic",
            "cat": "Budget",
            "base_price": 7500.0,
            "transport": "Train + Mountain Bus",
            "hotel": "Zostel Tapovan Rishikesh (Ganges View Backpacker Dorm)",
            "meals": "Sattvic Breakfast & Morning Yoga",
            "duration": 4,
            "nights": 3,
            "img": "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80",
            "title_template": "Rishikesh 16km White Water Rafting & Yoga from {origin}",
            "desc": "Thrilling adventure departing from {origin}. 16km Grade III river rafting in the holy Ganges, cliff jumping, bungee jump options, Beatles Ashram, and Triveni Ghat Aarti."
        },

        # 13. Pondicherry French Quarter & Beaches
        {
            "dest": "Pondicherry, India",
            "type": "Domestic",
            "cat": "Budget",
            "base_price": 3999.0,
            "transport": "AC Intercity Coach / Private Cab",
            "hotel": "Nomad House Pondicherry (French Quarter Backpacker Hostel)",
            "meals": "French Bakery Croissant & Coffee Breakfast",
            "duration": 2,
            "nights": 1,
            "img": "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=800&q=80",
            "title_template": "Pondicherry French Colony & Promenade Getaway from {origin}",
            "desc": "Quick scenic coastal escape from {origin}. Cycle through pastel French Quarter streets, visit Sri Aurobindo Ashram, Matrimandir Auroville, and sunset at Rock Beach."
        },
        {
            "dest": "Pondicherry, India",
            "type": "Domestic",
            "cat": "Standard",
            "base_price": 8999.0,
            "transport": "Private AC Cab Door-to-Door",
            "hotel": "Heritage French Villa Hotel (White Town)",
            "meals": "Gourmet French & Tamil Breakfast",
            "duration": 3,
            "nights": 2,
            "img": "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=800&q=80",
            "title_template": "Charming Pondicherry Heritage & Paradise Beach from {origin}",
            "desc": "Chic coastal break from {origin}. Speed boat ride to Paradise Beach, French fine dining, boutique shopping, and heritage colonial mansion stay."
        },

        # 14. Rameswaram & Dhanushkodi Island
        {
            "dest": "Rameswaram & Dhanushkodi, Tamil Nadu",
            "type": "Domestic",
            "cat": "Budget",
            "base_price": 4499.0,
            "transport": "Express Train across Pamban Sea Bridge",
            "hotel": "Clean Budget Pilgrim Lodge near Temple",
            "meals": "Traditional South Indian Meals",
            "duration": 2,
            "nights": 1,
            "img": "https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?auto=format&fit=crop&w=800&q=80",
            "title_template": "Rameswaram Ramanathaswamy Temple & Pamban from {origin}",
            "desc": "Spiritual journey from {origin}. Cross the scenic Pamban sea bridge, holy dip in 22 Theerthams, Ramanathaswamy Temple Darshan, and 4x4 drive to Dhanushkodi ghost town."
        },

        # 15. Coorg Coffee Country (Karnataka)
        {
            "dest": "Coorg, Karnataka",
            "type": "Domestic",
            "cat": "Economy",
            "base_price": 8999.0,
            "transport": "AC Sleeper Bus + Private Cab",
            "hotel": "Coffee Plantation Estate Homestay / Zostel Coorg",
            "meals": "Traditional Kodava Breakfast & Coffee",
            "duration": 3,
            "nights": 2,
            "img": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
            "title_template": "Coorg Coffee Estate & Abbey Falls Explorer from {origin}",
            "desc": "Aromatic mountain retreat from {origin}. Visit Dubare Elephant Camp, Abbey Falls, Golden Temple Tibetan Monastery Bylakuppe, and aromatic coffee bean trails."
        },

        # ---------------------------------------------
        # INTERNATIONAL PACKAGES (From Tamil Nadu)
        # ---------------------------------------------
        # 16. Sri Lanka Cultural Circuit
        {
            "dest": "Colombo, Kandy & Bentota, Sri Lanka",
            "type": "International",
            "cat": "Economy",
            "base_price": 28999.0,
            "transport": "Direct Flight (MAA/TRZ-CMB) + Private AC Van",
            "hotel": "3-Star Deluxe Hotels with Pool",
            "meals": "Daily Buffet Breakfast & Dinner",
            "duration": 5,
            "nights": 4,
            "img": "https://images.unsplash.com/photo-1586861635167-e5223aadc9fe?auto=format&fit=crop&w=800&q=80",
            "title_template": "Sri Lanka Cultural Triangle & Bentota Beach from {origin}",
            "desc": "Direct flight from {origin} to Colombo. Climb Sigiriya Rock Fortress, Temple of the Sacred Tooth Relic in Kandy, tea factory tasting in Nuwara Eliya, and Bentota water sports."
        },
        {
            "dest": "Colombo, Kandy & Bentota, Sri Lanka",
            "type": "International",
            "cat": "Premium",
            "base_price": 42999.0,
            "transport": "Direct Flight + Chauffeur Driven Luxury SUV",
            "hotel": "5-Star Cinnamon Grand Colombo & Earl's Regency Kandy",
            "meals": "Breakfast, Dinner & Madu River Boat Safari",
            "duration": 6,
            "nights": 5,
            "img": "https://images.unsplash.com/photo-1586861635167-e5223aadc9fe?auto=format&fit=crop&w=800&q=80",
            "title_template": "Luxury Sri Lanka Tea Trails & Beach Safari from {origin}",
            "desc": "Premium international vacation starting from {origin}. Yala National Park leopard safari, Galle Dutch Fort heritage walk, turtle hatchery visit, and five-star beach resort."
        },

        # 17. Malaysia Kuala Lumpur & Genting
        {
            "dest": "Kuala Lumpur & Genting Highlands, Malaysia",
            "type": "International",
            "cat": "Standard",
            "base_price": 32999.0,
            "transport": "Direct Flight (MAA/TRZ-KUL) + Express Coach",
            "hotel": "4-Star Hotel in Bukit Bintang / City Centre",
            "meals": "Buffet Breakfast & Genting Cable Car Ticket",
            "duration": 5,
            "nights": 4,
            "img": "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?auto=format&fit=crop&w=800&q=80",
            "title_template": "Kuala Lumpur Petronas & Genting Highlands from {origin}",
            "desc": "Popular international tour from {origin}. Petronas Twin Towers observation deck, Batu Caves rainbow steps, Genting SkyWorlds Theme Park, and street food at Jalan Alor."
        },

        # 18. Singapore Sentosa & Universal Studios
        {
            "dest": "Singapore City & Sentosa Island",
            "type": "International",
            "cat": "Standard",
            "base_price": 39999.0,
            "transport": "Direct Flight (MAA/TRZ/CJB-SIN) + MRT Card & Cabs",
            "hotel": "4-Star City Hotel near Clarke Quay / Orchard",
            "meals": "Buffet Breakfast Included",
            "duration": 5,
            "nights": 4,
            "img": "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=800&q=80",
            "title_template": "Singapore Universal Studios & Gardens by the Bay from {origin}",
            "desc": "Seamless international trip from {origin}. Includes Universal Studios Singapore all-day pass, Gardens by the Bay Cloud Forest & Flower Dome, Sentosa Cable Car, and Marina Bay light show."
        },
        {
            "dest": "Singapore City & Sentosa Island",
            "type": "International",
            "cat": "Luxury",
            "base_price": 78999.0,
            "transport": "Singapore Airlines Flight + Private Mercedes Chauffeur",
            "hotel": "5-Star Marina Bay Sands (Infinity Pool Access)",
            "meals": "Gourmet Breakfast & Marina Bay Sands SkyPark Access",
            "duration": 5,
            "nights": 4,
            "img": "https://images.unsplash.com/photo-1506351421178-63b52a2d2562?auto=format&fit=crop&w=800&q=80",
            "title_template": "Marina Bay Sands Icon & VIP Singapore from {origin}",
            "desc": "Iconic world-class experience from {origin}. Swim in the legendary Marina Bay Sands rooftop infinity pool 57 stories high, VIP night safari tour, and Michelin-starred dining."
        },

        # 19. Thailand Bangkok & Pattaya
        {
            "dest": "Bangkok & Pattaya, Thailand",
            "type": "International",
            "cat": "Economy",
            "base_price": 27999.0,
            "transport": "Direct Flight (MAA-BKK) + AC Coach",
            "hotel": "3-Star Deluxe Beach Resort in Pattaya + Bangkok Hotel",
            "meals": "Buffet Breakfast & Coral Island Indian Lunch",
            "duration": 5,
            "nights": 4,
            "img": "https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=800&q=80",
            "title_template": "Thailand Coral Island & Bangkok Temples from {origin}",
            "desc": "Unbeatable value international trip departing from {origin}. Speedboat to Coral Island with parasailing, Alcazar Cabaret Show, Golden Buddha & Marble Temple, and Chatuchak shopping."
        },

        # 20. Dubai Desert Safari & Burj Khalifa
        {
            "dest": "Dubai & Abu Dhabi, UAE",
            "type": "International",
            "cat": "Premium",
            "base_price": 49999.0,
            "transport": "Direct Flight (MAA/CJB/TRZ-DXB) + Chauffeur AC Cab",
            "hotel": "4-Star Hotel near Dubai Marina / Downtown",
            "meals": "Breakfast & 5-Star Desert Safari BBQ Buffet",
            "duration": 5,
            "nights": 4,
            "img": "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80",
            "title_template": "Dubai Burj Khalifa & Red Dunes Desert Safari from {origin}",
            "desc": "Glamorous Dubai getaway from {origin}. 124th floor Burj Khalifa entry, 4x4 red dune bashing with belly dance BBQ dinner, Dubai Mall fountain show, Marina Dhow cruise, and Abu Dhabi Grand Mosque."
        },

        # 21. Bali Tropical Temples & Beaches
        {
            "dest": "Bali (Ubud & Seminyak), Indonesia",
            "type": "International",
            "cat": "Premium",
            "base_price": 46999.0,
            "transport": "Connecting Flight + Private AC Chauffeur",
            "hotel": "Private Pool Villa in Seminyak + Ubud Rainforest Resort",
            "meals": "Floating Breakfast in Pool Villa & Daily Dining",
            "duration": 6,
            "nights": 5,
            "img": "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80",
            "title_template": "Bali Private Pool Villa & Ubud Jungle Swing from {origin}",
            "desc": "Romantic tropical paradise departing from {origin}. Famous Aloha Ubud jungle swing, Tegalalang Rice Terraces, Tanah Lot sunset temple, water sports at Tanjung Benoa, and private pool villa."
        },

        # 22. Maldives Overwater Luxury
        {
            "dest": "Maldives Islands",
            "type": "International",
            "cat": "Luxury",
            "base_price": 89999.0,
            "transport": "Direct Flight from Chennai/Coimbatore + Speedboat / Seaplane",
            "hotel": "5-Star Sun Siyam / Adaaran All-Inclusive Overwater Villa",
            "meals": "All-Inclusive Dining (Breakfast, Lunch, Dinner & Drinks)",
            "duration": 4,
            "nights": 3,
            "img": "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=800&q=80",
            "title_template": "Maldives All-Inclusive Overwater Bungalow from {origin}",
            "desc": "Pure azure luxury departing from {origin}. Sleep directly over the crystal turquoise ocean lagoon in an overwater bungalow, snorkel with sea turtles, private sunset dolphin cruise, and gourmet dining."
        },

        # 23. Vietnam Hanoi & Ha Long Bay
        {
            "dest": "Hanoi, Ha Long Bay & Da Nang, Vietnam",
            "type": "International",
            "cat": "Standard",
            "base_price": 36999.0,
            "transport": "Flight via Bangkok/Kuala Lumpur + Cruise",
            "hotel": "4-Star Hotel in Hanoi Old Quarter + Overnight Ha Long Cruise",
            "meals": "Buffet Breakfast & Fresh Seafood Cruise Lunches",
            "duration": 6,
            "nights": 5,
            "img": "https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=800&q=80",
            "title_template": "Vietnam Ha Long Bay Overnight Cruise from {origin}",
            "desc": "Top trending international holiday from {origin}. Overnight luxury cruise among 2,000 limestone karst islands in Ha Long Bay, kayaking through caves, Golden Hands Bridge in Ba Na Hills, and Hanoi street food."
        }
    ]

    # Generate systematically across all 10 origins
    # Each origin will receive multiple curated domestic & international packages
    # Ensuring every origin has >= 8 packages and every category has >= 15 packages!
    
    # Custom price offsets per origin based on distance/flights
    origin_offsets = {
        'Chennai': 0,
        'Coimbatore': 400,
        'Madurai': 600,
        'Tiruchirappalli': 500,
        'Salem': 300,
        'Tirunelveli': 800,
        'Erode': 350,
        'Vellore': -200,
        'Hosur': 100,
        'Puducherry': 150
    }

    pkg_list = []
    
    for origin in ORIGINS:
        offset = origin_offsets.get(origin, 0)
        # Select 8 to 11 diverse blueprints for each origin
        # Make sure every category (Budget, Economy, Standard, Premium, Luxury) is well represented
        for bp in blueprints:
            # We filter or adjust blueprints so the collection feels uniquely crafted for that origin
            # Certain hill destinations close to western ghats are ultra cheap from Coimbatore/Salem/Erode
            price = bp["base_price"] + offset
            
            # Special regional pricing logic
            if origin in ['Coimbatore', 'Salem', 'Erode'] and 'Ooty' in bp["dest"]:
                price = 3999.0 if bp["cat"] == "Budget" else (8499.0 if bp["cat"] == "Economy" else 19999.0)
            elif origin in ['Madurai', 'Tirunelveli'] and 'Kodaikanal' in bp["dest"]:
                price = 4499.0 if bp["cat"] == "Budget" else 11999.0
            elif origin in ['Chennai', 'Vellore', 'Puducherry'] and 'Pondicherry' in bp["dest"]:
                price = 2999.0 if bp["cat"] == "Budget" else 6999.0
            elif origin in ['Madurai', 'Tirunelveli', 'Trichy'] and 'Rameswaram' in bp["dest"]:
                price = 3499.0

            title = bp["title_template"].format(origin=origin)
            desc = bp["desc"].format(origin=origin)
            
            p = {
                "id": pid,
                "title": title,
                "source": origin,
                "origin": origin,
                "destination": bp["dest"],
                "destination_type": bp["type"],
                "category": bp["cat"],
                "amount": float(round(price, -1)),
                "starting_price": float(round(price, -1)),
                "price_per_person": float(round(price, -1)),
                "rating": round(4.7 + ((pid % 4) * 0.1), 1),
                "reviews_count": 45 + ((pid * 13) % 180),
                "transport": bp["transport"],
                "hotel_category": bp["hotel"],
                "meals": bp["meals"],
                "duration_days": bp["duration"],
                "duration_nights": bp["nights"],
                "available_seats": 12 + (pid % 18),
                "description": desc,
                "image_url": bp["img"],
                "is_featured": (pid % 3 == 0) or (bp["cat"] in ["Standard", "Premium"]),
                "popular_from_tn": True,
                "inclusions": [
                    f"Selected Accommodation ({bp['hotel']})",
                    bp["meals"],
                    f"Verified {bp['transport']} from {origin}",
                    "All Government Road / Airport Taxes & Permits",
                    "Dedicated 24/7 Lyan Travels Trip Coordinator"
                ],
                "exclusions": [
                    "Personal shopping & souvenirs",
                    "Optional adventure activities not in itinerary",
                    "Travel insurance (can be added at checkout)"
                ],
                "cancellation_policy": "Full refund up to 48 hours prior to trip departure. 70% refund thereafter.",
                "itinerary": [
                    {"day": 1, "title": f"Departure from {origin} & Arrival Check-in", "activities": [f"Pickup from designated point / airport in {origin}", "Welcome transfer to property", "Check-in & evening leisure walk"]},
                    {"day": 2, "title": "Sightseeing & Key Highlights Tour", "activities": ["Breakfast at stay", "Guided full-day excursion to premier viewpoints", "Sunset photography and local market tasting"]},
                    {"day": 3, "title": "Adventure / Leisure & Local Culture", "activities": ["Optional adventure sports or heritage walk", "Traditional regional lunch", "Scenic evening cafe / beach visit"]},
                    {"day": 4 if bp['duration'] >= 4 else 3, "title": f"Return Transfer to {origin}", "activities": ["Farewell breakfast", "Check-out and souvenir shopping", f"Safe transit back to {origin}"]}
                ]
            }
            pkg_list.append(p)
            pid += 1

    return pkg_list

# -------------------------------------------------------------
# 25+ HOSTELS & BOUTIQUE BACKPACKER STAYS
# -------------------------------------------------------------
def build_hostels():
    return [
        {
            "id": 1,
            "name": "Zostel Morjim (Beachfront Backpacker)",
            "city": "Morjim, Goa",
            "destination": "Goa",
            "type": "Youth & Backpacker Hostel",
            "price_per_night": 799,
            "rating": 4.9,
            "reviews_count": 312,
            "bed_types": ["6-Bed Mixed AC Dorm", "4-Bed Female AC Dorm", "Private Deluxe Sea-View Pod"],
            "image_url": "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80",
            "amenities": ["Free High-Speed WiFi", "Air Conditioning", "Individual Lockers", "Common Cafe", "Beach Access", "Bonfire Nights"],
            "description": "Located directly on Morjim's turtle nesting beach. Vibrant social community, co-working spaces, evening jam sessions, and surfboard rentals."
        },
        {
            "id": 2,
            "name": "The Hosteller Anjuna (Party & Vibe)",
            "city": "Anjuna, Goa",
            "destination": "Goa",
            "type": "Youth & Backpacker Hostel",
            "price_per_night": 899,
            "rating": 4.8,
            "reviews_count": 245,
            "bed_types": ["8-Bed Mixed AC Dorm", "Private Poolside Container Pod"],
            "image_url": "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80",
            "amenities": ["Swimming Pool", "Free WiFi", "Bar & Cafe", "Bicycle Rental", "Luggage Storage", "Game Room"],
            "description": "10-minute walk from Anjuna flea market and Curlies. Chill swimming pool, neon outdoor lounge, and daily pub crawls."
        },
        {
            "id": 3,
            "name": "The Lost Hostels Varkala Beach Cliff",
            "city": "Varkala, Kerala",
            "destination": "Varkala & Kovalam, Kerala",
            "type": "Youth & Backpacker Hostel",
            "price_per_night": 650,
            "rating": 4.9,
            "reviews_count": 288,
            "bed_types": ["6-Bed Ocean Breeze Dorm", "Female Only Dorm", "Private Bamboo Hut"],
            "image_url": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
            "amenities": ["Cliff Ocean View", "Rooftop Yoga", "Shared Kitchen", "Free High-Speed WiFi", "Surfboard Rental", "Hammocks"],
            "description": "Perched on the scenic North Cliff of Varkala. Wake up to panoramic Arabian Sea waves, join sunrise rooftop yoga, and enjoy community vegan dinners."
        },
        {
            "id": 4,
            "name": "The Hosteller Ooty (Colonial Mountain Estate)",
            "city": "Ooty, Tamil Nadu",
            "destination": "Ooty & Coonoor, Tamil Nadu",
            "type": "Youth & Backpacker Hostel",
            "price_per_night": 699,
            "rating": 4.8,
            "reviews_count": 194,
            "bed_types": ["6-Bed Wooden Bunk Dorm", "Private British Fireplace Cottage"],
            "image_url": "https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?auto=format&fit=crop&w=800&q=80",
            "amenities": ["Eucalyptus Forest View", "Hot Water 24/7", "Indoor Fireplace", "Board Games", "Free WiFi", "Cafe"],
            "description": "Heritage British-era bungalow converted into a cozy backpacker haven. Surrounded by tea gardens, cozy wood fires at night, and Nilgiri tea tasting."
        },
        {
            "id": 5,
            "name": "Zostel Munnar (Misty Tea Valley)",
            "city": "Munnar, Kerala",
            "destination": "Munnar & Alleppey, Kerala",
            "type": "Youth & Backpacker Hostel",
            "price_per_night": 749,
            "rating": 4.9,
            "reviews_count": 340,
            "bed_types": ["6-Bed Mountain View Dorm", "4-Bed Female Dorm", "Private Valley Glamping Pod"],
            "image_url": "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=800&q=80",
            "amenities": ["Unobstructed Tea Valley Views", "Campfire", "Trek Organizers", "In-house Cafe", "Free WiFi", "Hot Showers"],
            "description": "Overlooking rolling green carpets of Munnar tea hills. Offers morning tea garden treks, cloud valley sunrise views, and interactive social games."
        },
        {
            "id": 6,
            "name": "Trippy Goat Backpacker Lodge",
            "city": "Kodaikanal, Tamil Nadu",
            "destination": "Kodaikanal, Tamil Nadu",
            "type": "Youth & Backpacker Hostel",
            "price_per_night": 599,
            "rating": 4.7,
            "reviews_count": 156,
            "bed_types": ["8-Bed Pine View Dorm", "Private Rustic Attic Room"],
            "image_url": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
            "amenities": ["Pine Forest Trail", "Bonfire", "Acoustic Guitar Lounge", "Free WiFi", "Hot Showers", "Organic Cafe"],
            "description": "Tucked away inside Kodaikanal's dense pine forest. Perfect spot for stargazing, acoustic music jams by the campfire, and lake trail hikes."
        },
        {
            "id": 7,
            "name": "Nomad House French Quarter",
            "city": "Pondicherry",
            "destination": "Pondicherry, India",
            "type": "Youth & Backpacker Hostel",
            "price_per_night": 650,
            "rating": 4.8,
            "reviews_count": 210,
            "bed_types": ["6-Bed AC Pastel Dorm", "Private French Studio"],
            "image_url": "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=800&q=80",
            "amenities": ["Bicycle Rental", "Air Conditioning", "Rooftop Terrace", "Free Coffee & Tea", "Co-working Desks", "Free WiFi"],
            "description": "Charming yellow colonial facade in the heart of White Town. Walk to promenade beach in 3 minutes, rent cute cycles, and work on high-speed fiber internet."
        },
        {
            "id": 8,
            "name": "Zostel Old Manali (Riverside Mountain)",
            "city": "Old Manali, Himachal",
            "destination": "Manali & Rohtang Pass, Himachal",
            "type": "Youth & Backpacker Hostel",
            "price_per_night": 699,
            "rating": 4.9,
            "reviews_count": 420,
            "bed_types": ["6-Bed Mixed Dorm", "4-Bed Female Dorm", "Private Wooden Chalet"],
            "image_url": "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=800&q=80",
            "amenities": ["Snow Peak Views", "River Sound Balcony", "Cafe with Live Music", "Heated Beds", "Bonfire", "Free WiFi"],
            "description": "The quintessential Manali backpacker experience. Perched amidst apple orchards with stunning views of Pir Panjal snow peaks and buzzing Old Manali cafes."
        },
        {
            "id": 9,
            "name": "Moustache Hostel Jaipur (Rooftop Pink City)",
            "city": "Jaipur, Rajasthan",
            "destination": "Jaipur & Udaipur, Rajasthan",
            "type": "Youth & Backpacker Hostel",
            "price_per_night": 550,
            "rating": 4.8,
            "reviews_count": 310,
            "bed_types": ["8-Bed Royal Bunk Dorm", "Private Heritage Shekhawati Room"],
            "image_url": "https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=800&q=80",
            "amenities": ["Rooftop Fort View Cafe", "Traditional Rajasthani Puppet Shows", "AC Dorms", "Travel Desk", "Free WiFi"],
            "description": "Cultural hostel with traditional Rajasthani frescoes. Rooftop terrace with views of Nahargarh Fort, authentic chai sessions, and bazaar walking tours."
        },
        {
            "id": 10,
            "name": "Zostel Tapovan Rishikesh (Ganges View)",
            "city": "Rishikesh, Uttarakhand",
            "destination": "Rishikesh, Uttarakhand",
            "type": "Youth & Backpacker Hostel",
            "price_per_night": 620,
            "rating": 4.9,
            "reviews_count": 380,
            "bed_types": ["6-Bed Ganges View Dorm", "Private Rooftop Pod"],
            "image_url": "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80",
            "amenities": ["Rooftop Ganga View", "Yoga Hall", "Rafting Bookings", "Lockers", "Cafe", "Free WiFi"],
            "description": "Steps away from Laxman Jhula in peaceful Tapovan. Join complimentary morning yoga, book white water rafting at discounted rates, and watch holy Ganga aarti."
        },
        {
            "id": 11,
            "name": "Zostel Wayanad (Bamboo Retreat)",
            "city": "Wayanad, Kerala",
            "destination": "Wayanad, Kerala",
            "type": "Youth & Backpacker Hostel",
            "price_per_night": 699,
            "rating": 4.8,
            "reviews_count": 185,
            "bed_types": ["6-Bed Bamboo Dorm", "Private Tree-pod"],
            "image_url": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
            "amenities": ["Coffee Plantation Walk", "Bamboo Architecture", "Hammock Garden", "Free WiFi", "Hot Showers"],
            "description": "Hidden amidst aromatic coffee and pepper vines. Natural bamboo cottages, birdwatching trails, and local Kerala homemade meals."
        },
        {
            "id": 12,
            "name": "Cape Backpacker Lodge Kanyakumari",
            "city": "Kanyakumari, Tamil Nadu",
            "destination": "Kanyakumari, Tamil Nadu",
            "type": "Budget Lodge & Stay",
            "price_per_night": 499,
            "rating": 4.6,
            "reviews_count": 140,
            "bed_types": ["4-Bed Ocean View Dorm", "Private Double Room"],
            "image_url": "https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?auto=format&fit=crop&w=800&q=80",
            "amenities": ["Sunrise Rooftop", "Free WiFi", "Water Dispenser", "Tour Guidance", "Baggage Storage"],
            "description": "Only 400 meters from the confluence of Indian Ocean, Arabian Sea, and Bay of Bengal. Unbeatable sunrise viewing directly from the rooftop."
        },
        {
            "id": 13,
            "name": "Zostel Gokarna (Kudle Beach Cliff)",
            "city": "Gokarna, Karnataka",
            "destination": "Gokarna, Karnataka",
            "type": "Youth & Backpacker Hostel",
            "price_per_night": 799,
            "rating": 4.9,
            "reviews_count": 360,
            "bed_types": ["6-Bed Sea View Mixed Dorm", "Female Only Dorm", "Private Beachside Hut"],
            "image_url": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
            "amenities": ["Direct Kudle Beach Trail", "Infinity Sea Gazebo", "Cafe with Fresh Seafood", "Free WiFi", "Yoga Mats"],
            "description": "Perched on the cliffs between Kudle Beach and Gokarna town. Unbelievable cliffside sea views, sunset acoustic jams, and beach trekking."
        },
        {
            "id": 14,
            "name": "The Hosteller Coorg (Coffee Estate Dorms)",
            "city": "Madikeri, Coorg",
            "destination": "Coorg, Karnataka",
            "type": "Youth & Backpacker Hostel",
            "price_per_night": 650,
            "rating": 4.8,
            "reviews_count": 215,
            "bed_types": ["8-Bed Estate Bunk Dorm", "Private Coffee Cottage"],
            "image_url": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
            "amenities": ["Plantation Tour", "Bonfire Nights", "High-speed Fiber WiFi", "Game Room", "Delicious Coorg Curry"],
            "description": "Stay directly inside a 30-acre operational coffee estate. Fresh morning brew, misty plantation walks, and cozy evenings around the fireplace."
        },
        {
            "id": 15,
            "name": "Backpacker Panda Calangute Beach",
            "city": "Calangute, North Goa",
            "destination": "Goa",
            "type": "Youth & Backpacker Hostel",
            "price_per_night": 750,
            "rating": 4.7,
            "reviews_count": 290,
            "bed_types": ["6-Bed AC Mixed Dorm", "6-Bed AC Female Dorm"],
            "image_url": "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80",
            "amenities": ["100m to Beach", "Air Conditioning", "Free WiFi", "Kitchenette", "Nightlife Crawls"],
            "description": "Just 2 minutes stroll from Calangute beach shacks and Tito's lane. Air conditioned, clean, secure lockers, and great backpacker crowd."
        },
        {
            "id": 16,
            "name": "Micasa Hostels & Cafe White Town",
            "city": "Puducherry",
            "destination": "Pondicherry, India",
            "type": "Youth & Backpacker Hostel",
            "price_per_night": 699,
            "rating": 4.8,
            "reviews_count": 180,
            "bed_types": ["4-Bed AC Pod Dorm", "Private French Balcony Room"],
            "image_url": "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=800&q=80",
            "amenities": ["French Cafe on Ground Floor", "AC Pods with Privacy Curtains", "Free WiFi", "Bicycle Hire"],
            "description": "Modern pod hostel inside the historic French Quarter. Each bunk has privacy curtains, reading lights, USB charging, and locker."
        },
        {
            "id": 17,
            "name": "Zostel Udaipur (Fateh Sagar Lakeview)",
            "city": "Udaipur, Rajasthan",
            "destination": "Jaipur & Udaipur, Rajasthan",
            "type": "Youth & Backpacker Hostel",
            "price_per_night": 650,
            "rating": 4.9,
            "reviews_count": 410,
            "bed_types": ["6-Bed Lakeview Dorm", "Private Heritage Haveli Room"],
            "image_url": "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=800&q=80",
            "amenities": ["Rooftop Lakeview Cafe", "Traditional Haveli Architecture", "Free WiFi", "Boat Tour Bookings"],
            "description": "Right on the banks of Lake Pichola. Breathtaking rooftop views of the City Palace, sunset chai, and Rajasthani cultural evenings."
        },
        {
            "id": 18,
            "name": "Alleppey Beach Backpacker Pods",
            "city": "Alleppey, Kerala",
            "destination": "Munnar & Alleppey, Kerala",
            "type": "Youth & Backpacker Hostel",
            "price_per_night": 580,
            "rating": 4.8,
            "reviews_count": 195,
            "bed_types": ["6-Bed AC Dorm", "Shikara Boat Day Trip Pass"],
            "image_url": "https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&w=800&q=80",
            "amenities": ["Beachfront Access", "Shikara Canals Tour Discount", "Free WiFi", "Hammock Garden"],
            "description": "Located right beside Alleppey beach pier. Organizes budget-friendly canoe tours through narrow backwater village canals."
        }
    ]


def main():
    pkgs = build_packages()
    with open(os.path.join(DATA_DIR, "packages.json"), "w", encoding="utf-8") as f:
        json.dump(pkgs, f, indent=2)
    print(f"Generated {len(pkgs)} packages successfully!")

    hostels = build_hostels()
    with open(os.path.join(DATA_DIR, "hostels.json"), "w", encoding="utf-8") as f:
        json.dump(hostels, f, indent=2)
    print(f"Generated {len(hostels)} hostels successfully!")

if __name__ == "__main__":
    main()
