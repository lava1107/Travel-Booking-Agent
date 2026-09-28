import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/client';
import PackageCard from '../components/PackageCard';
import BookingModal from '../components/BookingModal';
import { formatINR } from '../utils/currency';

const TN_CITIES = [
  'Chennai',
  'Coimbatore',
  'Madurai',
  'Tiruchirappalli',
  'Salem',
  'Tirunelveli',
  'Erode',
  'Vellore',
  'Hosur',
  'Thanjavur',
  'Puducherry',
];

export default function Home() {
  const navigate = useNavigate();
  const [featuredTrips, setFeaturedTrips] = useState([]);
  const [tnTrips, setTnTrips] = useState([]);
  const [intlTrips, setIntlTrips] = useState([]);
  const [budgetTrips, setBudgetTrips] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTrip, setSelectedTrip] = useState(null);

  // Quick Search Box State
  const [fromCity, setFromCity] = useState('Chennai');
  const [toCity, setToCity] = useState('');
  const [travelDate, setTravelDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split('T')[0];
  });
  const [pax, setPax] = useState('2');
  const [tripType, setTripType] = useState('All');
  const [budgetTier, setBudgetTier] = useState('All');
  const [nlpQuery, setNlpQuery] = useState('');

  useEffect(() => {
    Promise.all([
      api.get('/trips', { params: { limit: 12 } }),
      api.get('/destinations'),
      api.get('/reviews'),
    ])
      .then(([tripsRes, destsRes, revsRes]) => {
        const all = tripsRes.data.data || [];
        setFeaturedTrips(all.filter((t) => t.is_featured));
        setTnTrips(all.filter((t) => t.popular_from_tn || t.source === 'Chennai' || t.origin === 'Chennai'));
        setIntlTrips(all.filter((t) => t.destination_type === 'International'));
        setBudgetTrips(all.filter((t) => t.amount <= 22000));
        setDestinations(destsRes.data.data || []);
        setReviews(revsRes.data.data || []);
      })
      .catch((err) => console.error('Failed to load home data:', err))
      .finally(() => setLoading(false));
  }, []);

  const handleQuickSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (fromCity) params.set('source', fromCity);
    if (toCity.trim()) params.set('destination', toCity.trim());
    if (tripType !== 'All') params.set('destination_type', tripType);
    if (budgetTier !== 'All') params.set('category', budgetTier);
    navigate(`/packages?${params.toString()}`);
  };

  const handleNlpSearch = (e, customQuery) => {
    if (e) e.preventDefault();
    const q = (customQuery !== undefined ? customQuery : nlpQuery).trim();
    if (q) {
      navigate(`/packages?nlp=${encodeURIComponent(q)}`);
    }
  };

  const handlePlanWithAI = () => {
    const prompt = `Plan a trip from ${fromCity} to ${toCity || 'a scenic destination'} for ${pax} people`;
    window.dispatchEvent(new CustomEvent('lyan_book_ai', { detail: { trip: { title: prompt } } }));
  };

  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-inner">
          <div className="hero-badge-tag">
            <span>✈️ Tamil Nadu's Premier Travel Booking & Agent Platform</span>
          </div>

          <h1 className="hero-title">
            Where will you go next? <br />
            <span className="hero-title-accent">Seamless Travel Across India & The World</span>
          </h1>

          <p className="hero-desc">
            Departing from Chennai, Coimbatore, Madurai, Trichy, Salem, and across Tamil Nadu. Discover handpicked Budget,
            Economy, Standard, Premium, and Luxury packages powered by live human agents and AI.
          </p>

          {/* Quick Search Card */}
          <div className="hero-search-card">
            <form onSubmit={handleQuickSearch} className="search-grid-form">
              {/* Origin City */}
              <div className="form-group">
                <label>🛫 Leaving From</label>
                <select value={fromCity} onChange={(e) => setFromCity(e.target.value)}>
                  {TN_CITIES.map((c) => (
                    <option key={c} value={c}>
                      {c}, Tamil Nadu
                    </option>
                  ))}
                  <option value="Bengaluru">Bengaluru</option>
                  <option value="Mumbai">Mumbai</option>
                  <option value="Delhi">Delhi</option>
                </select>
              </div>

              {/* Destination */}
              <div className="form-group">
                <label>🏝️ Going To</label>
                <input
                  type="text"
                  placeholder="e.g. Kerala, Goa, Maldives, Singapore..."
                  value={toCity}
                  onChange={(e) => setToCity(e.target.value)}
                />
              </div>

              {/* Travel Date */}
              <div className="form-group">
                <label>📅 Departure Date</label>
                <input
                  type="date"
                  value={travelDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setTravelDate(e.target.value)}
                />
              </div>

              {/* Travelers */}
              <div className="form-group">
                <label>👥 Travelers</label>
                <select value={pax} onChange={(e) => setPax(e.target.value)}>
                  <option value="1">1 Solo Traveler</option>
                  <option value="2">2 Couple / Adults</option>
                  <option value="3">3 Family / Friends</option>
                  <option value="4">4 People (Group)</option>
                  <option value="5">5+ Large Family / Group</option>
                </select>
              </div>

              {/* Package Category */}
              <div className="form-group">
                <label>🏷️ Category / Budget</label>
                <select value={budgetTier} onChange={(e) => setBudgetTier(e.target.value)}>
                  <option value="All">All Categories</option>
                  <option value="Budget">Budget (&lt; ₹15,000)</option>
                  <option value="Economy">Economy (₹15k – ₹25k)</option>
                  <option value="Standard">Standard (₹25k – ₹40k)</option>
                  <option value="Premium">Premium (₹40k – ₹70k)</option>
                  <option value="Luxury">Luxury (₹70,000+)</option>
                </select>
              </div>

              {/* Type */}
              <div className="form-group">
                <label>🌐 Trip Scope</label>
                <select value={tripType} onChange={(e) => setTripType(e.target.value)}>
                  <option value="All">Domestic & International</option>
                  <option value="Domestic">Domestic India</option>
                  <option value="International">International</option>
                </select>
              </div>

              {/* Action Buttons */}
              <div className="search-actions-row">
                <button type="submit" className="btn-primary" style={{ padding: '0.8rem 1.75rem' }}>
                  🔍 Search Trips
                </button>
                <button
                  type="button"
                  className="btn-coral"
                  onClick={handlePlanWithAI}
                  style={{ padding: '0.8rem 1.75rem' }}
                >
                  ⚡ Plan with AI Agent
                </button>
              </div>
            </form>

            {/* NLP Search Bar */}
            <div className="nlp-bar-container">
              <form onSubmit={handleNlpSearch} className="nlp-input-row">
                <input
                  type="text"
                  placeholder="Or ask naturally: 'Family trip from Chennai to Kerala for 4 people under 60k' or 'Goa beach from Coimbatore'..."
                  value={nlpQuery}
                  onChange={(e) => setNlpQuery(e.target.value)}
                />
                <button type="submit" className="btn-secondary" style={{ whiteSpace: 'nowrap' }}>
                  🧠 AI NLP Search
                </button>
              </form>
              <div className="nlp-chips-row">
                <span style={{ fontWeight: 600 }}>Try queries:</span>
                <button
                  type="button"
                  className="nlp-chip-btn"
                  onClick={() => handleNlpSearch(null, 'Trip from Chennai to Kerala for 4 people under 60000')}
                >
                  🌴 Chennai ➔ Kerala &lt; 60k
                </button>
                <button
                  type="button"
                  className="nlp-chip-btn"
                  onClick={() => handleNlpSearch(null, 'Coimbatore to Goa for 2 people with flights')}
                >
                  🏖️ Coimbatore ➔ Goa for 2
                </button>
                <button
                  type="button"
                  className="nlp-chip-btn"
                  onClick={() => handleNlpSearch(null, 'International trip from Chennai to Maldives')}
                >
                  🏝️ Chennai ➔ Maldives
                </button>
                <button
                  type="button"
                  className="nlp-chip-btn"
                  onClick={() => handleNlpSearch(null, 'Trichy to Sri Lanka budget package')}
                >
                  🇱🇰 Trichy ➔ Sri Lanka
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 1: Popular from Tamil Nadu */}
      <section className="section-wrapper">
        <div className="section-header">
          <div>
            <h2 className="section-title">Popular from Tamil Nadu</h2>
            <p className="section-subtitle">
              Direct and convenient departures from Chennai, Coimbatore, Madurai, Trichy, and Salem
            </p>
          </div>
          <Link to="/packages?popularFromTN=true" className="section-link">
            Explore All TN Departures ➔
          </Link>
        </div>

        {loading ? (
          <p>Loading popular journeys…</p>
        ) : (
          <div className="packages-grid">
            {tnTrips.slice(0, 4).map((trip) => (
              <PackageCard
                key={trip.id}
                trip={trip}
                onBook={(t) => setSelectedTrip(t)}
                onBookAI={(t) =>
                  window.dispatchEvent(new CustomEvent('lyan_book_ai', { detail: { trip: t } }))
                }
              />
            ))}
          </div>
        )}
      </section>

      {/* Section 2: Trending Destinations */}
      <section className="section-wrapper">
        <div className="section-header">
          <div>
            <h2 className="section-title">Trending Destinations</h2>
            <p className="section-subtitle">Top curated vacation spots preferred by travelers</p>
          </div>
          <Link to="/explore" className="section-link">
            View All Destinations ➔
          </Link>
        </div>

        <div className="dest-grid">
          {destinations.slice(0, 4).map((dest) => (
            <div
              key={dest.id}
              className="dest-card"
              onClick={() => navigate(`/packages?destination=${encodeURIComponent(dest.name)}`)}
            >
              <img src={dest.image_url} alt={dest.name} className="dest-img" loading="lazy" />
              <div className="dest-overlay">
                <span className="dest-tag">
                  {dest.type} • {dest.country}
                </span>
                <h3 className="dest-name">{dest.name}</h3>
                <p className="dest-routes">{dest.popular_routes?.join(' • ') || dest.state}</p>
                <div className="dest-price-tag">
                  Starting from <strong>{formatINR(dest.starting_price)}</strong>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Section 3: Popular Domestic & Budget Trips */}
      <section className="section-wrapper" style={{ background: 'var(--bg-subtle)', padding: '2.5rem 1.5rem', borderRadius: 'var(--radius-xl)' }}>
        <div className="section-header">
          <div>
            <h2 className="section-title">Budget-Friendly & Domestic Trips</h2>
            <p className="section-subtitle">Affordable getaways under ₹25,000 per person</p>
          </div>
          <Link to="/packages?category=Economy" className="section-link">
            View Affordable Packages ➔
          </Link>
        </div>

        <div className="packages-grid">
          {budgetTrips.slice(0, 4).map((trip) => (
            <PackageCard
              key={trip.id}
              trip={trip}
              onBook={(t) => setSelectedTrip(t)}
              onBookAI={(t) =>
                window.dispatchEvent(new CustomEvent('lyan_book_ai', { detail: { trip: t } }))
              }
            />
          ))}
        </div>
      </section>

      {/* Section 4: International Getaways */}
      <section className="section-wrapper">
        <div className="section-header">
          <div>
            <h2 className="section-title">International Getaways</h2>
            <p className="section-subtitle">Short-haul & global flights departing directly from Tamil Nadu hubs</p>
          </div>
          <Link to="/packages?destination_type=International" className="section-link">
            Explore All International Trips ➔
          </Link>
        </div>

        <div className="packages-grid">
          {intlTrips.slice(0, 4).map((trip) => (
            <PackageCard
              key={trip.id}
              trip={trip}
              onBook={(t) => setSelectedTrip(t)}
              onBookAI={(t) =>
                window.dispatchEvent(new CustomEvent('lyan_book_ai', { detail: { trip: t } }))
              }
            />
          ))}
        </div>
      </section>

      {/* Section 5: Why Choose Lyan Travels */}
      <section className="section-wrapper" style={{ padding: '2rem 1.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h2 className="section-title">Why Travel With Lyan Travels?</h2>
          <p className="section-subtitle">The complete Travel Booking Platform + Certified Agent Management System</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
          <div className="metric-card" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '2.2rem', marginBottom: '0.5rem' }}>🏛️</span>
            <h3 style={{ fontSize: '1.15rem', color: 'var(--primary)', marginBottom: '0.4rem' }}>Tamil Nadu Hub Specialization</h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
              Optimized travel routes from Chennai, Coimbatore, Madurai, and Trichy with direct flight & express train connectivity.
            </p>
          </div>

          <div className="metric-card" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '2.2rem', marginBottom: '0.5rem' }}>💰</span>
            <h3 style={{ fontSize: '1.15rem', color: 'var(--primary)', marginBottom: '0.4rem' }}>All Budgets Welcome</h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
              From Budget and Economy student trips to Standard family packages and Premium/Luxury retreats — transparent pricing in ₹ INR.
            </p>
          </div>

          <div className="metric-card" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '2.2rem', marginBottom: '0.5rem' }}>🤖</span>
            <h3 style={{ fontSize: '1.15rem', color: 'var(--primary)', marginBottom: '0.4rem' }}>Conversational AI Agent</h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
              State-of-the-art NLP that tracks multi-turn context, answers hotel and meal queries, and books tickets directly.
            </p>
          </div>

          <div className="metric-card" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '2.2rem', marginBottom: '0.5rem' }}>👨‍💼</span>
            <h3 style={{ fontSize: '1.15rem', color: 'var(--primary)', marginBottom: '0.4rem' }}>Human Agent Handoff</h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
              Seamlessly switch between AI recommendations and certified human travel consultants with full conversation continuity.
            </p>
          </div>
        </div>
      </section>

      {/* Section 6: Verified Customer Reviews */}
      <section className="section-wrapper">
        <div className="section-header">
          <div>
            <h2 className="section-title">Traveller Experiences</h2>
            <p className="section-subtitle">Real feedback from travelers who booked with Lyan Travels</p>
          </div>
          <Link to="/reviews" className="section-link">
            Read All Reviews ➔
          </Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {reviews.slice(0, 3).map((r) => (
            <div key={r.id} className="metric-card" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: '0.5rem' }}>
                <span style={{ fontWeight: '700', color: 'var(--primary)' }}>{r.customer_name}</span>
                <span style={{ color: '#f59e0b', fontWeight: '700' }}>⭐ {r.rating}/5</span>
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.65rem' }}>
                📍 {r.package_title} • {r.destination}
              </div>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-body)', fontStyle: 'italic', lineHeight: '1.5' }}>
                "{r.comment}"
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* AI Assistant Banner */}
      <section className="section-wrapper" style={{ marginBottom: '2rem' }}>
        <div
          style={{
            background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
            borderRadius: 'var(--radius-xl)',
            padding: '2.5rem',
            color: '#fff',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '2rem',
            flexWrap: 'wrap',
          }}
        >
          <div>
            <span style={{ fontSize: '0.82rem', background: 'rgba(255,255,255,0.2)', padding: '0.2rem 0.65rem', borderRadius: '4px', textTransform: 'uppercase', fontWeight: '700' }}>
              AI Travel Agent Active
            </span>
            <h2 style={{ color: '#fff', fontSize: '1.85rem', margin: '0.75rem 0 0.5rem' }}>
              Have specific dates, group sizes, or budget?
            </h2>
            <p style={{ color: '#e0f2fe', maxWidth: '650px', fontSize: '0.95rem' }}>
              Speak naturally with our AI assistant. Say "Find me an affordable trip from Chennai for 4 people under 1 lakh"
              and watch it recommend packages and guide you through booking.
            </p>
          </div>
          <button
            type="button"
            className="btn-coral"
            onClick={() => window.dispatchEvent(new CustomEvent('lyan_book_ai', { detail: { trip: { title: 'Help me plan my trip' } } }))}
            style={{ padding: '0.85rem 1.75rem', fontSize: '1rem' }}
          >
            🤖 Chat with AI Travel Agent
          </button>
        </div>
      </section>

      {/* Booking Checkout Modal */}
      {selectedTrip && (
        <BookingModal
          trip={selectedTrip}
          onClose={() => setSelectedTrip(null)}
          onSuccess={() => {
            setSelectedTrip(null);
            navigate('/my-bookings');
          }}
        />
      )}
    </div>
  );
}
