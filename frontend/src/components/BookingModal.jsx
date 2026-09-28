import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { formatINR } from '../utils/currency';

export default function BookingModal({ trip, onClose, onSuccess }) {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1); // 1: travelers & dates, 2: price review & payment, 3: voucher confirmation
  const [travelDate, setTravelDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split('T')[0];
  });
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [travelerNames, setTravelerNames] = useState([user?.name || 'Primary Guest']);
  const [specialRequests, setSpecialRequests] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('UPI (Google Pay / PhonePe)');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  if (!trip) return null;

  const totalPax = adults + children;
  const baseRate = Number(trip.amount || 0);
  const adultsTotal = baseRate * adults;
  const childRate = baseRate * 0.6;
  const childrenTotal = childRate * children;
  const subtotal = adultsTotal + childrenTotal;
  const gst = Math.round(subtotal * 0.05 * 100) / 100;
  const totalAmount = Math.round((subtotal + gst) * 100) / 100;

  const handleAdultsChange = (val) => {
    const newAdults = Math.max(1, Math.min(trip.available_seats || 10, val));
    setAdults(newAdults);
    syncTravelerNames(newAdults + children);
  };

  const handleChildrenChange = (val) => {
    const newKids = Math.max(0, val);
    setChildren(newKids);
    syncTravelerNames(adults + newKids);
  };

  const syncTravelerNames = (count) => {
    setTravelerNames((prev) => {
      const updated = [...prev];
      while (updated.length < count) {
        updated.push(`Guest ${updated.length + 1}`);
      }
      return updated.slice(0, count);
    });
  };

  const handleNameChange = (idx, name) => {
    const updated = [...travelerNames];
    updated[idx] = name;
    setTravelerNames(updated);
  };

  const handleProceedToReview = (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (!travelDate) {
      setError('Please select a valid travel date.');
      return;
    }
    setError('');
    setStep(2);
  };

  const handleConfirmAndPay = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload = {
        tripId: trip.id,
        travelDate,
        travelersCount: totalPax,
        travelerNames,
        specialRequests,
        paymentMethod,
        departureCity: trip.origin || trip.source || 'Chennai',
        source: trip.origin || trip.source || 'Chennai',
      };

      const { data } = await api.post('/bookings', payload);
      setConfirmedBooking(data.data);
      setStep(3);
    } catch (err) {
      console.error('Booking failed:', err);
      setError(err.response?.data?.detail || err.response?.data?.message || 'Could not finalize booking.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--secondary)' }}>
              RESERVATION CHECKOUT
            </span>
            <h2 style={{ fontSize: '1.35rem', color: 'var(--primary)', marginTop: '0.15rem' }}>
              {trip.title}
            </h2>
          </div>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>

        {error && (
          <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', color: '#991b1b', padding: '0.75rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem', fontSize: '0.88rem' }}>
            {error}
          </div>
        )}

        {/* Step Indicator */}
        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.75rem', marginBottom: '1.25rem', fontSize: '0.85rem', fontWeight: '700' }}>
          <span style={{ color: step >= 1 ? 'var(--primary)' : 'var(--text-muted)' }}>1. Traveler Details</span>
          <span style={{ color: step >= 2 ? 'var(--primary)' : 'var(--text-muted)' }}>2. Review & Payment</span>
          <span style={{ color: step === 3 ? '#16a34a' : 'var(--text-muted)' }}>3. Confirmation</span>
        </div>

        {/* Step 1: Traveler Details */}
        {step === 1 && (
          <form onSubmit={handleProceedToReview} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            <div style={{ background: 'var(--bg-subtle)', padding: '1rem', borderRadius: 'var(--radius-md)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem', fontSize: '0.85rem' }}>
              <div>📍 <strong>Route:</strong> {trip.origin || trip.source} ➔ {trip.destination}</div>
              <div>🏷️ <strong>Category:</strong> {trip.category || 'Standard'}</div>
              <div>🚀 <strong>Transport:</strong> {trip.transport}</div>
              <div>⏳ <strong>Duration:</strong> {trip.duration_days} Days</div>
            </div>

            <div className="form-group">
              <label>📅 Preferred Departure Date</label>
              <input
                type="date"
                value={travelDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setTravelDate(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label>👥 Adults (12+ yrs)</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <button type="button" onClick={() => handleAdultsChange(adults - 1)} style={{ padding: '0.4rem 0.8rem', borderRadius: '4px', border: '1px solid var(--border-light)', background: '#fff', cursor: 'pointer', fontWeight: '700' }}>-</button>
                  <span style={{ fontWeight: '700', width: '20px', textAlign: 'center' }}>{adults}</span>
                  <button type="button" onClick={() => handleAdultsChange(adults + 1)} style={{ padding: '0.4rem 0.8rem', borderRadius: '4px', border: '1px solid var(--border-light)', background: '#fff', cursor: 'pointer', fontWeight: '700' }}>+</button>
                </div>
              </div>

              <div className="form-group">
                <label>🧒 Children (2–11 yrs)</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <button type="button" onClick={() => handleChildrenChange(children - 1)} style={{ padding: '0.4rem 0.8rem', borderRadius: '4px', border: '1px solid var(--border-light)', background: '#fff', cursor: 'pointer', fontWeight: '700' }}>-</button>
                  <span style={{ fontWeight: '700', width: '20px', textAlign: 'center' }}>{children}</span>
                  <button type="button" onClick={() => handleChildrenChange(children + 1)} style={{ padding: '0.4rem 0.8rem', borderRadius: '4px', border: '1px solid var(--border-light)', background: '#fff', cursor: 'pointer', fontWeight: '700' }}>+</button>
                </div>
              </div>
            </div>

            {/* Names Input */}
            <div className="form-group">
              <label>Passenger Names ({totalPax} Guests)</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {travelerNames.map((name, i) => (
                  <input
                    key={i}
                    type="text"
                    placeholder={`Guest ${i + 1} Full Name`}
                    value={name}
                    onChange={(e) => handleNameChange(i, e.target.value)}
                    required
                  />
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>Special Requests or Dietary Requirements</label>
              <input
                type="text"
                placeholder="e.g. Vegetarian meals, high-floor room, twin beds..."
                value={specialRequests}
                onChange={(e) => setSpecialRequests(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button type="button" className="btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn-coral">
                Continue to Review & Payment ➔
              </button>
            </div>
          </form>
        )}

        {/* Step 2: Review & Payment Method */}
        {step === 2 && (
          <form onSubmit={handleConfirmAndPay} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Transparent Price Breakdown */}
            <div style={{ background: '#f8fafc', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-lg)', padding: '1.25rem' }}>
              <h4 style={{ color: 'var(--primary)', marginBottom: '0.75rem', fontSize: '1rem' }}>
                Transparent Pricing Breakdown
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.88rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Adult Base Rate ({adults} × {formatINR(baseRate)})</span>
                  <span>{formatINR(adultsTotal)}</span>
                </div>
                {children > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Child Discount Rate ({children} × {formatINR(childRate)})</span>
                    <span>{formatINR(childrenTotal)}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>GST Tax (5%)</span>
                  <span>{formatINR(gst)}</span>
                </div>
                <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '0.5rem', marginTop: '0.25rem', display: 'flex', justifyContent: 'space-between', fontWeight: '800', fontSize: '1.1rem', color: 'var(--primary)' }}>
                  <span>Total Amount Payable</span>
                  <span>{formatINR(totalAmount)}</span>
                </div>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="form-group">
              <label>Select Payment Method</label>
              <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                <option value="UPI (Instant)">UPI (Google Pay / PhonePe / Paytm)</option>
                <option value="RuPay / Debit Card">RuPay / Debit Card</option>
                <option value="Credit Card (Visa / Mastercard)">Credit Card (Visa / Mastercard)</option>
                <option value="Net Banking (SBI / HDFC / ICICI)">Net Banking</option>
              </select>
            </div>

            {/* Gateway Notice */}
            <div style={{ background: '#f0fdf4', border: '1px solid #86efac', padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)', fontSize: '0.82rem', color: '#166534' }}>
              🔒 <strong>Development Sandbox Active:</strong> Payment gateway simulation will issue a valid PNR e-Ticket instantly without real debit card deductions.
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
              <button type="button" className="btn-secondary" onClick={() => setStep(1)}>
                ← Back
              </button>
              <button type="submit" className="btn-coral" disabled={loading}>
                {loading ? 'Processing Transaction…' : `Pay ${formatINR(totalAmount)} & Confirm`}
              </button>
            </div>
          </form>
        )}

        {/* Step 3: Confirmation Voucher */}
        {step === 3 && confirmedBooking && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', textAlign: 'center' }}>
            <span style={{ fontSize: '3rem' }}>🎉</span>
            <h3 style={{ color: '#166534', fontSize: '1.4rem' }}>
              Booking Confirmed!
            </h3>
            <p style={{ color: 'var(--text-body)', fontSize: '0.95rem' }}>
              Your reservation for <strong>{trip.title}</strong> has been confirmed.
            </p>

            <div style={{ background: '#ecfdf5', border: '1.5px solid #10b981', borderRadius: 'var(--radius-lg)', padding: '1.25rem', textAlign: 'left', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.88rem' }}>
              <div><strong>PNR Voucher:</strong><br /><code>{confirmedBooking.bookingCode || confirmedBooking.booking_code}</code></div>
              <div><strong>Travel Date:</strong><br />{travelDate}</div>
              <div><strong>Travelers:</strong><br />{totalPax} Guest(s)</div>
              <div><strong>Total Paid:</strong><br /><strong>{formatINR(totalAmount)}</strong></div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', marginTop: '0.5rem' }}>
              <button
                type="button"
                className="btn-primary"
                onClick={() => {
                  if (onSuccess) onSuccess();
                  onClose();
                  navigate('/my-bookings');
                }}
              >
                Go to My Trips & Bookings ➔
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
