import json
import os
import random

DATA_DIR = os.path.dirname(os.path.abspath(__file__))

ORIGINS = [
    'Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli',
    'Salem', 'Tirunelveli', 'Erode', 'Vellore', 'Hosur', 'Puducherry'
]

DESTINATION_PROFILES = [
    {
        "name": "Goa, India",
        "type": "Domestic",
        "tag": "Beach & Nightlife",
        "img": "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80",
        "variants": [
            ("North Goa Beach Shacks & Backpacker Trail", "Budget", 8499, 4, 3, "AC Sleeper Coach + Scooter Rental", "Zostel Morjim / Calangute Beach Dorm", "Complimentary Breakfast", "Budget holiday exploring Anjuna flea market, Baga nightlife, Fort Aguada, and beach shacks."),
            ("Goa Tropical Sands & Mandovi Sunset Cruise", "Standard", 18999, 5, 4, "Direct Flight + Private Cab", "4-Star Radisson Resort with Pool", "Buffet Breakfast & Sunset Dinner Cruise", "Complete beach getaway including Dudhsagar Falls jeep safari, water sports at Calangute, and river cruise."),
            ("South Goa Luxury Beachfront Villa & Spa", "Luxury", 39500, 5, 4, "Premium Flight + Private Chauffeur Cab", "5-Star Taj Exotica / Alila Diwa Villa", "All-Inclusive Gourmet Dining & Private Yacht", "Ultra-luxurious retreat with private beach access, Swedish spa therapies, Mandovi yacht charter, and sea-view dining.")
        ]
    },
    {
        "name": "Munnar & Alleppey, Kerala",
        "type": "Domestic",
        "tag": "Hills & Backwaters",
        "img": "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=800&q=80",
        "variants": [
            ("Kerala Tea Hills & Village Backwaters", "Budget", 9499, 4, 3, "Deluxe Semi-Sleeper Bus + Local Cab", "Misty Mountain Homestay / Zostel Munnar", "South Indian Breakfast & Tea Tasting", "Explore Mattupetty Dam, Eravikulam National Park, tea processing factories, and rustic backwater canoe rides."),
            ("Munnar Misty Peaks & Alleppey Deluxe Houseboat", "Standard", 21500, 5, 4, "AC Chauffeur Cab / Express Train", "Club Mahindra Munnar + Private AC Houseboat", "Daily Buffet Breakfast & Traditional Kerala Lunch", "Stay amidst aromatic tea plantations in Munnar and cruise the serene Vembanad lake on an authentic private houseboat."),
            ("Royal Kerala Backwaters & Ayurvedic Luxury Spa", "Luxury", 42000, 6, 5, "Flight to Kochi + Luxury Mercedes SUV", "The Leela Kovalam / Kumarakom Lake Resort", "All Meals Curated by Master Chefs & Daily Spa", "Presidential houseboat suite, therapeutic Ayurvedic massage packages, private sunset boat rides, and organic spice tours.")
        ]
    },
    {
        "name": "Ooty & Coonoor, Tamil Nadu",
        "type": "Domestic",
        "tag": "Blue Mountains",
        "img": "https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?auto=format&fit=crop&w=800&q=80",
        "variants": [
            ("Nilgiri Toy Train & Pine Forest Trek", "Budget", 6999, 3, 2, "Deluxe AC Coach + Heritage Toy Train", "Zostel Ooty / Woodlands Hill Cottage", "Complimentary Breakfast & Fresh Bakery Treats", "Ride the UNESCO Nilgiri Mountain Toy Train, stroll through botanical gardens, Doddabetta Peak, and tea museum."),
            ("Ooty Coonoor Tea Heritage & Lake Boating", "Standard", 16500, 4, 3, "Private AC Sedan Chauffeur", "Sterling Ooty Fern Hill / Fortune Resort", "Buffet Breakfast & Nilgiri Tea Tour", "Relax at Pykara Lake, Sim's Park Coonoor, Lamb's Rock, and enjoy fresh homemade chocolate tasting."),
            ("Colonial Heritage Bungalow & Tea Estate Retreat", "Luxury", 34500, 4, 3, "Luxury Chauffeur Driven SUV", "Savoy - IHCL SeleQtions / Taj Savoy Ooty", "High Tea on Lawns & 5-Course Candlelight Dinner", "Stay in a 19th-century British heritage colonial bungalow with private fireplace, horse riding, and VIP Nilgiri train coupe.")
        ]
    },
    {
        "name": "Kodaikanal, Tamil Nadu",
        "type": "Domestic",
        "tag": "Princess of Hill Stations",
        "img": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80",
        "variants": [
            ("Kodai Lake & Misty Pine Trails Backpacking", "Budget", 6499, 3, 2, "AC Sleeper Bus + Shared Mountain Cab", "Trippr Kodaikanal / Hillside Backpacker Inn", "Breakfast & Fresh Farm Plum Jam", "Bicycle around star-shaped Kodai Lake, walk along Coaker's Walk, and trek through the mystical Pine Forest."),
            ("Kodaikanal Valley View & Pillar Rocks Discovery", "Standard", 15200, 4, 3, "Private AC Chauffeur Cab", "The Carlton Lakeside Luxury Resort", "Buffet Breakfast & Dinner (MAP Plan)", "Scenic stay overlooking the lake with visits to Pillar Rocks, Silver Cascade Falls, Bryant Park, and solar observatory."),
            ("Kodai Cliffside Luxury Villa & Forest Wellness", "Luxury", 32000, 4, 3, "Private Luxury SUV Transfer", "Tamara Kodai (5-Star Heritage Luxury)", "Gourmet Dining, High Tea & Heated Pool", "Experience 5-star colonial luxury in the French quarter of Kodaikanal with forest trails, private jacuzzi, and spa treatments.")
        ]
    },
    {
        "name": "Port Blair & Havelock Island, Andaman",
        "type": "Domestic",
        "tag": "Island Paradise",
        "img": "https://images.unsplash.com/photo-1589308078059-be1415eab4c3?auto=format&fit=crop&w=800&q=80",
        "variants": [
            ("Andaman Island Explorer & Radhanagar Beach", "Budget", 22500, 5, 4, "Direct Flight + High-Speed Catamaran", "Sea Shell Havelock Budget Pod / Megapode Resort", "Complimentary Breakfast", "Cellular Jail Sound & Light show, Radhanagar Beach sunset (Asia's top beach), and Elephant beach coral tour."),
            ("Havelock & Neil Island Scuba Diving Expedition", "Standard", 38900, 6, 5, "Flight + Makruzz Luxury Catamaran", "Symphony Palms Beach Resort Havelock", "Buffet Breakfast & 1 Certified Scuba Dive", "PADI-guided scuba dive in turquoise waters, sea walking, Natural Bridge Neil Island, and private beach lounging."),
            ("Taj Exotica Havelock Ultra Luxury Island Haven", "Luxury", 79000, 6, 5, "Premium Flight + VIP Ferry + Private Cab", "Taj Exotica Resort & Spa, Andamans", "All-Inclusive Chef Curated Meals & Yacht Snorkel", "Private luxury villa surrounded by dense rainforest canopy, infinity pool overlooking crystal sea, and private yacht snorkel excursion.")
        ]
    },
    {
        "name": "Srinagar & Gulmarg, Kashmir",
        "type": "Domestic",
        "tag": "Heaven on Earth",
        "img": "https://images.unsplash.com/photo-1595815771614-ade9d652a65d?auto=format&fit=crop&w=800&q=80",
        "variants": [
            ("Kashmir Valley & Heritage Dal Houseboat", "Budget", 14999, 5, 4, "Connecting Flight + Shared Mountain Cab", "Heritage Dal Lake Carved Houseboat", "Kashmiri Kahwa & Daily Breakfast", "Tranquil Shikara ride across floating vegetable markets, Mughal Gardens (Shalimar & Nishat), and saffron fields of Pampore."),
            ("Gulmarg Gondola & Pahalgam Valley of Shepherds", "Standard", 29500, 6, 5, "Flight + Private Mountain SUV Cab", "Khyber Himalayan Resort Partner / Grand Mumtaz", "Buffet Breakfast & Dinner with Wazwan Tasting", "Ride Phase 2 of the world-famous Gulmarg Gondola to Apharwat Peak snowline, pony ride in Baisaran, and Betaab Valley."),
            ("Royal Kashmir Winter Snow & Luxury Pine Chalet", "Luxury", 58000, 6, 5, "Business Class Flight + 4x4 Luxury Chauffeur", "The Khyber Himalayan Resort & Spa, Gulmarg", "Full Board Fine Dining & L'Occitane Spa Pass", "Heated indoor pool facing snow peaks, ski passes with private instructor, VIP Gondola access, and private Shikara gala dinner.")
        ]
    },
    {
        "name": "Manali & Rohtang Pass, Himachal",
        "type": "Domestic",
        "tag": "Himalayan Snow Adventure",
        "img": "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=800&q=80",
        "variants": [
            ("Manali Cafe Trail & Solang Snow Adventure", "Budget", 11200, 5, 4, "Volvo AC Coach + Mountain Cab", "Zostel Old Manali / Himalayan River Cottage", "Breakfast & Cafe Vouchers", "Paragliding in Solang Valley, hot springs of Vashisht, Jogini waterfall hike, and Old Manali cafe hopping."),
            ("Rohtang Snow Pass & Atal Tunnel Expedition", "Standard", 22800, 6, 5, "Flight to Delhi/Chandigarh + Private 4x4 Cab", "Span Resort & Spa / Apple Country Resort", "Buffet Breakfast & Dinner Included", "Drive through the 9km Atal Tunnel to Sissu, snow scooter rides at Rohtang Pass, Hadimba Temple, and Naggar Castle tour."),
            ("Himalayan Cedar Luxury Chalet & River Rafting", "Luxury", 46000, 6, 5, "Flight + Private Luxury SUV", "The Himalayan Luxury Castle & Resort", "Gourmet Himalayan Cuisine & Private Bonfire", "Victorian Gothic style castle stay overlooking snow-capped peaks, Beas river white-water rafting, and spa wellness.")
        ]
    },
    {
        "name": "Jaipur & Udaipur, Rajasthan",
        "type": "Domestic",
        "tag": "Royal Palaces & Forts",
        "img": "https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=800&q=80",
        "variants": [
            ("Pink City & Lake City Heritage Discovery", "Budget", 10800, 5, 4, "Express Train / Sleeper + City Cab", "Zostel Jaipur / Heritage Haveli Inn", "Rajasthani Thali Breakfast Included", "Amber Fort elephant trail, Hawa Mahal photo stop, City Palace Udaipur, and sunset boat ride on Lake Pichola."),
            ("Royal Forts, Palaces & Desert Evening Camp", "Standard", 24900, 6, 5, "Flight + AC Chauffeur Driven Sedan", "Udai Kothi Heritage Hotel / Alsisar Haveli", "Buffet Breakfast & Cultural Folk Dinner Show", "Nahargarh sunset view, Jag Mandir island palace, Saheliyon-ki-Bari, authentic Rajasthani folk dances and puppet show."),
            ("The Oberoi Udaivilas & Taj Rambagh Palace Grandeur", "Luxury", 65000, 6, 5, "Flight + Luxury Chauffeur Mercedes", "The Oberoi Udaivilas / Taj Rambagh Palace", "Royal Dining in Private Courtyard & Vintage Car Tour", "World-renowned palace experience, private boat arrival across Lake Pichola, peacock gardens, and royal butler service.")
        ]
    },
    {
        "name": "Varkala & Kovalam, Kerala",
        "type": "Domestic",
        "tag": "Cliff Beaches & Ayurveda",
        "img": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
        "variants": [
            ("Varkala Red Cliff Sunset & Surfing Getaway", "Budget", 7800, 4, 3, "Train / AC Coach + Scooter Rental", "Zostel Varkala / Cliffside Bamboo Hut", "Breakfast & Fresh Coconut Water", "Perched along the stunning 80-foot laterite cliffs, surfing lessons at Black Sand Beach, and Janardhana Swamy temple."),
            ("Kovalam Lighthouse & Poovar Golden Sand Island", "Standard", 17500, 5, 4, "AC Chauffeur Cab", "Uday Samudra Leisure Beach Hotel", "Buffet Breakfast & Seafood Platter", "Climb Kovalam Lighthouse, relax at Hawah Beach, Poovar backwater island boat safari through dense mangrove tunnels."),
            ("The Leela Kovalam Cliff Luxury & Ayurvedic Cure", "Luxury", 41000, 5, 4, "Flight to Trivandrum + Luxury Sedan", "The Leela Kovalam, A Raviz Hotel", "Chef-Crafted Coastal Dining & Full Body Rejuvenation", "India's only cliff-top beach resort with private infinity pool overlooking the Arabian Sea, Ayurvedic spa sessions, and club lounge access.")
        ]
    },
    {
        "name": "Wayanad, Kerala",
        "type": "Domestic",
        "tag": "Misty Rainforests",
        "img": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
        "variants": [
            ("Edakkal Caves & Chembra Peak Trekking", "Budget", 6800, 3, 2, "Deluxe AC Coach + Mountain Jeep", "Zostel Wayanad / Bamboo Treehouse Pod", "Malabar Breakfast & Spice Farm Tour", "Neolithic rock carvings at Edakkal Caves, hike to Chembra Heart Lake, Banasura Sagar Dam, and bamboo rafting."),
            ("Wayanad Coffee Estate Plantation & Treehouse", "Standard", 15800, 4, 3, "Private AC Cab Chauffeur", "Vythiri Village Resort / Wayanad Silverwoods", "Buffet Breakfast & Campfire Barbecue", "Stay inside a 50-acre coffee & cardamom estate, glass bridge walk, Soochipara Waterfalls, and Kuruva Island nature walk."),
            ("Vythiri Rainforest Luxury Resort & Natural Spa", "Luxury", 33500, 4, 3, "Luxury Chauffeur Driven SUV", "Vythiri Resort (5-Star Eco Luxury)", "All Organic Meals, Pool Villa & Rainforest Treks", "High-canopy luxury treehouse with natural mountain stream jacuzzi, private rope bridge, and guided birdwatching.")
        ]
    },
    {
        "name": "Pondicherry, India",
        "type": "Domestic",
        "tag": "French Quarter & Promenade",
        "img": "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=800&q=80",
        "variants": [
            ("French Colony Heritage Walk & Auroville Peace", "Budget", 5200, 3, 2, "Express Coach / Train + Vintage Bicycle", "Micasa French Pod Hostel / White Town Inn", "French Croissant Breakfast & Filter Coffee", "Cycle along yellow colonial mustard streets of White Town, meditate at Auroville Matrimandir, and sunset at Rock Beach."),
            ("Pondy Coastal Beachfront & Paradise Island", "Standard", 12500, 3, 2, "Private AC Sedan", "Promenade Heritage Hotel / Shenbaga Hotel", "Buffet Breakfast & Franco-Tamil Seafood Dinner", "Chunnambar boat ferry to pristine Paradise Beach, Sri Aurobindo Ashram, French bakeries, and Serenity Beach surf lessons."),
            ("Palais de Mahe CGH Earth Luxury & Scuba Diving", "Luxury", 28000, 3, 2, "Luxury Chauffeur Transfer", "Palais de Mahe - CGH Earth (White Town)", "Signature French-Creole Gourmet & Wine Tasting", "Exquisite colonial courtyard pool, colonial high ceilings, certified scuba dive along Pondicherry reef, and private heritage butler.")
        ]
    },
    {
        "name": "Varanasi, Uttar Pradesh",
        "type": "Domestic",
        "tag": "Spiritual Capital",
        "img": "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=800&q=80",
        "variants": [
            ("Ganga Sunrise Boat & Ancient Ghats Exploration", "Budget", 8900, 4, 3, "Express Train / Flight + E-Rickshaw", "Moustache Varanasi / Kashi Ghat View Inn", "Banarasi Kachori Breakfast & Lassi Tasting", "Witness ethereal sunrise boat tour on holy Ganges, evening Dashashwamedh Maha Aarti, and ancient silk weaving alleys."),
            ("Kashi Vishwanath Corridor & Sarnath Buddhist Odyssey", "Standard", 18500, 4, 3, "Direct Flight + Private AC Chauffeur Cab", "Taj Nadesar Palace Partner / Ramada Plaza", "Buffet Breakfast & VIP Temple Darshan Passes", "Priority VIP Darshan at Kashi Vishwanath Jyotirlinga, visit Sarnath where Lord Buddha gave his first sermon, and Manikarnika Ghat."),
            ("BrijRama Palace Luxury Heritage on Darbhanga Ghat", "Luxury", 48000, 4, 3, "Flight + Private Heritage Boat Transfer", "BrijRama Palace - A Heritage Hotel (On the Ghat)", "Royal Vegetarian Thali & Private Ganga Bajra Aarti", "18th-century palace right on the riverbank, private bajra boat for sunset Ganga Aarti with temple priests, and classical sitar soirees.")
        ]
    },
    {
        "name": "Rishikesh, Uttarakhand",
        "type": "Domestic",
        "tag": "Yoga & Ganga Rafting",
        "img": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
        "variants": [
            ("Ganga White Water Rafting & Cliff Jump Camp", "Budget", 8200, 4, 3, "Train / AC Coach + Shared Mountain Cab", "Zostel Rishikesh / Riverside Adventure Camp", "Breakfast & Riverside Campfire Dinner", "16km thrilling white-water rafting from Shivpuri, cliff jumping, body surfing, Parmarth Niketan Ganga Aarti, and Beatles Ashram."),
            ("Rishikesh Yoga Retreat & Haridwar Aarti Odyssey", "Standard", 19200, 5, 4, "Flight to Dehradun + AC Chauffeur Cab", "Aloha on the Ganges / Lemon Tree Premier", "Buffet Organic Meals & Daily Sunrise Yoga", "Stay right overlooking the azure Ganges river, morning yoga with certified masters, bungee jumping at Mohan Chatti, and Har Ki Pauri Haridwar."),
            ("Ananda in the Himalayas Palace Wellness & Spa", "Luxury", 64000, 5, 4, "Flight + Private Chauffeur Mountain Transfer", "Ananda in the Himalayas (World #1 Destination Spa)", "Full Ayurvedic Wellness Diet & Daily Spa Rituals", "Voted the world's best wellness resort, set in Maharaja's palace estate overlooking the Ganges valley, Hydrotherapy, and Vedanta lectures.")
        ]
    },
    {
        "name": "Darjeeling & Gangtok, Sikkim",
        "type": "Domestic",
        "tag": "Himalayan Monasteries",
        "img": "https://images.unsplash.com/photo-1622308644420-a937a07be28a?auto=format&fit=crop&w=800&q=80",
        "variants": [
            ("Tiger Hill Sunrise & Heritage Toy Train Journey", "Budget", 12500, 5, 4, "Train / Flight to Bagdogra + Mountain SUV", "Zostel Gangtok / Darjeeling Colonial Homestay", "Tibetan Momos & Traditional Tea Breakfast", "Watch golden sunrise over Mount Kanchenjunga from Tiger Hill, ride UNESCO Darjeeling Toy Train, and visit Rumtek Monastery."),
            ("Tsomgo Glacial Lake & Nathula Pass Indo-China Border", "Standard", 25900, 6, 5, "Flight + Private Mountain SUV", "Mayfair Spa Resort & Casino / Elgin Darjeeling", "Buffet Breakfast & Dinner Included", "Visit sacred glacial Tsomgo Lake at 12,310 ft, Indo-China border pass at Nathula, ropeway cable car, and tea estate tours."),
            ("Mayfair Himalayan Luxury Heritage & Casino Retreat", "Luxury", 52000, 6, 5, "Flight + Private Luxury 4x4 Chauffeur", "The Elgin Darjeeling / Mayfair Gangtok", "Full Gourmet Dining & Himalayan Herbal Therapy", "Colonial luxury favored by British royalty, personal butler, organic Sikkim cuisine, and private tea garden tasting.")
        ]
    },
    {
        "name": "Coorg & Mysore, Karnataka",
        "type": "Domestic",
        "tag": "Scotland of India & Palaces",
        "img": "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
        "variants": [
            ("Mysore Palace Lights & Coorg Coffee Estate Trails", "Budget", 6500, 3, 2, "Deluxe AC Coach + Local Cab", "The Hosteller Coorg / Mysore Heritage Inn", "Breakfast & Fresh Estate Brew Coffee", "Marvel at 100,000 glowing bulbs at Mysore Palace, visit Tibetan Golden Temple Bylakuppe, Abbey Falls, and Raja's Seat sunset."),
            ("Coorg Misty Plantation Resort & Dubare Elephant Camp", "Standard", 16800, 4, 3, "Private AC Sedan Chauffeur", "Evolve Back Partner / Club Mahindra Madikeri", "Buffet Breakfast & Traditional Kodava Dinner", "Bathe gentle elephants at Dubare Elephant Camp, river rafting in Barapole, coffee plantation walks, and Tala Kaveri source."),
            ("Evolve Back Luxury Coffee Estate & Private Pool Villa", "Luxury", 39000, 4, 3, "Luxury SUV Chauffeur Transfer", "Evolve Back, Coorg (5-Star Luxury)", "All-Inclusive Chef Menus & Private Plantation Tour", "300-acre operational coffee & spice plantation, private plunge pool villa, machan dining high in the trees, and Kodava cultural nights.")
        ]
    },
    {
        "name": "Singapore City & Sentosa Island",
        "type": "International",
        "tag": "Global Lion City",
        "img": "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=800&q=80",
        "variants": [
            ("Singapore Highlights & Universal Studios Fun", "Budget", 42999, 4, 3, "International Flight + MRT Transit Pass", "Hotel Boss / Ibis Singapore on Bencoolen", "Buffet Breakfast & Universal Studios Pass", "Universal Studios thrilling rides, Marina Bay light show, Merlion Park photo stop, and Little India street food trail."),
            ("Gardens by the Bay & Sentosa Cable Car Odyssey", "Standard", 58500, 5, 4, "Direct International Flight + Private Coach", "Grand Copthorne Waterfront / Orchard Hotel", "Buffet Breakfast & Sentosa Fun Pass", "Avatar-themed Cloud Forest & Flower Dome, Sentosa cable car, Night Safari tram ride, and Clarke Quay river cruise."),
            ("Marina Bay Sands SkyPark & Ultra Luxury Singapore", "Luxury", 115000, 5, 4, "Singapore Airlines Direct Flight + Limousine", "Marina Bay Sands (Club Room with Infinity Pool)", "Club Lounge Champagne Breakfast & Michelin Dining", "Exclusive access to the world-famous Marina Bay Sands 57th-floor infinity pool, private VIP Universal Studios escort, and yacht dinner.")
        ]
    },
    {
        "name": "Maldives Overwater Atolls",
        "type": "International",
        "tag": "Island of Crystal Lagoons",
        "img": "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=800&q=80",
        "variants": [
            ("Maldives Tropical Beachfront Villa & Dolphin Cruise", "Budget", 49999, 4, 3, "Direct Flight + Speedboat Transfers", "Kaani Palm Beach Resort (Maafushi Atoll)", "Buffet Breakfast & Dinner + Dolphin Safari", "Free 30-day visa on arrival for Indians, turquoise beach villa, nurse shark snorkeling, and sandbank picnic."),
            ("Maldives Lagoon Water Villa & Coral Reef Snorkel", "Standard", 84500, 5, 4, "Direct Flight + High-Speed Speedboat", "Sun Siyam Olhuveli / Adaaran Club Rannalhi", "All-Inclusive Meals & Unlimited Cocktails", "Direct steps into turquoise ocean from your private water villa, guided house-reef snorkeling, stingray feeding, and sunset DJ nights."),
            ("Ultra-Luxury Overwater Pool Villa with Slide", "Luxury", 175000, 5, 4, "Premium Flight + Scenic Seaplane Flight", "Soneva Jani / Anantara Kihavah Maldives", "All-Inclusive Michelin Star Gastronomy & Spa", "Curved water slide into crystal blue lagoon, retractable bedroom roof for stargazing, private underwater restaurant dining, and 24/7 private butler.")
        ]
    },
    {
        "name": "Dubai & Abu Dhabi, UAE",
        "type": "International",
        "tag": "City of Gold & Deserts",
        "img": "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80",
        "variants": [
            ("Burj Khalifa Top Floor & Desert Dune Bashing", "Budget", 39999, 5, 4, "Direct Flight + Shared AC Transfers", "Citymax Hotel Bur Dubai / Holiday Inn Express", "Buffet Breakfast & Desert BBQ Camp", "Burj Khalifa 124th floor observation deck, thrilling 4x4 red dune bashing with belly dance show and BBQ dinner, Dubai Mall fountain show."),
            ("Dubai Mega Parks, Marina Cruise & Ferrari World", "Standard", 62000, 6, 5, "Direct Emirates / IndiGo Flight + AC Cab", "JW Marriott Marquis / Millenium Plaza Downtown", "Buffet Breakfast & Luxury Dhow Marina Dinner", "Abu Dhabi Grand Mosque tour, Ferrari World roller coasters, Museum of the Future passes, and luxury yacht marina dinner cruise."),
            ("Atlantis The Palm & Burj Al Arab Royal Experience", "Luxury", 138000, 6, 5, "Business Class Flight + Rolls-Royce Chauffeur", "Atlantis The Royal / Burj Al Arab Jumeirah", "Michelin Dining, Aquaventure VIP & Helicopter Tour", "Private suite in the world's most iconic 7-star hotel, private scenic helicopter tour over Palm Jumeirah, and unlimited Aquaventure passes.")
        ]
    },
    {
        "name": "Colombo, Kandy & Bentota, Sri Lanka",
        "type": "International",
        "tag": "Pearl of the Indian Ocean",
        "img": "https://images.unsplash.com/photo-1546708973-b339540b5162?auto=format&fit=crop&w=800&q=80",
        "variants": [
            ("Sri Lanka Ramayana Trail & Kandy Temple of Tooth", "Budget", 28500, 5, 4, "Direct Flight (1 hr from Chennai) + AC Coach", "Cinnamon Red Colombo / Earl's Regency Kandy", "Buffet Breakfast & Cultural Kandyan Dance", "Temple of the Sacred Tooth Relic, Royal Botanical Gardens Peradeniya, tea plantation factory, and Colombo Dutch Hospital shopping."),
            ("Bentota Golden Beaches, Madu River & Turtle Hatchery", "Standard", 44000, 6, 5, "Direct Flight + Private AC Chauffeur Cab", "Heritance Ahungalla / Cinnamon Bey Beruwala", "Buffet Breakfast & Dinner (MAP Plan)", "Madu River mangrove boat safari, sea turtle conservation sanctuary, water sports in Bentota, and historic Galle Dutch Fort tour."),
            ("Heritance Kandalama Luxury & Sigiriya Rock Fortress", "Luxury", 82000, 6, 5, "Business Flight + Luxury Private Chauffeur", "Heritance Kandalama / Amangalla Galle Fort", "All-Inclusive Ceylon Fine Dining & Ayurvedic Spa", "Stay at Geoffrey Bawa's architectural marvel built into the rock face, climb 5th-century Sigiriya Lion Rock, and elephant wildlife safari.")
        ]
    },
    {
        "name": "Bangkok & Phuket, Thailand",
        "type": "International",
        "tag": "Islands, Temples & Nightlife",
        "img": "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?auto=format&fit=crop&w=800&q=80",
        "variants": [
            ("Bangkok Grand Palace & Patong Beach Getaway", "Budget", 32500, 5, 4, "Direct Flight + Shared AC Transfers", "Ibis Bangkok Riverside / The Marina Phuket", "Buffet Breakfast & Chao Phraya Dinner", "Grand Palace & Wat Pho Reclining Buddha, Chao Phraya luxury princess dinner cruise, Patong beach nightlife, and Big Buddha Phuket."),
            ("Phi Phi Island Speedboat & James Bond Bay Safari", "Standard", 51000, 6, 5, "Direct Flight + Private AC Chauffeur Cab", "Amari Phuket / Pullman Bangkok Hotel G", "Buffet Breakfast & Island Speedboat Tour", "Speedboat to Maya Bay (The Beach movie fame), snorkeling in turquoise Pileh Lagoon, James Bond Island sea kayaking, and Safari World."),
            ("Banyan Tree Phuket Private Pool Villa & Luxury Cruise", "Luxury", 98000, 6, 5, "Premium Flight + Private Luxury Sedan", "Banyan Tree Phuket / The Peninsula Bangkok", "All-Inclusive Dining, Private Catamaran & Spa", "Private pool sanctuary surrounded by tropical lagoons, private chartered catamaran to Racha Island, and Thai royal massage.")
        ]
    },
    {
        "name": "Bali & Nusa Penida, Indonesia",
        "type": "International",
        "tag": "Island of the Gods",
        "img": "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80",
        "variants": [
            ("Ubud Jungle Swing, Rice Terraces & Kuta Beach", "Budget", 36500, 5, 4, "Connecting Flight + Shared Tourist Van", "Zostel Ubud / The ONE Legian Hotel", "Buffet Breakfast & Balinese Coffee Tasting", "Famous Ubud giant jungle swing, Tegalalang emerald rice terraces, Sacred Monkey Forest, and Kuta beach sunset."),
            ("Nusa Penida Kelingking T-Rex & Uluwatu Fire Dance", "Standard", 56000, 6, 5, "Flight + High-Speed Speedboat + Private Cab", "The Haven Suites Bali Berawa / Ubud Village", "Buffet Breakfast & Seafood Dinner at Jimbaran", "Fast boat to dramatic Kelingking T-Rex cliff, Angel's Billabong natural infinity pool, Uluwatu clifftop temple with Kecak fire dance."),
            ("Ayana Resort Rock Bar & Private Jungle Pool Villa", "Luxury", 112000, 6, 5, "Premium Flight + VIP Airport Fast-track & Cab", "Ayana Resort and Spa, BALI / Viceroy Ubud", "All-Inclusive Luxury Dining, Thalassotherapy & Spa", "VIP access to the world-famous clifftop Rock Bar, private villa overlooking Ayung River valley, and traditional royal flower baths.")
        ]
    },
    {
        "name": "Kuala Lumpur & Langkawi, Malaysia",
        "type": "International",
        "tag": "Sky Towers & Geoparks",
        "img": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80",
        "variants": [
            ("Petronas Twin Towers & Batu Caves Exploration", "Budget", 29999, 4, 3, "Direct Flight + Monorail / Shared Cab", "Travelodge City Centre KL / Ibis Styles", "Buffet Breakfast & KL Tower Observation Pass", "Climb the vibrant 272 rainbow steps of Batu Caves, marvel at 88-story Petronas Twin Towers, and street food in Jalan Alor."),
            ("Langkawi SkyCab Cable Car & Mangrove Geopark", "Standard", 46500, 5, 4, "Direct Flight + Domestic Flight to Langkawi", "Berjaya Langkawi Resort / The Face Suites KL", "Buffet Breakfast & Mangrove Boat Safari", "Walk the dizzying Langkawi SkyBridge suspended 660m above sea level, Kilim Karst Geoforest mangrove boat safari with eagle feeding."),
            ("The Datai Langkawi Ultra-Luxury Rainforest Haven", "Luxury", 94000, 5, 4, "Premium Flight + Private Chauffeur Cab", "The Datai Langkawi / Mandarin Oriental KL", "All-Inclusive Gourmet Dining & Yacht Sunset Cruise", "Nestled inside a 10-million-year-old virgin rainforest on Datai Bay, private canopy villa, complimentary naturalist treks, and spa.")
        ]
    }
]

