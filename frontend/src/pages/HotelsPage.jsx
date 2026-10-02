import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/client';
import { formatINR } from '../utils/currency';
import { useAuth } from '../context/AuthContext';

const DEFAULT_HOSTELS = [
  {
    id: 1,
    name: "Zostel Morjim (Beachfront Backpacker)",
    city: "Morjim, Goa",
    destination: "Goa",
    type: "Youth & Backpacker Hostel",
    price_per_night: 799,
    rating: 4.9,
    reviews_count: 312,
    bed_types: ["6-Bed Mixed AC Dorm", "4-Bed Female AC Dorm", "Private Deluxe Sea-View Pod"],
    image_url: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80",
    amenities: ["Free High-Speed WiFi", "Air Conditioning", "Individual Lockers", "Common Cafe", "Beach Access", "Bonfire Nights"],
    description: "Located directly on Morjim's turtle nesting beach. Vibrant social community, co-working spaces, evening jam sessions, and surfboard rentals."
  },
  {
    id: 2,
    name: "The Hosteller Anjuna (Party & Vibe)",
    city: "Anjuna, Goa",
    destination: "Goa",
    type: "Youth & Backpacker Hostel",
    price_per_night: 899,
    rating: 4.8,
    reviews_count: 245,
    bed_types: ["8-Bed Mixed AC Dorm", "Private Poolside Container Pod"],
    image_url: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80",
    amenities: ["Swimming Pool", "Free WiFi", "Bar & Cafe", "Bicycle Rental", "Luggage Storage", "Game Room"],
    description: "10-minute walk from Anjuna flea market and Curlies. Chill swimming pool, neon outdoor lounge, and daily pub crawls."
  },
  {
    id: 3,
    name: "The Lost Hostels Varkala Beach Cliff",
    city: "Varkala, Kerala",
    destination: "Varkala & Kovalam, Kerala",
    type: "Youth & Backpacker Hostel",
    price_per_night: 650,
    rating: 4.9,
    reviews_count: 288,
    bed_types: ["6-Bed Ocean Breeze Dorm", "Female Only Dorm", "Private Bamboo Hut"],
    image_url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
    amenities: ["Cliff Ocean View", "Rooftop Yoga", "Shared Kitchen", "Free High-Speed WiFi", "Surfboard Rental", "Hammocks"],
    description: "Perched on the scenic North Cliff of Varkala. Wake up to panoramic Arabian Sea waves, join sunrise rooftop yoga, and enjoy community vegan dinners."
  },
  {
    id: 4,
    name: "The Hosteller Ooty (Colonial Mountain Estate)",
    city: "Ooty, Tamil Nadu",
    destination: "Ooty & Coonoor, Tamil Nadu",
    type: "Youth & Backpacker Hostel",
    price_per_night: 699,
    rating: 4.8,
    reviews_count: 194,
    bed_types: ["6-Bed Wooden Bunk Dorm", "Private British Fireplace Cottage"],
    image_url: "https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?auto=format&fit=crop&w=800&q=80",
    amenities: ["Eucalyptus Forest View", "Hot Water 24/7", "Indoor Fireplace", "Board Games", "Free WiFi", "Cafe"],
    description: "Heritage British-era bungalow converted into a cozy backpacker haven. Surrounded by tea gardens, cozy wood fires at night, and Nilgiri tea tasting."
  },
  {
    id: 5,
    name: "Zostel Munnar (Misty Tea Valley)",
    city: "Munnar, Kerala",
    destination: "Munnar & Alleppey, Kerala",
    type: "Youth & Backpacker Hostel",
    price_per_night: 749,
    rating: 4.9,
    reviews_count: 340,
    bed_types: ["6-Bed Mountain View Dorm", "4-Bed Female Dorm", "Private Valley Glamping Pod"],
    image_url: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=800&q=80",
    amenities: ["Unobstructed Tea Valley Views", "Campfire", "Trek Organizers", "In-house Cafe", "Free WiFi", "Hot Showers"],
    description: "Overlooking rolling green carpets of Munnar tea hills. Offers morning tea garden treks, cloud valley sunrise views, and interactive social games."
  },
  {
    id: 6,
    name: "Trippy Goat Backpacker Lodge",
    city: "Kodaikanal, Tamil Nadu",
    destination: "Kodaikanal, Tamil Nadu",
    type: "Youth & Backpacker Hostel",
    price_per_night: 599,
    rating: 4.7,
    reviews_count: 156,
    bed_types: ["8-Bed Pine View Dorm", "Private Rustic Attic Room"],
    image_url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
    amenities: ["Pine Forest Trail", "Bonfire", "Acoustic Guitar Lounge", "Free WiFi", "Hot Showers", "Organic Cafe"],
    description: "Tucked away inside Kodaikanal's dense pine forest. Perfect spot for stargazing, acoustic music jams by the campfire, and lake trail hikes."
  },
  {
    id: 7,
    name: "Nomad House French Quarter",
    city: "Pondicherry",
    destination: "Pondicherry, India",
    type: "Youth & Backpacker Hostel",
    price_per_night: 650,
    rating: 4.8,
    reviews_count: 210,
    bed_types: ["6-Bed AC Pastel Dorm", "Private French Studio"],
    image_url: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=800&q=80",
    amenities: ["Bicycle Rental", "Air Conditioning", "Rooftop Terrace", "Free Coffee & Tea", "Co-working Desks", "Free WiFi"],
    description: "Charming yellow colonial facade in the heart of White Town. Walk to promenade beach in 3 minutes, rent cute cycles, and work on high-speed fiber internet."
  },
  {
    id: 8,
    name: "Zostel Old Manali (Riverside Mountain)",
    city: "Old Manali, Himachal",
    destination: "Manali & Rohtang Pass, Himachal",
    type: "Youth & Backpacker Hostel",
    price_per_night: 699,
    rating: 4.9,
    reviews_count: 420,
    bed_types: ["6-Bed Mixed Dorm", "4-Bed Female Dorm", "Private Wooden Chalet"],
    image_url: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=800&q=80",
    amenities: ["Snow Peak Views", "River Sound Balcony", "Cafe with Live Music", "Heated Beds", "Bonfire", "Free WiFi"],
    description: "The quintessential Manali backpacker experience. Perched amidst apple orchards with stunning views of Pir Panjal snow peaks and buzzing Old Manali cafes."
  },
  {
    id: 9,
    name: "Moustache Hostel Jaipur (Rooftop Pink City)",
    city: "Jaipur, Rajasthan",
    destination: "Jaipur & Udaipur, Rajasthan",
    type: "Youth & Backpacker Hostel",
    price_per_night: 550,
    rating: 4.8,
    reviews_count: 310,
    bed_types: ["8-Bed Royal Bunk Dorm", "Private Heritage Shekhawati Room"],
    image_url: "https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=800&q=80",
    amenities: ["Rooftop Fort View Cafe", "Traditional Rajasthani Puppet Shows", "AC Dorms", "Travel Desk", "Free WiFi"],
    description: "Cultural hostel with traditional Rajasthani frescoes. Rooftop terrace with views of Nahargarh Fort, authentic chai sessions, and bazaar walking tours."
  },
  {
    id: 10,
    name: "Zostel Tapovan Rishikesh (Ganges View)",
    city: "Rishikesh, Uttarakhand",
    destination: "Rishikesh, Uttarakhand",
    type: "Youth & Backpacker Hostel",
    price_per_night: 620,
    rating: 4.9,
    reviews_count: 380,
    bed_types: ["6-Bed Ganges View Dorm", "Private Rooftop Pod"],
    image_url: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80",
    amenities: ["Rooftop Ganga View", "Yoga Hall", "Rafting Bookings", "Lockers", "Cafe", "Free WiFi"],
    description: "Steps away from Laxman Jhula in peaceful Tapovan. Join complimentary morning yoga, book white water rafting at discounted rates, and watch holy Ganga aarti."
  },
  {
    id: 11,
    name: "Zostel Wayanad (Bamboo Retreat)",
    city: "Wayanad, Kerala",
    destination: "Wayanad, Kerala",
    type: "Youth & Backpacker Hostel",
    price_per_night: 699,
    rating: 4.8,
    reviews_count: 185,
    bed_types: ["6-Bed Bamboo Dorm", "Private Tree-pod"],
    image_url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
    amenities: ["Coffee Plantation Walk", "Bamboo Architecture", "Hammock Garden", "Free WiFi", "Hot Showers"],
    description: "Hidden amidst aromatic coffee and pepper vines. Natural bamboo cottages, birdwatching trails, and local Kerala homemade meals."
  },
  {
    id: 12,
    name: "Cape Backpacker Lodge Kanyakumari",
    city: "Kanyakumari, Tamil Nadu",
    destination: "Kanyakumari, Tamil Nadu",
    type: "Budget Lodge & Stay",
    price_per_night: 499,
    rating: 4.6,
    reviews_count: 140,
    bed_types: ["4-Bed Ocean View Dorm", "Private Double Room"],
    image_url: "https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?auto=format&fit=crop&w=800&q=80",
    amenities: ["Sunrise Rooftop", "Free WiFi", "Water Dispenser", "Tour Guidance", "Baggage Storage"],
    description: "Only 400 meters from the confluence of Indian Ocean, Arabian Sea, and Bay of Bengal. Unbeatable sunrise viewing directly from the rooftop."
  },
  {
    id: 13,
    name: "Zostel Gokarna (Kudle Beach Cliff)",
    city: "Gokarna, Karnataka",
    destination: "Gokarna, Karnataka",
    type: "Youth & Backpacker Hostel",
    price_per_night: 799,
    rating: 4.9,
    reviews_count: 360,
    bed_types: ["6-Bed Sea View Mixed Dorm", "Female Only Dorm", "Private Beachside Hut"],
    image_url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
    amenities: ["Direct Kudle Beach Trail", "Infinity Sea Gazebo", "Cafe with Fresh Seafood", "Free WiFi", "Yoga Mats"],
    description: "Perched on the cliffs between Kudle Beach and Gokarna town. Unbelievable cliffside sea views, sunset acoustic jams, and beach trekking."
  },
  {
    id: 14,
    name: "The Hosteller Coorg (Coffee Estate Dorms)",
    city: "Madikeri, Coorg",
    destination: "Coorg, Karnataka",
    type: "Youth & Backpacker Hostel",
    price_per_night: 650,
    rating: 4.8,
    reviews_count: 215,
    bed_types: ["8-Bed Estate Bunk Dorm", "Private Coffee Cottage"],
    image_url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
    amenities: ["Plantation Tour", "Bonfire Nights", "High-speed Fiber WiFi", "Game Room", "Delicious Coorg Curry"],
    description: "Stay directly inside a 30-acre operational coffee estate. Fresh morning brew, misty plantation walks, and cozy evenings around the fireplace."
  }
];

