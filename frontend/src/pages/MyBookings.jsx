import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import { formatINR } from '../utils/currency';

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming'); // 'upcoming', 'completed', 'cancelled', 'all'
  const [selectedBooking, setSelectedBooking] = useState(null); // For Itinerary modal
  const [showCancelModal, setShowCancelModal] = useState(null); // For cancellation confirmation
  const [cancelLoading, setCancelLoading] = useState(false);
  const [message, setMessage] = useState('');

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/bookings/my');
      setBookings(data.data || []);
    } catch (err) {
      console.error('Failed to load customer bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancelBooking = async (b) => {
    setCancelLoading(true);
    try {
      await api.put(`/bookings/${b.id}/cancel`);
      setMessage(`Booking ${b.booking_code} cancelled successfully. Refund initiated to ${b.payment_method || 'original source'}.`);
      setShowCancelModal(null);
      await fetchBookings();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to cancel booking.');
    } finally {
      setCancelLoading(false);
    }
  };

  const filtered = bookings.filter((b) => {
    if (activeTab === 'upcoming') return b.status === 'confirmed' || b.status === 'pending';
    if (activeTab === 'completed') return b.status === 'completed';
    if (activeTab === 'cancelled') return b.status === 'cancelled';
    return true;
  });

  const timelineSteps = [
    'Booking Confirmed',
    'Payment Completed',
    'Documents Ready',
    'Travel Begins',
    'Hotel Check-in',
    'Activities',
    'Return Journey',
    'Trip Completed'
  ];

  return (
    <div className="section-wrapper" style={{ paddingTop: '2.5rem', paddingBottom: '4rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2.4rem', color: 'var(--primary)' }}>My Trips & Bookings</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', marginTop: '0.25rem' }}>
            Manage your travel itineraries, download boarding vouchers, inspect day-by-day schedules, and track live status.
          </p>
        </div>

        <Link to="/packages" className="btn-coral">
          + Book New Journey
        </Link>
      </div>

      {message && (
        <div style={{ background: '#ecfdf5', border: '1px solid #10b981', color: '#065f46', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem' }}>
          {message}
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '2px solid var(--border-light)', marginBottom: '2rem', flexWrap: 'wrap' }}>
        {[
          { key: 'upcoming', label: `Upcoming Trips (${bookings.filter(b => b.status === 'confirmed' || b.status === 'pending').length})` },
          { key: 'completed', label: `Completed Trips (${bookings.filter(b => b.status === 'completed').length})` },
          { key: 'cancelled', label: `Cancelled Trips (${bookings.filter(b => b.status === 'cancelled').length})` },
          { key: 'all', label: `All Bookings (${bookings.length})` },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            style={{
              padding: '0.75rem 1.25rem',
              fontWeight: '700',
              fontSize: '0.95rem',
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === tab.key ? '3px solid var(--primary)' : '3px solid transparent',
              color: activeTab === tab.key ? 'var(--primary)' : 'var(--text-muted)',
              cursor: 'pointer',
              marginBottom: '-2px'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Trips Cards / List */}
      {loading ? (
        <p>Loading your trips…</p>
      ) : filtered.length === 0 ? (
        <div style={{ background: '#fff', padding: '3.5rem 1rem', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-light)', textAlign: 'center' }}>
          <span style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}>🧳</span>
          <h3 style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}>No trips in this view</h3>
          <p style={{ color: 'var(--text-muted)', maxWidth: '400px', margin: '0 auto 1.5rem' }}>
            Looking to plan your next vacation from Tamil Nadu? Check our domestic and international packages.
          </p>
          <Link to="/packages" className="btn-primary">Browse Tour Packages</Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
          {filtered.map((b) => {
            const stepIndex = b.status === 'cancelled' ? -1 : (b.timeline_step || (b.status === 'confirmed' ? 2 : 1));

            return (
              <div
                key={b.id}
                style={{
                  background: '#fff',
                  borderRadius: 'var(--radius-xl)',
                  border: '1.5px solid var(--border-light)',
                  boxShadow: 'var(--shadow-sm)',
                  padding: '1.75rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1.25rem'
                }}
              >
                {/* Trip Header Row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <img
                      src={b.image_url || 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=300&q=80'}
                      alt={b.trip_title}
                      style={{ width: '90px', height: '70px', borderRadius: 'var(--radius-md)', objectFit: 'cover' }}
                    />
                    <div>
                      <div style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--secondary)' }}>
                        PNR REFERENCE: <strong>{b.booking_code}</strong>
                      </div>
                      <h3 style={{ fontSize: '1.3rem', color: 'var(--primary)', margin: '0.2rem 0' }}>
                        {b.trip_title}
                      </h3>
                      <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                        📍 {b.source} ➔ 🏝️ {b.destination} • 👥 {b.travelers_count} Traveler(s)
                      </div>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginBottom: '0.35rem' }}>
                      <span className={`status-badge status-${b.status}`}>
                        {b.status.toUpperCase()}
                      </span>
                      <span className={`status-badge status-${b.payment_status || 'completed'}`}>
                        {(b.payment_status || 'Paid').toUpperCase()}
                      </span>
                    </div>
                    <div style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--primary)' }}>
                      {formatINR(b.total_amount)}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      Date: {new Date(b.travel_date).toDateString()}
                    </div>
                  </div>
                </div>

                {/* Timeline Stepper for Active / Confirmed Trips */}
                {b.status !== 'cancelled' && (
                  <div style={{ background: 'var(--bg-subtle)', borderRadius: 'var(--radius-lg)', padding: '1rem', border: '1px solid var(--border-light)' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                      Trip Progress Timeline
                    </div>
                    <div className="timeline-stepper">
                      {timelineSteps.map((step, sIdx) => {
                        const isCompleted = sIdx < stepIndex;
                        const isCurrent = sIdx === stepIndex;
                        return (
                          <div key={sIdx} className={`timeline-step ${isCompleted ? 'completed' : ''} ${isCurrent ? 'active' : ''}`}>
                            <div className="timeline-circle">
                              {isCompleted ? '✓' : sIdx + 1}
                            </div>
                            <span className="timeline-label">{step}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Trip Actions Bar */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-light)', paddingTop: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    Payment Mode: <strong>{b.payment_method || 'UPI / Card'}</strong> • Booked on {b.created_at?.split('T')[0]}
                  </div>

                  <div style={{ display: 'flex', gap: '0.65rem' }}>
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => setSelectedBooking(b)}
                      style={{ padding: '0.45rem 0.95rem', fontSize: '0.85rem' }}
                    >
                      🗓️ View Day-by-Day Itinerary
                    </button>

                    {b.status === 'confirmed' && (
                      <button
                        type="button"
                        className="btn-primary"
                        onClick={() => setSelectedBooking(b)}
                        style={{ padding: '0.45rem 0.95rem', fontSize: '0.85rem' }}
                      >
                        📄 Download Boarding Voucher
                      </button>
                    )}

                    {b.status === 'pending' && (
                      <Link
                        to="/payments"
                        className="btn-coral"
                        style={{ padding: '0.45rem 0.95rem', fontSize: '0.85rem' }}
                      >
                        💳 Complete Payment
                      </Link>
                    )}

                    {b.status !== 'cancelled' && (
                      <button
                        type="button"
                        onClick={() => setShowCancelModal(b)}
                        style={{ padding: '0.45rem 0.85rem', background: '#fee2e2', color: '#991b1b', border: '1px solid #fca5a5', borderRadius: 'var(--radius-md)', fontWeight: '700', fontSize: '0.82rem', cursor: 'pointer' }}
                      >
                        Cancel Booking
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Itinerary & Boarding Voucher Modal */}
      {selectedBooking && (
        <div className="modal-overlay" onClick={() => setSelectedBooking(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--secondary)' }}>
                  OFFICIAL TRAVEL ITINERARY & BOARDING PASS
                </span>
                <h2 style={{ fontSize: '1.35rem', color: 'var(--primary)', marginTop: '0.2rem' }}>
                  {selectedBooking.trip_title}
                </h2>
              </div>
              <button className="modal-close-btn" onClick={() => setSelectedBooking(null)}>✕</button>
            </div>

            <div style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', padding: '1rem', marginBottom: '1.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem', fontSize: '0.85rem' }}>
              <div><strong>PNR Voucher:</strong><br />{selectedBooking.booking_code}</div>
              <div><strong>Origin:</strong><br />{selectedBooking.source}</div>
              <div><strong>Destination:</strong><br />{selectedBooking.destination}</div>
              <div><strong>Date:</strong><br />{selectedBooking.travel_date}</div>
              <div><strong>Travelers:</strong><br />{selectedBooking.travelers_count} Guest(s)</div>
              <div><strong>Status:</strong><br /><span style={{ color: '#16a34a', fontWeight: '700' }}>{selectedBooking.status.toUpperCase()}</span></div>
            </div>

            <h3 style={{ fontSize: '1.15rem', color: 'var(--primary)', marginBottom: '1rem' }}>
              Schedule & Highlights
            </h3>

            {selectedBooking.itinerary && selectedBooking.itinerary.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {selectedBooking.itinerary.map((dayItem) => (
                  <div key={dayItem.day} style={{ borderLeft: '3px solid var(--primary)', paddingLeft: '1rem' }}>
                    <div style={{ fontWeight: '700', fontSize: '0.95rem', color: 'var(--text-dark)' }}>
                      Day {dayItem.day}: {dayItem.title}
                    </div>
                    <ul style={{ paddingLeft: '1.1rem', margin: '0.35rem 0 0', fontSize: '0.86rem', color: 'var(--text-body)' }}>
                      {dayItem.activities?.map((act, i) => (
                        <li key={i}>{act}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--text-muted)' }}>Detailed day-by-day activities will be dispatched to your phone/email 24 hours prior to travel.</p>
            )}

            <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => window.print()}
              >
                🖨️ Print / Save PDF
              </button>
              <button
                type="button"
                className="btn-primary"
                onClick={() => setSelectedBooking(null)}
              >
                Close Itinerary
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancellation Confirmation Safeguard Modal */}
      {showCancelModal && (
        <div className="modal-overlay" onClick={() => setShowCancelModal(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <div className="modal-header">
              <h3 style={{ color: '#991b1b', fontSize: '1.25rem' }}>Confirm Booking Cancellation</h3>
              <button className="modal-close-btn" onClick={() => setShowCancelModal(null)}>✕</button>
            </div>

            <p style={{ fontSize: '0.95rem', lineHeight: '1.6', color: 'var(--text-body)', marginBottom: '1.25rem' }}>
              Are you sure you wish to cancel reservation <strong>{showCancelModal.booking_code}</strong> ({showCancelModal.trip_title})?
            </p>

            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 'var(--radius-md)', padding: '1rem', marginBottom: '1.5rem', fontSize: '0.86rem', color: '#991b1b' }}>
              <strong>Cancellation & Refund Policy:</strong><br />
              - Cancellations made 48+ hours prior to departure receive 100% refund.<br />
              - Refund will be automatically credited to <strong>{showCancelModal.payment_method || 'original account'}</strong> within 2-3 business days.
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setShowCancelModal(null)}
                disabled={cancelLoading}
              >
                Keep Booking
              </button>
              <button
                type="button"
                onClick={() => handleCancelBooking(showCancelModal)}
                disabled={cancelLoading}
                style={{ padding: '0.65rem 1.25rem', background: '#dc2626', color: '#fff', border: 'none', borderRadius: 'var(--radius-md)', fontWeight: '700', cursor: 'pointer' }}
              >
                {cancelLoading ? 'Processing Cancellation…' : 'Yes, Cancel Reservation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
