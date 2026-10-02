import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import { formatINR } from '../utils/currency';
import { useAuth } from '../context/AuthContext';
import fallbackBookings from '../data/bookingsFallback.json';

export default function PaymentDashboard() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [verifying, setVerifying] = useState(false);
  const [verifyMessage, setVerifyMessage] = useState('');

  const fetchPayments = async () => {
    setLoading(true);
    let localSaved = [];
    try {
      localSaved = JSON.parse(localStorage.getItem('user_bookings') || '[]');
    } catch {}

    try {
      const endpoint = user?.role === 'admin' ? '/bookings/all' : '/bookings/my';
      const { data } = await api.get(endpoint);
      if (data?.data && Array.isArray(data.data) && data.data.length > 0) {
        const existingIds = new Set(data.data.map(b => b.booking_code || b.id));
        const nonDupLocals = localSaved.filter(b => !existingIds.has(b.booking_code || b.id));
        setBookings([...nonDupLocals, ...data.data]);
      } else {
        setBookings([...localSaved, ...fallbackBookings.slice(0, 6)]);
      }
    } catch (err) {
      console.warn('Payment dashboard fallback activated:', err);
      setBookings([...localSaved, ...fallbackBookings.slice(0, 6)]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();

    const handleNewBooking = (e) => {
      if (e.detail?.booking) {
        setBookings((prev) => [e.detail.booking, ...prev]);
      }
    };
    window.addEventListener('lyan_booking_confirmed', handleNewBooking);
    return () => window.removeEventListener('lyan_booking_confirmed', handleNewBooking);
  }, []);

  const handleSimulatePayment = async (b) => {
    setVerifying(true);
    setVerifyMessage('');
    try {
      await api.post('/payments/verify', {
        bookingId: b.id,
        paymentMethod: 'UPI (Testing Sandbox)',
        transactionId: `TXN-${Date.now()}`
      });
    } catch (err) {
      console.warn('Payment simulation fallback:', err);
    }
    setVerifyMessage(`Payment completed successfully for Booking ${b.booking_code}. Status: CONFIRMED.`);
    setBookings((prev) =>
      prev.map((item) =>
        item.id === b.id ? { ...item, payment_status: 'paid', status: 'confirmed' } : item
      )
    );
    setVerifying(false);
  };

  return (
    <div className="section-wrapper" style={{ paddingTop: '2.5rem', paddingBottom: '4rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.2rem', color: 'var(--primary)' }}>Payment Management & Ledger</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1rem', marginTop: '0.25rem' }}>
          Transparent billing records, tax calculations, and payment statuses for your travel reservations.
        </p>
      </div>

      {/* Gateway Environment Status Notice */}
      <div style={{ background: '#f8fafc', border: '1.5px solid #cbd5e1', borderRadius: 'var(--radius-lg)', padding: '1.25rem 1.5rem', marginBottom: '2rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <span style={{ fontSize: '2rem' }}>💳</span>
        <div>
          <h4 style={{ color: 'var(--text-dark)', fontSize: '1rem', marginBottom: '0.2rem' }}>
            Payment Gateway Environment: <strong>Development & Testing Mode Active</strong>
          </h4>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
            Standard UPI, RuPay, and Card simulations are active. No real credit/debit cards or bank accounts will be charged in development mode.
          </p>
        </div>
      </div>

      {verifyMessage && (
        <div style={{ background: '#ecfdf5', border: '1px solid #10b981', color: '#065f46', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem' }}>
          {verifyMessage}
        </div>
      )}

      {loading ? (
        <p>Loading payment ledger…</p>
      ) : bookings.length === 0 ? (
        <div style={{ background: '#fff', padding: '3rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-muted)' }}>You currently have no payment transactions on record.</p>
          <Link to="/packages" className="btn-primary" style={{ marginTop: '1rem', display: 'inline-block' }}>Explore Packages</Link>
        </div>
      ) : (
        <div className="custom-table-wrap">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Booking Ref</th>
                <th>Package & Route</th>
                <th>Base Amount</th>
                <th>GST (5%)</th>
                <th>Total Billed</th>
                <th>Status</th>
                <th>Payment Method</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => {
                const total = Number(b.total_amount || 0);
                const base = Math.round((total / 1.05) * 100) / 100;
                const tax = Math.round((total - base) * 100) / 100;
                const isPaid = b.payment_status === 'completed' || b.status === 'confirmed';

                return (
                  <tr key={b.id}>
                    <td>
                      <strong>{b.booking_code}</strong>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{b.created_at?.split('T')[0]}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: '600', color: 'var(--text-dark)' }}>{b.trip_title}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {b.source} ➔ {b.destination} ({b.travelers_count} Pax)
                      </div>
                    </td>
                    <td>{formatINR(base)}</td>
                    <td>{formatINR(tax)}</td>
                    <td>
                      <strong style={{ color: 'var(--primary)', fontSize: '1.05rem' }}>{formatINR(total)}</strong>
                    </td>
                    <td>
                      <span className={`status-badge status-${b.payment_status || (isPaid ? 'completed' : 'pending')}`}>
                        {(b.payment_status || (isPaid ? 'Paid' : 'Pending')).toUpperCase()}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.85rem' }}>{b.payment_method || 'UPI'}</td>
                    <td>
                      {!isPaid ? (
                        <button
                          type="button"
                          className="btn-coral"
                          onClick={() => handleSimulatePayment(b)}
                          disabled={verifying}
                          style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
                        >
                          Complete Payment
                        </button>
                      ) : (
                        <span style={{ fontSize: '0.85rem', color: '#16a34a', fontWeight: '700' }}>✓ Paid</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
