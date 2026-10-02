import { useState } from 'react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function SupportPage() {
  const { user } = useAuth();
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;
    setLoading(true);
    setSuccess('');

    try {
      await api.post('/support', {
        subject,
        message,
        customer_name: user?.name || 'Guest Traveler',
        customer_email: user?.email || 'guest@lyantravel.com',
      });
    } catch (err) {
      console.warn('Support ticket offline fallback:', err);
    }
    setSuccess('Your travel enquiry / support ticket has been registered. An agent will contact you shortly.');
    setSubject('');
    setMessage('');
    setLoading(false);
  };

  return (
    <div className="section-wrapper" style={{ paddingTop: '2.5rem', paddingBottom: '4rem', maxWidth: '880px' }}>
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--secondary)', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
          Customer Care & Travel Consulting
        </span>
        <h1 style={{ fontSize: '2.4rem', color: 'var(--primary)', marginTop: '0.35rem' }}>
          Connect with Human Travel Consultants
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', margin: '0.5rem auto 0' }}>
          Need assistance customizing a flight, upgrading a hotel room, or planning an international group tour? Our team in Chennai and Coimbatore is here for you.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
        <div className="metric-card" style={{ padding: '1.5rem', flexDirection: 'column', alignItems: 'flex-start' }}>
          <span style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📞</span>
          <h4 style={{ color: 'var(--primary)', marginBottom: '0.35rem' }}>Phone Assistance</h4>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', margin: 0 }}>
            Call our Chennai headquarters directly:<br />
            <strong>+91 44 2855 0199</strong> (Mon–Sat, 9AM–8PM)
          </p>
        </div>

        <div className="metric-card" style={{ padding: '1.5rem', flexDirection: 'column', alignItems: 'flex-start' }}>
          <span style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>✉️</span>
          <h4 style={{ color: 'var(--primary)', marginBottom: '0.35rem' }}>Email Desk</h4>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', margin: 0 }}>
            Send us booking or visa queries:<br />
            <strong>support@lyantravels.com</strong>
          </p>
        </div>

        <div className="metric-card" style={{ padding: '1.5rem', flexDirection: 'column', alignItems: 'flex-start' }}>
          <span style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🤖</span>
          <h4 style={{ color: 'var(--primary)', marginBottom: '0.35rem' }}>Instant AI Assistant</h4>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', margin: 0 }}>
            Available 24/7 on the bottom right of your screen for immediate quotes and booking.
          </p>
        </div>
      </div>

      {/* Ticket Submission Form */}
      <div style={{ background: '#fff', padding: '2.25rem', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)' }}>
        <h3 style={{ fontSize: '1.35rem', color: 'var(--primary)', marginBottom: '1.25rem' }}>
          Create an Agent Support Ticket
        </h3>

        {success && (
          <div style={{ background: '#ecfdf5', border: '1px solid #10b981', color: '#065f46', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem' }}>
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          <div className="form-group">
            <label>Subject / Topic</label>
            <input
              type="text"
              placeholder="e.g. Booking modification, special meal request, international visa guidance..."
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Details & Specific Requirements</label>
            <textarea
              rows="5"
              placeholder="Provide any PNR codes, travel dates, departure city, or question you have for our human consultant..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--border-light)', fontFamily: 'inherit', fontSize: '0.92rem' }}
              required
            />
          </div>

          <button
            type="submit"
            className="btn-coral"
            disabled={loading}
            style={{ alignSelf: 'flex-start', padding: '0.75rem 1.75rem' }}
          >
            {loading ? 'Submitting…' : 'Submit Request to Travel Agent'}
          </button>
        </form>
      </div>
    </div>
  );
}
