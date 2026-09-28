import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/client';
import BookingModal from '../components/BookingModal';
import { formatINR } from '../utils/currency';
import fallbackPackages from '../data/packagesFallback.json';
import { useRecent } from '../context/RecentContext';

export default function PackageDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addRecentPackage } = useRecent();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showBooking, setShowBooking] = useState(false);
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [activeDay, setActiveDay] = useState(1);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api.get(`/trips/${id}`)
      .then(({ data }) => {
        if (data?.data) {
          setTrip(data.data);
          addRecentPackage(data.data);
        } else {
          const found = fallbackPackages.find(p => String(p.id) === String(id));
          if (found) {
            setTrip(found);
            addRecentPackage(found);
          }
        }
      })
      .catch((err) => {
        console.warn('Failed to load trip from API, checking fallback catalog:', err);
        const found = fallbackPackages.find(p => String(p.id) === String(id));
        if (found) {
          setTrip(found);
          addRecentPackage(found);
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="section-wrapper" style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
        <p>Loading package details…</p>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="section-wrapper" style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
        <h2>Package Not Found</h2>
        <p style={{ margin: '1rem 0' }}>The travel itinerary you requested does not exist or has been retired.</p>
        <Link to="/packages" className="btn-primary">Browse Active Packages</Link>
      </div>
    );
  }

  // Real Dynamic Price Calculation
  const baseRate = Number(trip.amount || 0);
  const adultsTotal = baseRate * adults;
  const childRate = baseRate * 0.6; // children at 60%
  const childrenTotal = childRate * children;
  const subtotal = adultsTotal + childrenTotal;
  const gst = Math.round(subtotal * 0.05 * 100) / 100;
  const totalAmount = Math.round((subtotal + gst) * 100) / 100;

  const handleAskAI = () => {
    window.dispatchEvent(
      new CustomEvent('lyan_book_ai', {
        detail: { trip: { ...trip, title: `Tell me about the ${trip.title} package including meals and day 2 activities` } }
      })
    );
  };

  const handleToggleSave = () => {
    setSaved(!saved);
  };

  return (
    <div className="section-wrapper" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
      {/* Breadcrumb */}
      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
        <Link to="/" style={{ color: 'var(--secondary)' }}>Home</Link> &gt;{' '}
        <Link to="/packages" style={{ color: 'var(--secondary)' }}>Packages</Link> &gt;{' '}
        <span>{trip.title}</span>
      </div>

      {/* Header Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        <div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span className={`cat-badge cat-${(trip.category || 'Standard').toLowerCase()}`}>
              {trip.category || 'Standard'} Category
            </span>
            <span style={{ fontSize: '0.78rem', background: 'var(--bg-subtle)', border: '1px solid var(--border-light)', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: '700' }}>
              {trip.destination_type || 'Domestic'}
            </span>
            <span style={{ fontSize: '0.82rem', color: '#f59e0b', fontWeight: '700' }}>
              ⭐ {trip.rating || 4.8}/5 ({trip.reviews_count || 48} verified reviews)
            </span>
          </div>

          <h1 style={{ fontSize: '2.2rem', color: 'var(--primary)', marginBottom: '0.5rem', lineHeight: '1.2' }}>
            {trip.title}
          </h1>

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', fontSize: '0.95rem', color: 'var(--text-body)', flexWrap: 'wrap' }}>
            <span>📍 <strong>Origin:</strong> {trip.origin || trip.source || 'Chennai'}</span>
            <span>➔</span>
            <span>🏝️ <strong>Destination:</strong> {trip.destination}</span>
            <span>⏳ <strong>Duration:</strong> {trip.duration_days} Days / {trip.duration_nights || trip.duration_days - 1} Nights</span>
          </div>
        </div>

        {/* Top Actions */}
        <div style={{ display: 'flex', gap: '0.65rem' }}>
          <button
            type="button"
            className="btn-secondary"
            onClick={handleToggleSave}
            style={{ background: saved ? '#fee2e2' : '#fff', color: saved ? '#e11d48' : 'var(--text-dark)', borderColor: saved ? '#fca5a5' : 'var(--border-light)' }}
          >
            {saved ? '❤️ Saved' : '🤍 Save Package'}
          </button>
          <button
            type="button"
            className="btn-coral"
            onClick={() => setShowBooking(true)}
            disabled={trip.available_seats <= 0}
          >
            {trip.available_seats > 0 ? 'Book This Trip' : 'Sold Out'}
          </button>
        </div>
      </div>

      {/* Main Grid: Gallery & Details + Pricing Sticky Sidebar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2.5rem', alignItems: 'flex-start' }}>
        {/* Left Side: Images & Detailed Specs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Main Hero Image */}
          <div style={{ borderRadius: 'var(--radius-xl)', overflow: 'hidden', height: '380px', position: 'relative', boxShadow: 'var(--shadow-md)' }}>
            <img
              src={trip.image_url || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80'}
              alt={trip.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            <div style={{ position: 'absolute', bottom: '15px', right: '15px', background: 'rgba(15, 23, 42, 0.8)', color: '#fff', padding: '0.35rem 0.85rem', borderRadius: 'var(--radius-full)', fontSize: '0.82rem', backdropFilter: 'blur(6px)' }}>
              💺 {trip.available_seats} Available Slots
            </div>
          </div>

          {/* Highlights / Amenity Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
            <div className="metric-card" style={{ padding: '1rem' }}>
              <span style={{ fontSize: '1.75rem' }}>🚀</span>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '700' }}>TRANSPORT</div>
                <div style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--primary)' }}>{trip.transport}</div>
              </div>
            </div>
            <div className="metric-card" style={{ padding: '1rem' }}>
              <span style={{ fontSize: '1.75rem' }}>🏨</span>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '700' }}>HOTEL TIER</div>
                <div style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--primary)' }}>{trip.hotel_category || '3-Star Deluxe'}</div>
              </div>
            </div>
            <div className="metric-card" style={{ padding: '1rem' }}>
              <span style={{ fontSize: '1.75rem' }}>🍽️</span>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '700' }}>MEALS</div>
                <div style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--primary)' }}>{trip.meals || 'Breakfast Included'}</div>
              </div>
            </div>
            <div className="metric-card" style={{ padding: '1rem' }}>
              <span style={{ fontSize: '1.75rem' }}>🛡️</span>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '700' }}>CANCELLATION</div>
                <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#16a34a' }}>Free 48h Refund</div>
              </div>
            </div>
          </div>

          {/* Overview Section */}
          <div style={{ background: '#fff', padding: '1.75rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)' }}>
            <h3 style={{ fontSize: '1.3rem', color: 'var(--primary)', marginBottom: '0.75rem' }}>Trip Overview</h3>
            <p style={{ fontSize: '0.98rem', lineHeight: '1.7', color: 'var(--text-body)' }}>{trip.description}</p>
          </div>

          {/* Day-by-Day Itinerary */}
          {trip.itinerary && trip.itinerary.length > 0 && (
            <div style={{ background: '#fff', padding: '1.75rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)' }}>
              <h3 style={{ fontSize: '1.3rem', color: 'var(--primary)', marginBottom: '1.25rem' }}>
                Day-by-Day Itinerary ({trip.itinerary.length} Days)
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {trip.itinerary.map((item) => (
                  <div
                    key={item.day}
                    style={{
                      border: '1.5px solid var(--border-light)',
                      borderRadius: 'var(--radius-md)',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      onClick={() => setActiveDay(activeDay === item.day ? null : item.day)}
                      style={{
                        padding: '1rem 1.25rem',
                        background: activeDay === item.day ? 'var(--primary-light)' : 'var(--bg-subtle)',
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontWeight: '700',
                        color: activeDay === item.day ? 'var(--primary)' : 'var(--text-dark)'
                      }}
                    >
                      <span>🗓️ Day {item.day}: {item.title}</span>
                      <span>{activeDay === item.day ? '▲' : '▼'}</span>
                    </div>

                    {activeDay === item.day && (
                      <div style={{ padding: '1.25rem', background: '#fff' }}>
                        <ul style={{ paddingLeft: '1.25rem', margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.92rem', color: 'var(--text-body)' }}>
                          {item.activities?.map((act, actIdx) => (
                            <li key={actIdx}>{act}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Inclusions & Exclusions */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
            <div style={{ background: '#f0fdf4', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid #bbf7d0' }}>
              <h4 style={{ color: '#166534', marginBottom: '0.75rem', fontSize: '1.1rem' }}>✅ Package Inclusions</h4>
              <ul style={{ paddingLeft: '1.2rem', margin: 0, display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.88rem', color: '#14532d' }}>
                {trip.inclusions?.map((inc, i) => (
                  <li key={i}>{inc}</li>
                )) || <li>Sightseeing cab, hotel accommodation, and buffet breakfast</li>}
              </ul>
            </div>

            <div style={{ background: '#fef2f2', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid #fecaca' }}>
              <h4 style={{ color: '#991b1b', marginBottom: '0.75rem', fontSize: '1.1rem' }}>❌ Package Exclusions</h4>
              <ul style={{ paddingLeft: '1.2rem', margin: 0, display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.88rem', color: '#7f1d1d' }}>
                {trip.exclusions?.map((exc, i) => (
                  <li key={i}>{exc}</li>
                )) || <li>Personal expenses, optional adventure entry fees, and travel insurance</li>}
              </ul>
            </div>
          </div>
        </div>

        {/* Right Side: Transparent Dynamic Price Calculator & Booking Box */}
        <div style={{ position: 'sticky', top: '90px' }}>
          <div style={{ background: '#fff', padding: '2rem', borderRadius: 'var(--radius-xl)', border: '2px solid var(--secondary-light)', boxShadow: 'var(--shadow-lg)' }}>
            <div style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>
                Pricing Calculator
              </span>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginTop: '0.25rem' }}>
                <span style={{ fontSize: '2.2rem', fontWeight: '800', color: 'var(--primary)', fontFamily: 'var(--font-heading)' }}>
                  {formatINR(baseRate)}
                </span>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>/ adult traveler</span>
              </div>
            </div>

            {/* Travelers Configuration */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: '700', fontSize: '0.95rem' }}>Adults (12+ yrs)</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{formatINR(baseRate)} each</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => setAdults(Math.max(1, adults - 1))}
                    style={{ width: '32px', height: '32px', borderRadius: '6px', border: '1px solid var(--border-light)', background: '#fff', cursor: 'pointer', fontWeight: '700' }}
                  >
                    -
                  </button>
                  <span style={{ fontWeight: '700', width: '20px', textAlign: 'center' }}>{adults}</span>
                  <button
                    type="button"
                    onClick={() => setAdults(Math.min(trip.available_seats || 10, adults + 1))}
                    style={{ width: '32px', height: '32px', borderRadius: '6px', border: '1px solid var(--border-light)', background: '#fff', cursor: 'pointer', fontWeight: '700' }}
                  >
                    +
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: '700', fontSize: '0.95rem' }}>Children (2-11 yrs)</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{formatINR(childRate)} (40% discount)</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => setChildren(Math.max(0, children - 1))}
                    style={{ width: '32px', height: '32px', borderRadius: '6px', border: '1px solid var(--border-light)', background: '#fff', cursor: 'pointer', fontWeight: '700' }}
                  >
                    -
                  </button>
                  <span style={{ fontWeight: '700', width: '20px', textAlign: 'center' }}>{children}</span>
                  <button
                    type="button"
                    onClick={() => setChildren(children + 1)}
                    style={{ width: '32px', height: '32px', borderRadius: '6px', border: '1px solid var(--border-light)', background: '#fff', cursor: 'pointer', fontWeight: '700' }}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Price Breakdown Calculation */}
            <div style={{ background: 'var(--bg-subtle)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.88rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Adults ({adults} × {formatINR(baseRate)})</span>
                <span>{formatINR(adultsTotal)}</span>
              </div>
              {children > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Children ({children} × {formatINR(childRate)})</span>
                  <span>{formatINR(childrenTotal)}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>GST Tax (5%)</span>
                <span>{formatINR(gst)}</span>
              </div>
              <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '0.5rem', marginTop: '0.25rem', display: 'flex', justifyContent: 'space-between', fontWeight: '800', fontSize: '1.05rem', color: 'var(--primary)' }}>
                <span>Total Amount</span>
                <span>{formatINR(totalAmount)}</span>
              </div>
            </div>

            {/* CTAs */}
            <button
              type="button"
              className="btn-coral"
              style={{ width: '100%', padding: '0.85rem', justifyContent: 'center', fontSize: '1.05rem', marginBottom: '0.75rem' }}
              onClick={() => setShowBooking(true)}
              disabled={trip.available_seats <= 0}
            >
              {trip.available_seats > 0 ? 'Proceed to Instant Checkout ➔' : 'Package Sold Out'}
            </button>

            <button
              type="button"
              className="btn-secondary"
              style={{ width: '100%', padding: '0.75rem', justifyContent: 'center', fontSize: '0.92rem' }}
              onClick={handleAskAI}
            >
              🤖 Ask AI Travel Agent About This Trip
            </button>
          </div>
        </div>
      </div>

      {/* Booking Checkout Modal */}
      {showBooking && (
        <BookingModal
          trip={trip}
          onClose={() => setShowBooking(false)}
          onSuccess={() => {
            setShowBooking(false);
            navigate('/my-bookings');
          }}
        />
      )}
    </div>
  );
}
