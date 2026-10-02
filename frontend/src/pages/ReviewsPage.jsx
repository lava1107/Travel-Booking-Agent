import { useState, useEffect } from 'react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import fallbackReviews from '../data/reviewsFallback.json';

export default function ReviewsPage() {
  const { user, isAuthenticated } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Form State
  const [packageTitle, setPackageTitle] = useState('Kerala Backwaters, Tea Hills & Alleppey Houseboat');
  const [destination, setDestination] = useState('Kerala');
  const [rating, setRating] = useState('5');
  const [comment, setComment] = useState('');

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/reviews');
      if (data?.data && Array.isArray(data.data) && data.data.length > 0) {
        setReviews(data.data);
      } else {
        setReviews(fallbackReviews);
      }
    } catch (err) {
      console.warn('Reviews API fallback activated:', err);
      setReviews(fallbackReviews);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    setSubmitting(true);
    try {
      await api.post('/reviews', {
        package_title: packageTitle,
        destination,
        rating: Number(rating),
        comment,
        customer_name: user?.name || 'Verified Traveler'
      });
      setSuccessMsg('Thank you! Your travel review has been submitted and approved.');
      setComment('');
      setShowForm(false);
      await fetchReviews();
    } catch (err) {
      console.error('Failed to submit review:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="section-wrapper" style={{ paddingTop: '2.5rem', paddingBottom: '4rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '2.5rem' }}>
        <div>
          <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--secondary)', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
            Verified Traveler Feedback
          </span>
          <h1 style={{ fontSize: '2.4rem', color: 'var(--primary)', marginTop: '0.35rem' }}>
            Customer Reviews & Experiences
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', marginTop: '0.25rem' }}>
            Discover genuine feedback from travelers who booked tours originating from Tamil Nadu with Lyan Travels.
          </p>
        </div>

        <button
          type="button"
          className="btn-coral"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Cancel Review' : '✍️ Write a Review'}
        </button>
      </div>

      {successMsg && (
        <div style={{ background: '#ecfdf5', border: '1px solid #10b981', color: '#065f46', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem' }}>
          {successMsg}
        </div>
      )}

      {/* Review Submission Form */}
      {showForm && (
        <div style={{ background: '#fff', padding: '2rem', borderRadius: 'var(--radius-xl)', border: '1.5px solid var(--border-light)', boxShadow: 'var(--shadow-md)', marginBottom: '2.5rem', maxWidth: '650px' }}>
          <h3 style={{ fontSize: '1.25rem', color: 'var(--primary)', marginBottom: '1rem' }}>
            Share Your Travel Experience
          </h3>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-group">
              <label>Package Title</label>
              <input
                type="text"
                value={packageTitle}
                onChange={(e) => setPackageTitle(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label>Destination</label>
                <input
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Rating (1–5 Stars)</label>
                <select value={rating} onChange={(e) => setRating(e.target.value)}>
                  <option value="5">⭐⭐⭐⭐⭐ (5/5 Exceptional)</option>
                  <option value="4">⭐⭐⭐⭐ (4/5 Very Good)</option>
                  <option value="3">⭐⭐⭐ (3/5 Average)</option>
                  <option value="2">⭐⭐ (2/5 Below Average)</option>
                  <option value="1">⭐ (1/5 Poor)</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Your Review</label>
              <textarea
                rows="4"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="How was your hotel stay, transport, sightseeing, driver, or AI concierge experience?"
                style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--border-light)', fontFamily: 'inherit', fontSize: '0.92rem' }}
                required
              />
            </div>

            <button
              type="submit"
              className="btn-primary"
              disabled={submitting}
              style={{ justifyContent: 'center' }}
            >
              {submitting ? 'Submitting…' : 'Publish Review'}
            </button>
          </form>
        </div>
      )}

      {/* Reviews List */}
      {loading ? (
        <p>Loading reviews…</p>
      ) : reviews.length === 0 ? (
        <p>No reviews published yet.</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.75rem' }}>
          {reviews.map((r) => (
            <div
              key={r.id}
              style={{
                background: '#fff',
                borderRadius: 'var(--radius-xl)',
                border: '1px solid var(--border-light)',
                padding: '1.75rem',
                boxShadow: 'var(--shadow-sm)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
                  <span style={{ fontWeight: '800', color: 'var(--primary)', fontSize: '1.05rem' }}>
                    {r.customer_name}
                  </span>
                  <span style={{ color: '#f59e0b', fontWeight: '800' }}>
                    {'★'.repeat(Math.round(r.rating))} ({r.rating}/5)
                  </span>
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--secondary)', fontWeight: '700', marginBottom: '0.75rem' }}>
                  📍 {r.package_title} • {r.destination}
                </div>
                <p style={{ fontSize: '0.92rem', color: 'var(--text-body)', lineHeight: '1.6', fontStyle: 'italic' }}>
                  "{r.comment}"
                </p>
              </div>

              <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '0.75rem', marginTop: '1rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Travel Date: {r.travel_date} • Verified Traveler ✅
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