export default function HotelsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [hostels, setHostels] = useState(DEFAULT_HOSTELS);
  const [loading, setLoading] = useState(false);

  // Filters
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'hostel', 'hotel', 'resort'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDest, setSelectedDest] = useState('All');
  const [maxPrice, setMaxPrice] = useState(3000);

  // Booking Modal State
  const [selectedHostel, setSelectedHostel] = useState(null);
  const [bookingStep, setBookingStep] = useState(1); // 1: details, 2: payment method, 3: voucher
  const [checkInDate, setCheckInDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    return d.toISOString().split('T')[0];
  });
  const [nights, setNights] = useState(2);
  const [guests, setGuests] = useState(1);
  const [bedType, setBedType] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('UPI (Google Pay / PhonePe)');
  const [upiId, setUpiId] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState(null);
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    api.get('/hostels')
      .then((res) => {
        if (res.data?.data && res.data.data.length > 0) {
          setHostels(res.data.data);
        }
      })
      .catch((err) => {
        console.warn('Using client-side hostel catalog:', err);
      });
  }, []);

  const openBooking = (hostel) => {
    setSelectedHostel(hostel);
    setBedType(hostel.bed_types?.[0] || 'Standard Bed');
    setBookingStep(1);
    setBookingSuccess(null);
    setPaymentMethod('UPI (Google Pay / PhonePe)');
  };

  const handleProceedToPayment = (e) => {
    e.preventDefault();
    if (!checkInDate) return;
    setBookingStep(2);
  };

  const handleConfirmHostelBooking = async (e) => {
    e.preventDefault();
    if (!selectedHostel) return;
    setBookingLoading(true);

    const totalAmount = Math.round(selectedHostel.price_per_night * Number(guests) * Number(nights) * 1.05);
    const pnr = `HST-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const txnId = `TXN-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;

    const newBooking = {
      id: Date.now(),
      booking_code: pnr,
      pnr,
      transaction_id: txnId,
      trip_title: `Stay: ${selectedHostel.name} (${bedType})`,
      source: selectedHostel.city,
      origin: selectedHostel.city,
      departure_city: selectedHostel.city,
      destination: selectedHostel.destination,
      travel_date: checkInDate,
      travelers_count: Number(guests),
      traveler_names: [user?.name || 'Traveler User'],
      total_amount: totalAmount,
      status: 'confirmed',
      payment_status: 'completed',
      payment_method: paymentMethod,
      timeline_step: 2,
      special_requests: specialRequests,
      created_at: new Date().toISOString()
    };

    // Save to localStorage immediately so it's resilient & visible everywhere
    try {
      const existing = JSON.parse(localStorage.getItem('user_bookings') || '[]');
      localStorage.setItem('user_bookings', JSON.stringify([newBooking, ...existing]));
    } catch (storageErr) {
      console.warn('localStorage booking cache warning:', storageErr);
    }

    // Broadcast confirmed event
    window.dispatchEvent(
      new CustomEvent('lyan_booking_confirmed', {
        detail: { booking: newBooking, note: `Stay booked at ${selectedHostel.name}` },
      })
    );

    // Call backend API
    try {
      await api.post('/hostels/book', {
        hostelId: selectedHostel.id,
        checkInDate,
        nights: Number(nights),
        guests: Number(guests),
        bedType,
        specialRequests,
        paymentMethod
      });
    } catch (err) {
      console.warn('Backend sync note (offline-resilient booking):', err);
    }

    setBookingSuccess(newBooking);
    setBookingStep(3);
    setBookingLoading(false);
  };

  // Filtered List
  const filteredHostels = hostels.filter((h) => {
    if (selectedDest !== 'All' && !h.destination.toLowerCase().includes(selectedDest.toLowerCase()) && !h.city.toLowerCase().includes(selectedDest.toLowerCase())) {
      return false;
    }
    if (h.price_per_night > maxPrice) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match = h.name.toLowerCase().includes(q) || h.city.toLowerCase().includes(q) || h.destination.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  const destOptions = ['All', 'Goa', 'Varkala', 'Munnar', 'Ooty', 'Kodaikanal', 'Pondicherry', 'Manali', 'Jaipur', 'Rishikesh', 'Wayanad', 'Gokarna', 'Coorg'];

  return (
    <div className="section-wrapper" style={{ paddingTop: '2.5rem', paddingBottom: '4rem' }}>
      {/* Hero Header */}
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'var(--primary-light)', color: 'var(--primary)', padding: '0.35rem 0.9rem', borderRadius: '9999px', fontSize: '0.82rem', fontWeight: '700', marginBottom: '0.75rem' }}>
          <span>🏨</span>
          <span>Verified Backpacker Hostels, Boutique Pods & Deluxe Stays</span>
        </div>
        <h1 style={{ fontSize: '2.4rem', color: 'var(--primary)' }}>
          Hostels & Stays Booking Network
        </h1>
        <p style={{ color: 'var(--text-muted)', maxWidth: '680px', margin: '0.5rem auto 0', fontSize: '1.05rem' }}>
          Book budget backpacker dorms, private pods, beach shacks, and mountain tea retreats. Verified hygiene, social spaces, and zero hidden fees.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div style={{ background: '#fff', borderRadius: 'var(--radius-xl)', padding: '1.5rem', border: '1.5px solid var(--border-light)', boxShadow: 'var(--shadow-sm)', marginBottom: '2.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', alignItems: 'flex-end' }}>
          <div className="form-group">
            <label style={{ fontSize: '0.85rem', fontWeight: '700' }}>🔍 Search Property or Place</label>
            <input
              type="text"
              placeholder="e.g. Zostel, Goa beach, Varkala cliff..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: '100%', padding: '0.65rem 0.9rem', borderRadius: '8px', border: '1.5px solid var(--border-light)' }}
            />
          </div>

          <div className="form-group">
            <label style={{ fontSize: '0.85rem', fontWeight: '700' }}>📍 Destination</label>
            <select
              value={selectedDest}
              onChange={(e) => setSelectedDest(e.target.value)}
              style={{ width: '100%', padding: '0.65rem 0.9rem', borderRadius: '8px', border: '1.5px solid var(--border-light)' }}
            >
              {destOptions.map((d) => (
                <option key={d} value={d}>{d === 'All' ? 'All Destinations' : d}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label style={{ fontSize: '0.85rem', fontWeight: '700' }}>💰 Max Price: {formatINR(maxPrice)} / night</label>
            <input
              type="range"
              min="400"
              max="3000"
              step="100"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              style={{ width: '100%' }}
            />
          </div>

          <div>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                setSearchQuery('');
                setSelectedDest('All');
                setMaxPrice(3000);
              }}
              style={{ width: '100%', padding: '0.7rem' }}
            >
              Reset Filters
            </button>
          </div>
        </div>
      </div>

      {/* Results Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1.25rem', color: 'var(--text-dark)' }}>
          Available Stays ({filteredHostels.length} verified properties)
        </h3>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Prices include free WiFi & social amenities
        </span>
      </div>

      {/* Stays Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2rem' }}>
        {filteredHostels.map((h) => (
          <div
            key={h.id}
            style={{
              background: '#fff',
              borderRadius: 'var(--radius-xl)',
              overflow: 'hidden',
              border: '1.5px solid var(--border-light)',
              boxShadow: 'var(--shadow-sm)',
              display: 'flex',
              flexDirection: 'column',
              transition: 'transform 0.25s ease, box-shadow 0.25s ease'
            }}
          >
            {/* Image Banner */}
            <div style={{ position: 'relative', height: '190px' }}>
              <img
                src={h.image_url}
                alt={h.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div style={{ position: 'absolute', top: '12px', left: '12px', background: 'rgba(15, 23, 42, 0.75)', color: '#fff', backdropFilter: 'blur(6px)', padding: '0.25rem 0.65rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '700' }}>
                ⭐ {h.rating} ({h.reviews_count} reviews)
              </div>
              <div style={{ position: 'absolute', bottom: '12px', right: '12px', background: 'var(--primary)', color: '#fff', padding: '0.35rem 0.75rem', borderRadius: '8px', fontWeight: '800', fontSize: '0.95rem', boxShadow: '0 4px 10px rgba(0,0,0,0.2)' }}>
                {formatINR(h.price_per_night)} <span style={{ fontSize: '0.7rem', fontWeight: '400' }}>/ night</span>
              </div>
            </div>

            {/* Content Body */}
            <div style={{ padding: '1.4rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--secondary)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                  📍 {h.city}
                </span>
                <h3 style={{ fontSize: '1.2rem', color: 'var(--text-dark)', marginTop: '0.2rem', marginBottom: '0.5rem', lineHeight: '1.3' }}>
                  {h.name}
                </h3>
                <p style={{ fontSize: '0.86rem', color: 'var(--text-body)', lineHeight: '1.5', marginBottom: '1rem' }}>
                  {h.description}
                </p>

                {/* Bed Options */}
                <div style={{ marginBottom: '1rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '0.35rem' }}>
                    Available Bed Types:
                  </span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                    {h.bed_types?.map((bt, idx) => (
                      <span key={idx} style={{ background: 'var(--bg-subtle)', color: 'var(--primary)', fontSize: '0.74rem', padding: '0.2rem 0.55rem', borderRadius: '4px', fontWeight: '600', border: '1px solid var(--border-light)' }}>
                        🛏️ {bt}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Amenities */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1.25rem' }}>
                  {h.amenities?.slice(0, 4).map((a, idx) => (
                    <span key={idx} style={{ fontSize: '0.72rem', background: '#f1f5f9', color: '#475569', padding: '0.15rem 0.45rem', borderRadius: '4px' }}>
                      ✓ {a}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem', paddingTop: '1rem', borderTop: '1px solid var(--border-light)' }}>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => openBooking(h)}
                  style={{ justifyContent: 'center', padding: '0.6rem 0.8rem', fontSize: '0.86rem' }}
                >
                  ⚡ Book Stay
                </button>
                <Link
                  to={`/packages?destination=${encodeURIComponent(h.destination)}`}
                  className="btn-secondary"
                  style={{ justifyContent: 'center', padding: '0.6rem 0.8rem', fontSize: '0.82rem', textAlign: 'center' }}
                >
                  View Trips ➔
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Hostel Booking & Payment Modal */}
      {selectedHostel && (
        <div className="modal-backdrop" onClick={() => setSelectedHostel(null)}>
          <div className="booking-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '620px' }}>
            <button className="modal-close-btn" onClick={() => setSelectedHostel(null)}>
              ✕
            </button>

            {/* Modal Header */}
            <div className="modal-header">
              <span className="category-pill">Hostel & Stay Reservation</span>
              <h2>{selectedHostel.name}</h2>
              <p className="subtitle">📍 {selectedHostel.city} • Verified Property Network</p>
            </div>

            {/* Step Progress Indicators */}
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.75rem', marginBottom: '1.25rem', fontSize: '0.85rem', fontWeight: '700' }}>
              <span style={{ color: bookingStep >= 1 ? 'var(--primary)' : 'var(--text-muted)' }}>
                1. Stay Details {bookingStep > 1 && '✓'}
              </span>
              <span style={{ color: bookingStep >= 2 ? 'var(--primary)' : 'var(--text-muted)' }}>
                2. Choose Payment Method {bookingStep > 2 && '✓'}
              </span>
              <span style={{ color: bookingStep === 3 ? '#16a34a' : 'var(--text-muted)' }}>
                3. Confirmed Voucher
              </span>
            </div>

            {/* STEP 1: STAY DATES & GUESTS */}
            {bookingStep === 1 && (
              <form onSubmit={handleProceedToPayment} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label>📅 Check-in Date</label>
                    <input
                      type="date"
                      required
                      value={checkInDate}
                      onChange={(e) => setCheckInDate(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label>🌙 Duration (Nights)</label>
                    <input
                      type="number"
                      min="1"
                      max="30"
                      required
                      value={nights}
                      onChange={(e) => setNights(e.target.value)}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label>👤 Guests / Beds</label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      required
                      value={guests}
                      onChange={(e) => setGuests(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label>🛏️ Bed / Room Type</label>
                    <select value={bedType} onChange={(e) => setBedType(e.target.value)}>
                      {selectedHostel.bed_types?.map((bt, idx) => (
                        <option key={idx} value={bt}>{bt}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>📝 Special Requests (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Quiet dorm corner, late check-in at 10 PM..."
                    value={specialRequests}
                    onChange={(e) => setSpecialRequests(e.target.value)}
                  />
                </div>

                {/* Price Breakdown */}
                <div style={{ background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', padding: '1rem', border: '1px solid var(--border-light)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                    <span>Stay Cost ({guests} Guests × {nights} Nights × {formatINR(selectedHostel.price_per_night)}):</span>
                    <strong>{formatINR(selectedHostel.price_per_night * guests * nights)}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                    <span>Hospitality GST (5%):</span>
                    <span>{formatINR(selectedHostel.price_per_night * guests * nights * 0.05)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.05rem', fontWeight: '800', color: 'var(--primary)', borderTop: '1px solid var(--border-light)', paddingTop: '0.5rem', marginTop: '0.35rem' }}>
                    <span>Total Amount Payable:</span>
                    <span>{formatINR(Math.round(selectedHostel.price_per_night * guests * nights * 1.05))}</span>
                  </div>
                </div>

                <div className="modal-actions" style={{ marginTop: '0.75rem' }}>
                  <button type="submit" className="btn-primary" style={{ flex: 1, justifyContent: 'center', padding: '0.8rem' }}>
                    Proceed to Payment ➔
                  </button>
                  <button type="button" className="btn-secondary" onClick={() => setSelectedHostel(null)}>
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {/* STEP 2: CHOOSE PAYMENT PROCESS */}
            {bookingStep === 2 && (
              <form onSubmit={handleConfirmHostelBooking} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Total Amount to Pay:</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--primary)' }}>
                      {formatINR(Math.round(selectedHostel.price_per_night * guests * nights * 1.05))}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', fontSize: '0.8rem', color: '#16a34a', fontWeight: '700' }}>
                    🔒 256-Bit Encrypted Secure Checkout
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.88rem', fontWeight: '700', color: 'var(--text-dark)', display: 'block', marginBottom: '0.5rem' }}>
                    Choose Your Preferred Payment Method:
                  </label>
                  <div className="payment-selector-card">
                    {[
                      { key: 'UPI (Google Pay / PhonePe)', icon: '📱', name: 'Instant UPI', desc: 'GPay / PhonePe / Paytm / QR' },
                      { key: 'Credit / Debit Card', icon: '💳', name: 'Cards', desc: 'Visa, RuPay, Mastercard' },
                      { key: 'Net Banking', icon: '🏦', name: 'Net Banking', desc: 'SBI, HDFC, ICICI, Axis' },
                      { key: 'Lyan Travel Wallet', icon: '👛', name: 'Travel Wallet', desc: 'Instant 1-Click Debit' },
                    ].map((m) => (
                      <div
                        key={m.key}
                        className={`payment-method-pill ${paymentMethod === m.key ? 'active' : ''}`}
                        onClick={() => setPaymentMethod(m.key)}
                      >
                        <span className="payment-method-icon">{m.icon}</span>
                        <span className="payment-method-name">{m.name}</span>
                        <span className="payment-method-desc">{m.desc}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Conditional Payment Field */}
                {paymentMethod.includes('UPI') && (
                  <div className="form-group" style={{ background: '#f0fdf4', padding: '1rem', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
                    <label style={{ color: '#166534', fontWeight: '700', fontSize: '0.85rem' }}>
                      Enter your UPI ID / Virtual Payment Address:
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. mobile@okaxis or username@okhdfcbank"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      style={{ marginTop: '0.35rem', background: '#fff' }}
                    />
                    <div style={{ fontSize: '0.75rem', color: '#15803d', marginTop: '0.4rem' }}>
                      ⚡ Simulated Instant UPI Confirmation Active. You can click Pay & Confirm to simulate an approved transaction.
                    </div>
                  </div>
                )}

                {paymentMethod.includes('Card') && (
                  <div className="form-group" style={{ background: '#eff6ff', padding: '1rem', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
                    <label style={{ color: '#1e40af', fontWeight: '700', fontSize: '0.85rem' }}>
                      Enter Card Number (Simulated Sandbox):
                    </label>
                    <input
                      type="text"
                      placeholder="4111 2222 3333 4444"
                      maxLength={19}
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      style={{ marginTop: '0.35rem', background: '#fff' }}
                    />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '0.5rem' }}>
                      <input type="text" placeholder="MM/YY" maxLength={5} style={{ background: '#fff' }} />
                      <input type="password" placeholder="CVV" maxLength={4} style={{ background: '#fff' }} />
                    </div>
                  </div>
                )}

                {paymentMethod.includes('Net Banking') && (
                  <div className="form-group" style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                    <label style={{ fontWeight: '700', fontSize: '0.85rem' }}>Select Bank:</label>
                    <select style={{ marginTop: '0.35rem' }}>
                      <option>State Bank of India (SBI)</option>
                      <option>HDFC Bank</option>
                      <option>ICICI Bank</option>
                      <option>Axis Bank</option>
                      <option>Kotak Mahindra Bank</option>
                    </select>
                  </div>
                )}

                {paymentMethod.includes('Wallet') && (
                  <div style={{ background: '#fef3c7', padding: '0.85rem 1rem', borderRadius: '8px', border: '1px solid #fde68a', fontSize: '0.85rem', color: '#92400e' }}>
                    👛 Lyan Travel Wallet Balance: <strong>₹25,000</strong>. Remaining balance after checkout: <strong>{formatINR(25000 - Math.round(selectedHostel.price_per_night * guests * nights * 1.05))}</strong>.
                  </div>
                )}

                <div className="modal-actions" style={{ marginTop: '0.5rem' }}>
                  <button
                    type="submit"
                    className="btn-coral"
                    disabled={bookingLoading}
                    style={{ flex: 1, justifyContent: 'center', padding: '0.85rem', fontSize: '0.95rem' }}
                  >
                    {bookingLoading ? 'Processing Secure Payment…' : `Pay ${formatINR(Math.round(selectedHostel.price_per_night * guests * nights * 1.05))} & Complete Booking ➔`}
                  </button>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => setBookingStep(1)}
                  >
                    ← Back
                  </button>
                </div>
              </form>
            )}

            {/* STEP 3: OFFICIAL BOARDING & STAY VOUCHER */}
            {bookingStep === 3 && bookingSuccess && (
              <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                <span style={{ fontSize: '3.5rem' }}>🎉</span>
                <h2 style={{ color: 'var(--primary)', marginTop: '0.5rem' }}>Booking & Payment Successful!</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginTop: '0.25rem' }}>
                  Your reservation is confirmed. Your check-in voucher is ready in My Bookings.
                </p>

                <div style={{ background: '#f8fafc', borderRadius: '14px', border: '1.5px solid #cbd5e1', padding: '1.5rem', margin: '1.5rem 0', textAlign: 'left' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', borderBottom: '1px dashed #cbd5e1', paddingBottom: '0.5rem' }}>
                    <span style={{ fontWeight: '800', color: 'var(--primary)', fontSize: '0.85rem' }}>OFFICIAL STAY VOUCHER</span>
                    <span style={{ background: '#dcfce7', color: '#16a34a', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: '800', fontSize: '0.75rem' }}>
                      PAID & CONFIRMED
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>Reservation PNR:</span>
                    <code style={{ background: '#fff', padding: '0.2rem 0.6rem', border: '1px solid #cbd5e1', borderRadius: '4px', fontWeight: '800', color: 'var(--primary)', fontSize: '0.95rem' }}>
                      {bookingSuccess.pnr}
                    </code>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.88rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Property:</span>
                    <strong>{selectedHostel.name}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.88rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Bed / Room Type:</span>
                    <strong>{bedType}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.88rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Check-in & Duration:</span>
                    <strong>{checkInDate} ({nights} Nights • {guests} Guests)</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.88rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Payment Method:</span>
                    <strong>{paymentMethod}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem', borderTop: '1px solid #e2e8f0', paddingTop: '0.5rem', marginTop: '0.5rem' }}>
                    <span>Total Amount Paid:</span>
                    <strong style={{ color: '#16a34a' }}>{formatINR(bookingSuccess.total_amount)}</strong>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
                  <button
                    type="button"
                    className="btn-primary"
                    onClick={() => {
                      setSelectedHostel(null);
                      navigate('/my-bookings');
                    }}
                    style={{ padding: '0.75rem 1.5rem', fontWeight: '700' }}
                  >
                    View in My Bookings ➔
                  </button>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => setSelectedHostel(null)}
                    style={{ padding: '0.75rem 1.5rem' }}
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
