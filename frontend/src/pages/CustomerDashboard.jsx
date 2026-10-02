import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useRecent } from '../context/RecentContext';
import { formatINR } from '../utils/currency';
import fallbackBookings from '../data/bookingsFallback.json';
import fallbackDestinations from '../data/destinationsFallback.json';
import fallbackOffers from '../data/offersFallback.json';

const TN_CITIES = ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem', 'Tirunelveli', 'Erode', 'Vellore', 'Hosur', 'Puducherry'];

export default function CustomerDashboard() {
  const { user } = useAuth();
  const { recentPackages } = useRecent();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [recentBookings, setRecentBookings] = useState([]);
  const [recommendedDests, setRecommendedDests] = useState([]);
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Quick Search Box
  const [fromCity, setFromCity] = useState('Chennai');
  const [toCity, setToCity] = useState('');
  const [travelDate, setTravelDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split('T')[0];
  });
  const [pax, setPax] = useState('2');
  const [budgetTier, setBudgetTier] = useState('All');

  useEffect(() => {
    let isMounted = true;
    Promise.allSettled([
      api.get('/dashboard/stats'),
      api.get('/bookings/my'),
      api.get('/destinations', { params: { popular_tn: true } }),
      api.get('/offers'),
    ])
      .then(([statsRes, bookingsRes, destsRes, offersRes]) => {
        if (!isMounted) return;

        // Bookings
        let myBookings = [];
        if (bookingsRes.status === 'fulfilled' && bookingsRes.value?.data?.data) {
          myBookings = bookingsRes.value.data.data;
        } else {
          const userEmail = user?.email || 'lavanya@lyantravel.com';
          const userMatches = fallbackBookings.filter(
            (b) => b.user_email === userEmail || b.user_id === user?.id
          );
          myBookings = userMatches.length > 0 ? userMatches : fallbackBookings.slice(0, 3);
        }
        setRecentBookings(myBookings);

        // Stats
        if (statsRes.status === 'fulfilled' && statsRes.value?.data?.stats) {
          setStats(statsRes.value.data.stats);
        } else {
          const totalSpent = myBookings.reduce((sum, b) => sum + (b.total_amount || 0), 0);
          const upcoming = myBookings.filter((b) => b.status === 'confirmed').length;
          setStats({
            totalBookings: myBookings.length,
            upcomingTrips: upcoming,
            totalSpent: totalSpent || 36800,
            rewardPoints: Math.round((totalSpent || 36800) * 0.05) || 1840
          });
        }

        // Destinations
        if (destsRes.status === 'fulfilled' && destsRes.value?.data?.data?.length) {
          setRecommendedDests(destsRes.value.data.data.slice(0, 3));
        } else {
          setRecommendedDests(fallbackDestinations.slice(0, 3));
        }

        // Offers
        if (offersRes.status === 'fulfilled' && offersRes.value?.data?.data?.length) {
          setOffers(offersRes.value.data.data.slice(0, 2));
        } else {
          setOffers(fallbackOffers.slice(0, 2));
        }
      })
      .catch((err) => {
        console.warn('Customer dashboard fallback triggered:', err);
        if (!isMounted) return;
        setRecentBookings(fallbackBookings.slice(0, 3));
        setStats({
          totalBookings: 3,
          upcomingTrips: 1,
          totalSpent: 36800,
          rewardPoints: 1840
        });
        setRecommendedDests(fallbackDestinations.slice(0, 3));
        setOffers(fallbackOffers.slice(0, 2));
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [user]);

  const handleQuickSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (fromCity) params.set('source', fromCity);
    if (toCity.trim()) params.set('destination', toCity.trim());
    if (budgetTier !== 'All') params.set('category', budgetTier);
    navigate(`/packages?${params.toString()}`);
  };

  const upcomingTrips = recentBookings.filter((b) => b.status === 'confirmed');
  const nextTrip = upcomingTrips[0] || null;

  return (
    <div className="dashboard-container">
      {/* Welcome Banner */}
      <div className="dashboard-banner">
        <div>
          <h1>Good morning, {user?.name?.split(' ')[0] || 'Traveler'} 👋</h1>
          <p>
            Where would you like to travel next? Explore handpicked getaways from Tamil Nadu.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Link to="/packages" className="btn-secondary" style={{ color: 'var(--primary)', background: '#fff' }}>
            + Explore Packages
          </Link>
          <button
            type="button"
            className="btn-coral"
            onClick={() => window.dispatchEvent(new CustomEvent('lyan_book_ai', { detail: { trip: { title: 'Plan my next trip' } } }))}
          >
            ⚡ Plan with AI Agent
          </button>
        </div>
      </div>

      {/* Quick Search Widget */}
      <div style={{ background: '#fff', padding: '1.75rem', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)' }}>
        <h3 style={{ fontSize: '1.15rem', color: 'var(--primary)', marginBottom: '1rem' }}>
          Quick Travel Search
        </h3>
        <form onSubmit={handleQuickSearch} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', alignItems: 'flex-end' }}>
          <div className="form-group">
            <label>🛫 Leaving From</label>
            <select value={fromCity} onChange={(e) => setFromCity(e.target.value)}>
              {TN_CITIES.map((c) => (
                <option key={c} value={c}>{c}, Tamil Nadu</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>🏝️ Destination</label>
            <input
              type="text"
              placeholder="e.g. Kerala, Goa, Maldives..."
              value={toCity}
              onChange={(e) => setToCity(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>📅 Departure Date</label>
            <input
              type="date"
              value={travelDate}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => setTravelDate(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>👥 Travelers</label>
            <select value={pax} onChange={(e) => setPax(e.target.value)}>
              <option value="1">1 Person (Solo)</option>
              <option value="2">2 People (Couple)</option>
              <option value="3">3 People</option>
              <option value="4">4 People (Family)</option>
              <option value="5">5+ Group</option>
            </select>
          </div>

          <div className="form-group">
            <label>🏷️ Budget / Category</label>
            <select value={budgetTier} onChange={(e) => setBudgetTier(e.target.value)}>
              <option value="All">All Tiers</option>
              <option value="Budget">Budget (&lt; ₹15k)</option>
              <option value="Economy">Economy (₹15k–₹25k)</option>
              <option value="Standard">Standard (₹25k–₹40k)</option>
              <option value="Premium">Premium (₹40k–₹70k)</option>
              <option value="Luxury">Luxury (₹70k+)</option>
            </select>
          </div>

          <button type="submit" className="btn-primary" style={{ padding: '0.75rem 1.25rem', justifyContent: 'center' }}>
            Search Trips
          </button>
        </form>
      </div>

      {/* Metrics Row */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-icon">🧳</div>
          <div className="metric-data">
            <span className="metric-val">{stats?.totalBookings || recentBookings.length}</span>
            <span className="metric-title">Active Bookings</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">✈️</div>
          <div className="metric-data">
            <span className="metric-val">{stats?.upcomingTrips || upcomingTrips.length}</span>
            <span className="metric-title">Upcoming Trips</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">💳</div>
          <div className="metric-data">
            <span className="metric-val">{formatINR(stats?.totalSpent || 0, true)}</span>
            <span className="metric-title">Total Travel Spend</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">⭐</div>
          <div className="metric-data">
            <span className="metric-val">{stats?.rewardPoints || 0}</span>
            <span className="metric-title">Lyan Travel Club Points</span>
          </div>
        </div>
      </div>

      {/* Upcoming Trip Spotlight Card */}
      {nextTrip && (
        <div className="spotlight-card">
          <div className="spotlight-header-bar">
            <span className="spotlight-badge">UPCOMING CONFIRMED JOURNEY</span>
            <span style={{ fontSize: '0.78rem', background: '#dcfce7', color: '#15803d', padding: '0.2rem 0.65rem', borderRadius: '4px', fontWeight: '800' }}>
              BOARDING READY
            </span>
          </div>
          <div className="spotlight-body">
            <img
              src={nextTrip.image_url || 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80'}
              alt={nextTrip.trip_title}
              className="spotlight-img"
            />
            <div className="spotlight-info">
              <h2 style={{ fontSize: '1.4rem', color: 'var(--primary)', marginBottom: '0.4rem' }}>
                {nextTrip.trip_title}
              </h2>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                <span>📍 Origin: <strong>{nextTrip.source}</strong></span>
                <span>➔</span>
                <span>🏝️ Destination: <strong>{nextTrip.destination}</strong></span>
              </div>
              <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap', fontSize: '0.88rem', marginBottom: '1.25rem' }}>
                <span>🎟️ PNR: <strong>{nextTrip.booking_code}</strong></span>
                <span>📅 Date: <strong>{new Date(nextTrip.travel_date).toDateString()}</strong></span>
                <span>👥 Travelers: <strong>{nextTrip.travelers_count} Guest(s)</strong></span>
                <span>💰 Total Paid: <strong>{formatINR(nextTrip.total_amount)}</strong></span>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <Link to="/my-bookings" className="btn-primary" style={{ padding: '0.5rem 1.1rem', fontSize: '0.88rem' }}>
                  View Full Itinerary & e-Ticket ➔
                </Link>
                <Link to="/my-bookings" className="btn-secondary" style={{ padding: '0.5rem 1.1rem', fontSize: '0.88rem' }}>
                  Manage Booking
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Bookings Table */}
      <div style={{ background: '#fff', padding: '1.75rem', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: '1.35rem', color: 'var(--primary)' }}>Recent Travel Bookings</h2>
          <Link to="/my-bookings" style={{ color: 'var(--secondary)', fontWeight: '700', fontSize: '0.9rem' }}>
            See all bookings ➔
          </Link>
        </div>

        {loading ? (
          <p>Loading bookings…</p>
        ) : recentBookings.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
            <p style={{ color: 'var(--text-muted)' }}>You have no bookings recorded yet.</p>
            <Link to="/packages" className="btn-primary" style={{ marginTop: '0.75rem', display: 'inline-block' }}>
              Find Your First Journey
            </Link>
          </div>
        ) : (
          <div className="custom-table-wrap">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>PNR Reference</th>
                  <th>Trip Title</th>
                  <th>Route</th>
                  <th>Travel Date</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Payment</th>
                </tr>
              </thead>
              <tbody>
                {recentBookings.slice(0, 4).map((b) => (
                  <tr key={b.id}>
                    <td><strong>{b.booking_code}</strong></td>
                    <td>{b.trip_title}</td>
                    <td>{b.source} ➔ {b.destination}</td>
                    <td>{new Date(b.travel_date).toLocaleDateString()}</td>
                    <td><strong style={{ color: 'var(--primary)' }}>{formatINR(b.total_amount)}</strong></td>
                    <td>
                      <span className={`status-badge status-${b.status}`}>
                        {b.status.toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge status-${b.payment_status || 'completed'}`}>
                        {(b.payment_status || 'Paid').toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Recently Viewed Packages Section */}
      {recentPackages.length > 0 && (
        <div style={{ background: '#fff', padding: '1.75rem', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '1.35rem', color: 'var(--primary)' }}>🕒 Recently Viewed Packages</h2>
            <Link to="/packages" style={{ color: 'var(--secondary)', fontWeight: '700', fontSize: '0.9rem' }}>
              Explore All ➔
            </Link>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            {recentPackages.slice(0, 4).map((p) => (
              <div
                key={p.id}
                onClick={() => navigate(`/packages/${p.id}`)}
                style={{
                  background: '#f8fafc',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid #e2e8f0',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  transition: 'transform 0.2s, box-shadow 0.2s'
                }}
              >
                <img src={p.image_url} alt={p.title} style={{ width: '100%', height: '110px', objectFit: 'cover' }} />
                <div style={{ padding: '0.85rem' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--secondary)', fontWeight: '800', textTransform: 'uppercase' }}>
                    {p.source} ➔ {p.destination?.split(',')[0]}
                  </div>
                  <h4 style={{ fontSize: '0.92rem', color: 'var(--text-dark)', margin: '0.25rem 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {p.title}
                  </h4>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                    <span style={{ fontSize: '0.95rem', fontWeight: '800', color: 'var(--primary)' }}>
                      {formatINR(p.amount)}
                    </span>
                    <span style={{ fontSize: '0.78rem', color: '#eab308' }}>★ {p.rating}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommended Destinations & Offers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        <div>
          <h3 style={{ fontSize: '1.25rem', color: 'var(--primary)', marginBottom: '1rem' }}>
            Recommended from Tamil Nadu
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {recommendedDests.map((d) => (
              <div
                key={d.id}
                onClick={() => navigate(`/packages?destination=${encodeURIComponent(d.name)}`)}
                style={{ background: '#fff', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-lg)', padding: '0.85rem', display: 'flex', gap: '1rem', alignItems: 'center', cursor: 'pointer', transition: 'box-shadow 0.2s' }}
              >
                <img src={d.image_url} alt={d.name} style={{ width: '80px', height: '60px', borderRadius: '6px', objectFit: 'cover' }} />
                <div>
                  <h4 style={{ fontSize: '1rem', color: 'var(--text-dark)', marginBottom: '0.15rem' }}>{d.name}</h4>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{d.popular_routes?.[0] || d.state}</div>
                  <div style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--primary)', marginTop: '0.2rem' }}>
                    From {formatINR(d.starting_price)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 style={{ fontSize: '1.25rem', color: 'var(--primary)', marginBottom: '1rem' }}>
            Special Offers & Vouchers
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {offers.map((o) => (
              <div
                key={o.id}
                style={{ background: '#fff', border: '1px dashed var(--secondary)', borderRadius: 'var(--radius-lg)', padding: '1.1rem', position: 'relative' }}
              >
                <span style={{ position: 'absolute', top: '10px', right: '10px', background: 'var(--accent-coral)', color: '#fff', fontSize: '0.75rem', fontWeight: '800', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
                  {o.discount}
                </span>
                <h4 style={{ color: 'var(--primary)', fontSize: '1rem', marginBottom: '0.25rem' }}>{o.title}</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>{o.description}</p>
                <div style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--text-dark)' }}>
                  Use code: <span style={{ color: 'var(--primary)', fontFamily: 'monospace' }}>{o.code}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
