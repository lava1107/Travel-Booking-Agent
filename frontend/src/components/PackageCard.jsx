import { Link } from 'react-router-dom';
import { formatINR } from '../utils/currency';

export default function PackageCard({ trip, onBook, onBookAI, onToggleCompare, isCompared }) {
  if (!trip) return null;

  const handleBookWithAI = (e) => {
    e.stopPropagation();
    if (onBookAI) {
      onBookAI(trip);
    } else {
      window.dispatchEvent(new CustomEvent('lyan_book_ai', { detail: { trip } }));
    }
  };

  const catClass = `cat-${(trip.category || 'Standard').toLowerCase()}`;

  return (
    <div className="package-card">
      <div className="card-image-wrap">
        <img
          src={trip.image_url || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80'}
          alt={trip.title}
          className="card-image"
          loading="lazy"
        />
        <div className="card-top-badges">
          <span className={`card-cat-pill cat-badge ${catClass}`}>
            {trip.category || 'Standard'}
          </span>
          <span className="card-rating-pill">⭐ {trip.rating || 4.8}</span>
        </div>
        {trip.is_featured && (
          <span className="card-featured-pill">⭐ Recommended</span>
        )}
      </div>

      <div className="card-body">
        <div className="card-route">
          <span>📍 {trip.origin || trip.source || 'Chennai'}</span>
          <span>➔</span>
          <span>🏝️ {trip.destination}</span>
          <span style={{ marginLeft: 'auto', fontSize: '0.72rem', background: '#f1f5f9', padding: '0.15rem 0.45rem', borderRadius: '4px', color: '#475569' }}>
            {trip.destination_type || 'Domestic'}
          </span>
        </div>

        <h3 className="card-title">
          <Link to={`/packages/${trip.id}`} style={{ color: 'inherit' }}>
            {trip.title}
          </Link>
        </h3>
        <p className="card-description">{trip.description}</p>

        <div className="card-amenities">
          <span className="amenity-chip">🚀 {trip.transport}</span>
          <span className="amenity-chip">⏳ {trip.duration_days} Days / {trip.duration_nights || Math.max(1, trip.duration_days - 1)} Nights</span>
          <span className="amenity-chip">🏨 {trip.hotel_category || '3-Star Deluxe'}</span>
          <span className="amenity-chip" style={{ color: trip.available_seats < 5 ? '#e11d48' : 'inherit' }}>
            💺 {trip.available_seats} Slots Left
          </span>
        </div>

        <div className="card-footer">
          <div className="card-price-block">
            <span className="price-sub">Starting from</span>
            <span className="price-val">{formatINR(trip.amount)}</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>per traveler</span>
          </div>

          <div className="card-actions-row">
            {onToggleCompare && (
              <button
                type="button"
                className="btn-ai-sm"
                onClick={() => onToggleCompare(trip)}
                title="Compare with other packages"
                style={{ background: isCompared ? '#e0f2fe' : '#fff', borderColor: isCompared ? 'var(--secondary)' : 'var(--border-light)' }}
              >
                {isCompared ? '✓ Compared' : '+ Compare'}
              </button>
            )}
            <button
              type="button"
              className="btn-book-sm"
              onClick={() => onBook(trip)}
              disabled={trip.available_seats <= 0}
            >
              {trip.available_seats > 0 ? 'Book Now' : 'Sold Out'}
            </button>
            <button
              type="button"
              className="btn-ai-sm"
              onClick={handleBookWithAI}
              title="Book conversationally via AI Agent"
            >
              🤖 AI Book
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