def generate_super_catalog():
    packages = []
    pid = 1

    # Every destination will have packages from multiple origins.
    # To guarantee EVERY destination has 30+ packages:
    # 22 destinations * ~35-40 packages each = ~800 packages total.
    # Each origin will have 80 packages! (Well above the required 30+)
    # Each destination will have 30+ packages! (Strictly satisfying user requirement)

    for dest in DESTINATION_PROFILES:
        dest_name = dest["name"]
        dest_type = dest["type"]
        tag = dest["tag"]
        dest_img = dest["img"]
        variants = dest["variants"]  # [ (title, cat, price, dur, nights, transport, hotel, meals, desc), ... ]

        # For this destination, create at least 36 packages across the 10 origins
        # 10 origins * 3 variants = 30 packages base.
        # Plus 6 seasonal/special packages = 36 packages per destination!
        for origin in ORIGINS:
            for variant_idx, v in enumerate(variants):
                v_title, v_cat, base_price, duration, nights, transport, hotel, meals, desc = v
                
                # Small origin distance adjustment to price
                origin_offset = 0
                if origin in ('Salem', 'Erode', 'Tirunelveli'):
                    origin_offset = random.randint(400, 1200)
                elif origin in ('Chennai', 'Hosur', 'Puducherry'):
                    origin_offset = random.randint(-500, 500)
                
                amount = float(max(4999, base_price + origin_offset))
                
                # Title
                title = f"{origin} to {dest_name.split(',')[0]} ({v_cat} {v_title})"
                if len(title) > 65:
                    title = f"{origin} ➔ {dest_name.split(',')[0]} {v_cat} Tour"
                
                rating = round(random.uniform(4.7, 5.0), 1)
                seats = random.randint(8, 25)

                pkg = {
                    "id": pid,
                    "agent_id": random.choice([1, 2, 7]),
                    "agent_name": random.choice(["Sarah Connor", "Rajesh Kannan", "Lyan Senior Tour Director"]),
                    "title": title,
                    "source": origin,
                    "origin": origin,
                    "destination": dest_name,
                    "destination_type": dest_type,
                    "amount": amount,
                    "starting_price": amount,
                    "rating": rating,
                    "transport": transport,
                    "duration_days": duration,
                    "duration": f"{duration}D / {nights}N",
                    "available_seats": seats,
                    "category": v_cat,
                    "description": f"Direct departure from {origin} to {dest_name}. {desc} Accommodations at {hotel}. {meals}.",
                    "image_url": dest_img,
                    "is_featured": random.choice([True, False, False]),
                    "popular_from_tn": True,
                    "hotel_category": hotel.split('(')[0].strip() if '(' in hotel else hotel[:35],
                    "meals": meals,
                    "inclusions": [
                        f"Round-trip {transport.split('+')[0].strip()} from {origin}",
                        f"Hand-picked stay at {hotel.split('/')[0].strip()}",
                        meals,
                        "All inter-city transfers and local sightseeing permits",
                        "24/7 dedicated Tamil & English on-trip concierge assistance"
                    ]
                }
                packages.append(pkg)
                pid += 1

        # Add 4 extra seasonal/festive specialty packages for this destination
        specialty_themes = [
            ("Family Special Combo", "Standard", 1.15),
            ("Romantic Couple Honeymoon Pass", "Luxury", 1.35),
            ("Weekend Fast-Track Explorer", "Economy", 0.95),
            ("Senior Citizens Heritage & Wellness", "Standard", 1.10),
        ]
        for extra_idx, (spec_title, spec_cat, mult) in enumerate(specialty_themes):
            spec_origin = ORIGINS[extra_idx % len(ORIGINS)]
            v = variants[1 if len(variants) > 1 else 0]
            v_title, _, base_price, duration, nights, transport, hotel, meals, desc = v
            amount = float(round(base_price * mult, -2))
            
            pkg = {
                "id": pid,
                "agent_id": 2,
                "agent_name": "Sarah Connor",
                "title": f"{spec_origin} to {dest_name.split(',')[0]} – {spec_title}",
                "source": spec_origin,
                "origin": spec_origin,
                "destination": dest_name,
                "destination_type": dest_type,
                "amount": amount,
                "starting_price": amount,
                "rating": 4.9,
                "transport": transport,
                "duration_days": duration,
                "duration": f"{duration}D / {nights}N",
                "available_seats": random.randint(10, 20),
                "category": spec_cat,
                "description": f"Special curated departure from {spec_origin}. {spec_title} tailored for memorable experiences at {dest_name}. Includes VIP sightseeing passes.",
                "image_url": dest_img,
                "is_featured": True,
                "popular_from_tn": True,
                "hotel_category": hotel.split('(')[0].strip(),
                "meals": meals,
                "inclusions": [
                    f"VIP transport from {spec_origin}",
                    f"Premium accommodation: {hotel.split('/')[0].strip()}",
                    meals,
                    "Express skip-the-line monument & attraction tickets",
                    "Dedicated local guide & on-trip emergency cover"
                ]
            }
            packages.append(pkg)
            pid += 1

    print(f"Generated {len(packages)} rich, verified packages!")

    # Verify counts per destination and source
    from collections import Counter
    dest_counts = Counter(p["destination"] for p in packages)
    source_counts = Counter(p["source"] for p in packages)

    print("\n--- DESTINATION COUNTS (Checking all >= 30) ---")
    for d, c in dest_counts.most_common():
        assert c >= 30, f"Error: Destination {d} has only {c} packages!"
        print(f"  {d}: {c} packages")

    print("\n--- SOURCE ORIGIN COUNTS (Checking all >= 30) ---")
    for s, c in source_counts.most_common():
        assert c >= 30, f"Error: Source {s} has only {c} packages!"
        print(f"  {s}: {c} packages")

    out_file = os.path.join(DATA_DIR, "packages.json")
    with open(out_file, "w", encoding="utf-8") as f:
        json.dump(packages, f, indent=2)
    print(f"\nSaved {len(packages)} packages to {out_file}")

if __name__ == "__main__":
    generate_super_catalog()
