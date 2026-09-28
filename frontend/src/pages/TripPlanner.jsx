import { useState } from 'react';
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
  'Puducherry',
];

export default function TripPlanner() {
  const navigate = useNavigate();
  const [origin, setOrigin] = useState('Chennai');
  const [destination, setDestination] = useState('Kerala');
  const [durationDays, setDurationDays] = useState(5);
  const [travelers, setTravelers] = useState(2);
  const [budget, setBudget] = useState(50000);
  const [interests, setInterests] = useState(['Beaches & Backwaters', 'Sightseeing', 'Local Cuisine']);
  const [loading, setLoading] = useState(false);
  const [planResult, setPlanResult] = useState(null);
  const [selectedTrip, setSelectedTrip] = useState(null);

  const interestOptions = [
    'Beaches & Backwaters',
    'Hill Stations & Tea Estates',
    'Palaces & Heritage',
    'Wildlife & Nature',
    'Adventure & Water Sports',
    'Family Relaxation',
    'Honeymoon Romance',
    'Local Cuisine & Food Walks'
  ];

  const toggleInterest = (item) => {
    if (interests.includes(item)) {
      setInterests(interests.filter(i => i !== item));
    } else {
      setInterests([...interests, item]);
    }
  };

  const handleGeneratePlan = async (e) => {
    e.preventDefault();
    setLoading(true);
    setPlanResult(null);

    try {
      const { data } = await api.post('/planner/generate', {
        origin,
        destination,
        durationDays: Number(durationDays),
        travelers: Number(travelers),
        budget: Number(budget),
        interests
      });
      setPlanResult(data);
    } catch (err) {
      console.error('Failed to generate trip plan:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="section-wrapper" style={{ paddingTop: '2.5rem', paddingBottom: '4rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--secondary)', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
          Custom Travel Blueprint
        </span>
        <h1 style={{ fontSize: '2.4rem', color: 'var(--primary)', marginTop: '0.35rem' }}>
          AI-Assisted Trip Planner
        </h1>
        <p style={{ color: 'var(--text-muted)', maxWidth: '720px', margin: '0.5rem auto 0', fontSize: '1.05rem' }}>
          Generate a realistic Day-by-Day travel itinerary departing from your city in Tamil Nadu with transparent cost breakdowns and matching booking packages.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2.5rem', alignItems: 'flex-start' }}>
        {/* Left Input Form */}
        <div style={{ background: '#fff', padding: '2rem', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)' }}>
          <h3 style={{ fontSize: '1.25rem', color: 'var(--primary)', marginBottom: '1.25rem' }}>
            Trip Parameters
          </h3>

          <form onSubmit={handleGeneratePlan} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="form-group">
              <label>🛫 Departing From (Tamil Nadu)</label>
              <select value={origin} onChange={(e) => setOrigin(e.target.value)}>
                {TN_CITIES.map((c) => (
                  <option key={c} value={c}>{c}, Tamil Nadu</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>🏝️ Destination</label>
              <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="e.g. Kerala, Goa, Rajasthan, Singapore, Maldives..."
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label>⏳ Duration (Days)</label>
                <select value={durationDays} onChange={(e) => setDurationDays(e.target.value)}>
                  <option value="3">3 Days (Weekend)</option>
                  <option value="4">4 Days</option>
                  <option value="5">5 Days (Standard)</option>
                  <option value="6">6 Days</option>
                  <option value="7">7 Days (1 Week)</option>
                </select>
              </div>

              <div className="form-group">
                <label>👥 Travelers</label>
                <select value={travelers} onChange={(e) => setTravelers(e.target.value)}>
                  <option value="1">1 Person (Solo)</option>
                  <option value="2">2 People (Couple)</option>
                  <option value="3">3 People</option>
                  <option value="4">4 People (Family)</option>
                  <option value="5">5+ Group</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>💰 Approximate Budget (₹ INR)</label>
              <input
                type="number"
                value={budget}
                step="5000"
                onChange={(e) => setBudget(e.target.value)}
                placeholder="e.g. 50000"
                required
              />
            </div>

            <div className="form-group">
              <label>🎯 Key Travel Interests</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem', marginTop: '0.25rem' }}>
                {interestOptions.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => toggleInterest(opt)}
                    style={{
                      padding: '0.35rem 0.75rem',
                      borderRadius: 'var(--radius-full)',
                      border: '1px solid',
                      borderColor: interests.includes(opt) ? 'var(--primary)' : 'var(--border-light)',
                      background: interests.includes(opt) ? 'var(--primary-light)' : '#fff',
                      color: interests.includes(opt) ? 'var(--primary)' : 'var(--text-body)',
                      fontSize: '0.78rem',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    {interests.includes(opt) ? '✓ ' : '+ '}{opt}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="btn-coral"
              style={{ width: '100%', padding: '0.85rem', justifyContent: 'center', marginTop: '0.5rem' }}
              disabled={loading}
            >
              {loading ? '🧠 Generating Custom Itinerary…' : '⚡ Generate AI Travel Plan'}
            </button>
          </form>
        </div>

        {/* Right Generated Itinerary View */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {!planResult && !loading && (
            <div style={{ background: '#fff', padding: '3.5rem 2rem', borderRadius: 'var(--radius-xl)', border: '1.5px dashed var(--border-light)', textAlign: 'center' }}>
              <span style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}>🗺️</span>
              <h3 style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}>Ready to Blueprint Your Next Vacation</h3>
              <p style={{ color: 'var(--text-muted)', maxWidth: '420px', margin: '0 auto', fontSize: '0.92rem' }}>
                Select your origin city in Tamil Nadu, destination, and budget, then click "Generate AI Travel Plan" to receive a tailored day-by-day itinerary.
              </p>
            </div>
          )}

          {loading && (
            <div style={{ background: '#fff', padding: '4rem 2rem', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-light)', textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', animation: 'spin 1s infinite linear', marginBottom: '1rem' }}>⚙️</div>
              <h3>Assembling Best Route & Activities…</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                Checking Tamil Nadu flight connections, hotel categories, and optimal schedules from {origin} to {destination}.
              </p>
            </div>
          )}

          {planResult && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* Disclaimer Notice */}
              <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 'var(--radius-lg)', padding: '1rem 1.25rem', display: 'flex', gap: '0.75rem', alignItems: 'center', fontSize: '0.88rem', color: '#1e40af' }}>
                <span style={{ fontSize: '1.4rem' }}>💡</span>
                <div>
                  <strong>{planResult.plan_type}</strong> — {planResult.note}
                </div>
              </div>

              {/* Day-by-Day Timeline */}
              <div style={{ background: '#fff', padding: '1.75rem', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-light)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <h3 style={{ color: 'var(--primary)', fontSize: '1.35rem' }}>
                    {planResult.origin} ➔ {planResult.destination} ({planResult.duration_days} Days)
                  </h3>
                  <span style={{ fontSize: '0.85rem', background: 'var(--bg-subtle)', padding: '0.25rem 0.75rem', borderRadius: 'var(--radius-full)', fontWeight: '700', color: 'var(--primary)' }}>
                    Est. Budget: {formatINR(planResult.estimated_budget)}
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  {planResult.itinerary?.map((dayItem) => (
                    <div key={dayItem.day} style={{ borderLeft: '3px solid var(--secondary)', paddingLeft: '1.25rem' }}>
                      <h4 style={{ fontSize: '1.05rem', color: 'var(--text-dark)', marginBottom: '0.4rem' }}>
                        {dayItem.title}
                      </h4>
                      <ul style={{ paddingLeft: '1.1rem', margin: 0, fontSize: '0.9rem', color: 'var(--text-body)', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                        {dayItem.activities?.map((act, aIdx) => (
                          <li key={aIdx}>{act}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>

              {/* Matched Packages Direct Booking */}
              {planResult.matched_packages && planResult.matched_packages.length > 0 && (
                <div>
                  <h3 style={{ color: 'var(--primary)', fontSize: '1.25rem', marginBottom: '1rem' }}>
                    Matching Packages Ready to Book
                  </h3>
                  <div className="packages-grid">
                    {planResult.matched_packages.map((pkg) => (
                      <PackageCard
                        key={pkg.id}
                        trip={pkg}
                        onBook={(t) => setSelectedTrip(t)}
                        onBookAI={(t) =>
                          window.dispatchEvent(new CustomEvent('lyan_book_ai', { detail: { trip: t } }))
                        }
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

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
