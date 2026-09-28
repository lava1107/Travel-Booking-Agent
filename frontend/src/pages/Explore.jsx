import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import { formatINR } from '../utils/currency';

const CATEGORIES = [
  'All',
  'Popular from Tamil Nadu',
  'Domestic',
  'International',
  'Beach',
  'Mountains',
  'Heritage',
  'Honeymoon',
  'Family',
  'Wildlife',
  'Weekend',
  'Budget'
];

const TN_ORIGINS = [
  'All Origins',
  'Chennai',
  'Coimbatore',
  'Madurai',
  'Tiruchirappalli',
  'Salem',
  'Tirunelveli',
  'Puducherry'
];

export default function Explore() {
  const navigate = useNavigate();
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCat, setSelectedCat] = useState('All');
  const [originFilter, setOriginFilter] = useState('All Origins');
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get('/destinations')
      .then(({ data }) => setDestinations(data.data || []))
      .catch((err) => console.error('Failed to load destinations:', err))
      .finally(() => setLoading(false));
  }, []);

  const filtered = destinations.filter((d) => {
    if (search.trim()) {
      const q = search.toLowerCase();
      const match = d.name.toLowerCase().includes(q) ||
                    d.country.toLowerCase().includes(q) ||
                    d.state.toLowerCase().includes(q) ||
                    d.description.toLowerCase().includes(q);
      if (!match) return false;
    }

    if (selectedCat === 'Popular from Tamil Nadu' && !d.popular_from_tamil_nadu) return false;
    if (selectedCat === 'Domestic' && d.type !== 'Domestic') return false;
    if (selectedCat === 'International' && d.type !== 'International') return false;
    if (selectedCat === 'Beach' && !d.activities?.some(a => a.toLowerCase().includes('beach') || a.toLowerCase().includes('water'))) return false;
    if (selectedCat === 'Mountains' && !d.activities?.some(a => a.toLowerCase().includes('hill') || a.toLowerCase().includes('mountain') || a.toLowerCase().includes('tea'))) return false;
    if (selectedCat === 'Budget' && d.starting_price > 20000) return false;

    if (originFilter !== 'All Origins') {
      const hasRoute = d.popular_routes?.some(r => r.toLowerCase().includes(originFilter.toLowerCase()));
      if (!hasRoute) return false;
    }

    return true;
  });

  return (
    <div className="section-wrapper" style={{ paddingTop: '2.5rem', paddingBottom: '4rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--secondary)', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
          Destination Discovery
        </span>
        <h1 style={{ fontSize: '2.4rem', color: 'var(--primary)', marginTop: '0.35rem' }}>
          Explore Destinations From Tamil Nadu
        </h1>
        <p style={{ color: 'var(--text-muted)', maxWidth: '680px', margin: '0.5rem auto 0', fontSize: '1.05rem' }}>
          Find premier domestic escapes and world-class international hubs departing from Chennai, Coimbatore, Madurai, and Trichy.
        </p>
      </div>

      {/* Origin Selector + Search Controls */}
      <div style={{ background: '#fff', padding: '1.25rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)', marginBottom: '2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <label style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-dark)' }}>📍 Travelling from:</label>
          <select
            value={originFilter}
            onChange={(e) => setOriginFilter(e.target.value)}
            style={{ padding: '0.5rem 0.85rem', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--border-light)', fontWeight: '600', color: 'var(--primary)' }}
          >
            {TN_ORIGINS.map((o) => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>
        </div>

        <div style={{ flex: 1, maxWidth: '400px', minWidth: '250px' }}>
          <input
            type="text"
            placeholder="Search by city, country or activity..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: '100%', padding: '0.55rem 0.85rem', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--border-light)', outline: 'none' }}
          />
        </div>
      </div>

      {/* Category Pills Strip */}
      <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '1rem', marginBottom: '2rem' }}>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setSelectedCat(cat)}
            className="btn-secondary"
            style={{
              whiteSpace: 'nowrap',
              padding: '0.45rem 1rem',
              fontSize: '0.85rem',
              borderRadius: 'var(--radius-full)',
              background: selectedCat === cat ? 'var(--primary)' : '#fff',
              color: selectedCat === cat ? '#fff' : 'var(--text-body)',
              borderColor: selectedCat === cat ? 'var(--primary)' : 'var(--border-light)',
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Destinations Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}>Loading destinations…</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 1rem', background: '#fff', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)' }}>
          <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)' }}>No destinations matched your criteria.</p>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => { setSelectedCat('All'); setOriginFilter('All Origins'); setSearch(''); }}
            style={{ marginTop: '1rem' }}
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="dest-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))' }}>
          {filtered.map((d) => (
            <div
              key={d.id}
              className="dest-card"
              onClick={() => {
                const queryOrigin = originFilter !== 'All Origins' ? originFilter : 'Chennai';
                navigate(`/packages?source=${encodeURIComponent(queryOrigin)}&destination=${encodeURIComponent(d.name)}`);
              }}
              style={{ height: '360px' }}
            >
              <img src={d.image_url} alt={d.name} className="dest-img" loading="lazy" />
              <div className="dest-overlay">
                <span className="dest-tag">{d.type} • {d.country}</span>
                <h3 className="dest-name">{d.name}</h3>
                <p style={{ fontSize: '0.84rem', color: '#e0f2fe', margin: '0.25rem 0 0.5rem', lineHeight: '1.4' }}>
                  {d.description}
                </p>
                
                {/* Popular routes from TN */}
                {d.popular_routes && d.popular_routes.length > 0 && (
                  <div style={{ fontSize: '0.76rem', color: '#fed7aa', marginBottom: '0.5rem' }}>
                    🛣️ {d.popular_routes.slice(0, 2).join(' • ')}
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.2)' }}>
                  <span style={{ fontSize: '0.88rem', color: '#fff' }}>
                    From <strong>{formatINR(d.starting_price)}</strong>
                  </span>
                  <span style={{ fontSize: '0.8rem', background: 'var(--accent-coral)', padding: '0.2rem 0.6rem', borderRadius: '4px', fontWeight: '700' }}>
                    View Trips ➔
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
