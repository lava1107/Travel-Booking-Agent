import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../api/client';
import PackageCard from '../components/PackageCard';
import BookingModal from '../components/BookingModal';
import { formatINR } from '../utils/currency';
import fallbackPackages from '../data/packagesFallback.json';
import { useRecent } from '../context/RecentContext';
import { useLanguage } from '../context/LanguageContext';

const TN_CITIES = [
  'All Origins',
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

const CATEGORIES = [
  'All Categories',
  'Budget',
  'Economy',
  'Standard',
  'Premium',
  'Luxury',
];

export default function Packages() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { addRecentPackage, addRecentSearch } = useRecent();
  const { t } = useLanguage();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [comparedIds, setComparedIds] = useState([]);

  // NLP AI Search State
  const [nlpQuery, setNlpQuery] = useState(searchParams.get('nlp') || '');
  const [nlpLoading, setNlpLoading] = useState(false);
  const [nlpInsights, setNlpInsights] = useState(null);

  // Filters State
  const [source, setSource] = useState(searchParams.get('source') || 'All Origins');
  const [destination, setDestination] = useState(searchParams.get('destination') || '');
  const [destinationType, setDestinationType] = useState(searchParams.get('destination_type') || 'All');
  const [category, setCategory] = useState(searchParams.get('category') || 'All Categories');
  const [transport, setTransport] = useState(searchParams.get('transport') || 'All');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '200000');
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'featured');

  const fetchTrips = async () => {
    setLoading(true);
    try {
      const params = {};
      if (source !== 'All Origins') params.source = source;
      if (destination.trim()) params.destination = destination.trim();
      if (destinationType !== 'All') params.destination_type = destinationType;
      if (category !== 'All Categories') params.category = category;
      if (transport !== 'All') params.transport = transport;
      if (maxPrice && Number(maxPrice) < 200000) params.maxPrice = maxPrice;
      if (sortBy) params.sortBy = sortBy;

      const { data } = await api.get('/trips', { params });
      if (data && Array.isArray(data.data) && data.data.length > 0) {
        setTrips(data.data);
      } else {
        // If server returned 0 due to narrow filter or warm-up, apply on fallback
        applyLocalFallback();
      }
    } catch (err) {
      console.warn('Trips API network error, applying local verified catalog fallback:', err);
      applyLocalFallback();
    } finally {
      setLoading(false);
    }
  };

  const applyLocalFallback = () => {
    let filtered = [...fallbackPackages];
    if (source !== 'All Origins') {
      const sLow = source.toLowerCase();
      filtered = filtered.filter(p => p.source?.toLowerCase().includes(sLow) || p.origin?.toLowerCase().includes(sLow));
    }
    if (destination.trim()) {
      const dLow = destination.trim().toLowerCase();
      filtered = filtered.filter(p => p.destination?.toLowerCase().includes(dLow) || p.title?.toLowerCase().includes(dLow));
    }
    if (destinationType !== 'All') {
      filtered = filtered.filter(p => p.destination_type?.toLowerCase() === destinationType.toLowerCase());
    }
    if (category !== 'All Categories') {
      filtered = filtered.filter(p => p.category?.toLowerCase() === category.toLowerCase());
    }
    if (transport !== 'All') {
      filtered = filtered.filter(p => p.transport?.toLowerCase().includes(transport.toLowerCase()));
    }
    if (maxPrice && Number(maxPrice) < 200000) {
      filtered = filtered.filter(p => p.amount <= Number(maxPrice));
    }
    if (sortBy === 'price_asc') filtered.sort((a, b) => a.amount - b.amount);
    else if (sortBy === 'price_desc') filtered.sort((a, b) => b.amount - a.amount);
    else if (sortBy === 'rating') filtered.sort((a, b) => b.rating - a.rating);
    else if (sortBy === 'duration') filtered.sort((a, b) => a.duration_days - b.duration_days);
    
    setTrips(filtered);
  };

  const runNlpSearch = async (queryString) => {
    const q = (queryString !== undefined ? queryString : nlpQuery).trim();
    if (!q) return;
    addRecentSearch(q);
    setNlpLoading(true);
    setLoading(true);
    try {
      const { data } = await api.post('/nlp/search', { query: q });
      setTrips(data.data || []);
      setNlpInsights({
        query: data.query,
        intent: data.intent,
        confidence: data.confidence,
        entities: data.entities || {},
        totalMatches: data.total_matches,
      });
    } catch (err) {
      console.error('NLP search failed:', err);
    } finally {
      setNlpLoading(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    const initialNlp = searchParams.get('nlp');
    if (initialNlp) {
      setNlpQuery(initialNlp);
      runNlpSearch(initialNlp);
    } else {
      fetchTrips();
    }
  }, [searchParams]);

  const handleApplyFilters = (e) => {
    e.preventDefault();
    setNlpInsights(null);
    const params = {};
    if (source !== 'All Origins') params.source = source;
    if (destination.trim()) params.destination = destination.trim();
    if (destinationType !== 'All') params.destination_type = destinationType;
    if (category !== 'All Categories') params.category = category;
    if (transport !== 'All') params.transport = transport;
    if (Number(maxPrice) < 200000) params.maxPrice = maxPrice;
    if (sortBy !== 'featured') params.sortBy = sortBy;
    setSearchParams(params);
  };

  const handleReset = () => {
    setSource('All Origins');
    setDestination('');
    setDestinationType('All');
    setCategory('All Categories');
    setTransport('All');
    setMaxPrice('200000');
    setSortBy('featured');
    setNlpQuery('');
    setNlpInsights(null);
    setSearchParams({});
  };

  const toggleCompare = (trip) => {
    if (comparedIds.includes(trip.id)) {
      setComparedIds(comparedIds.filter(id => id !== trip.id));
    } else {
      if (comparedIds.length >= 3) {
        alert('You can compare a maximum of 3 packages at once.');
        return;
      }
      setComparedIds([...comparedIds, trip.id]);
    }
  };

  return (
    <div className="section-wrapper" style={{ paddingTop: '2.5rem', paddingBottom: '4rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.4rem', color: 'var(--primary)' }}>
          Travel Package Catalogue
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', marginTop: '0.25rem' }}>
          Explore verified tour packages departing from Tamil Nadu across Budget, Economy, Standard, Premium, and Luxury categories.
        </p>
      </div>

      {/* NLP Natural Language Search Engine */}
      <div style={{ background: '#fff', borderRadius: 'var(--radius-xl)', padding: '1.5rem', border: '1.5px solid var(--secondary-light)', boxShadow: 'var(--shadow-sm)', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
          <span style={{ fontSize: '1.25rem' }}>🧠</span>
          <span style={{ fontWeight: '800', color: 'var(--primary)', fontSize: '1rem' }}>
            AI Natural Language Search Engine
          </span>
          <span style={{ fontSize: '0.72rem', background: 'var(--primary-light)', color: 'var(--primary)', padding: '0.15rem 0.5rem', borderRadius: '4px', fontWeight: '700' }}>
            SpaCy NER + TF-IDF Classifier
          </span>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            runNlpSearch();
          }}
          style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}
        >
          <input
            type="text"
            placeholder="Ask anything in English: e.g. 'Affordable trip from Chennai to Goa for 2 people under 30000'..."
            value={nlpQuery}
            onChange={(e) => setNlpQuery(e.target.value)}
            style={{ flex: 1, minWidth: '280px', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--border-light)', outline: 'none' }}
          />
          <button type="submit" className="btn-primary" disabled={nlpLoading} style={{ padding: '0.75rem 1.5rem' }}>
            {nlpLoading ? 'Analyzing Query…' : '⚡ Search with AI'}
          </button>
        </form>

        {nlpInsights && (
          <div style={{ marginTop: '1rem', background: 'var(--bg-subtle)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', padding: '0.85rem 1.1rem', fontSize: '0.85rem', display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
            <div><strong>Intent:</strong> <span style={{ color: 'var(--primary)' }}>{nlpInsights.intent}</span> ({Math.round(nlpInsights.confidence * 100)}% match)</div>
            {nlpInsights.entities.origin && <div><strong>Origin:</strong> {nlpInsights.entities.origin}</div>}
            {nlpInsights.entities.destination && <div><strong>Destination:</strong> {nlpInsights.entities.destination}</div>}
            {nlpInsights.entities.budget && <div><strong>Budget:</strong> ₹{nlpInsights.entities.budget.toLocaleString('en-IN')}</div>}
            {nlpInsights.entities.passengers && <div><strong>Travelers:</strong> {nlpInsights.entities.passengers}</div>}
            <div><strong>Matches Found:</strong> {nlpInsights.totalMatches} package(s)</div>
          </div>
        )}
      </div>

      {/* Main Layout: Filters Sidebar + Results Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '2rem', alignItems: 'flex-start' }}>
        {/* Left Filter Form */}
        <div style={{ background: '#fff', borderRadius: 'var(--radius-xl)', padding: '1.75rem', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.15rem', color: 'var(--primary)' }}>Filter & Sort</h3>
            <button
              type="button"
              onClick={handleReset}
              style={{ background: 'transparent', border: 'none', color: 'var(--secondary)', fontSize: '0.82rem', fontWeight: '700', cursor: 'pointer' }}
            >
              Reset All
            </button>
          </div>

          <form onSubmit={handleApplyFilters} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
            <div className="form-group">
              <label>🛫 Departure (Tamil Nadu)</label>
              <select value={source} onChange={(e) => setSource(e.target.value)}>
                {TN_CITIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>🏝️ Destination</label>
              <input
                type="text"
                placeholder="Destination name..."
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>🌐 Scope</label>
              <select value={destinationType} onChange={(e) => setDestinationType(e.target.value)}>
                <option value="All">All (Domestic & Intl)</option>
                <option value="Domestic">Domestic India</option>
                <option value="International">International</option>
              </select>
            </div>

            <div className="form-group">
              <label>🏷️ Package Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)}>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>🚀 Transport Mode</label>
              <select value={transport} onChange={(e) => setTransport(e.target.value)}>
                <option value="All">Any Transport</option>
                <option value="Flight">Flight Packages</option>
                <option value="Train">Express / Vande Bharat Train</option>
                <option value="Cab">Private AC Cab</option>
                <option value="Bus">Luxury Sleeper Coach</option>
              </select>
            </div>

            <div className="form-group">
              <label>💰 Max Budget: {formatINR(maxPrice)}</label>
              <input
                type="range"
                min="10000"
                max="200000"
                step="5000"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>↕️ Sort By</label>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="featured">Featured / Recommended</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="rating">Highest Customer Rating</option>
                <option value="duration">Duration (Days)</option>
              </select>
            </div>

            <button type="submit" className="btn-primary" style={{ justifyContent: 'center', marginTop: '0.5rem' }}>
              Apply Filters
            </button>
          </form>
        </div>

        {/* Right Packages Grid */}
        <div style={{ gridColumn: 'span 2' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <span style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--text-muted)' }}>
              Showing <strong>{trips.length}</strong> matching packages
            </span>
          </div>

          {loading ? (
            <p>Loading available travel packages…</p>
          ) : trips.length === 0 ? (
            <div style={{ background: '#fff', borderRadius: 'var(--radius-xl)', padding: '3.5rem 1.5rem', textAlign: 'center', border: '1px solid var(--border-light)' }}>
              <h3>No matching packages found</h3>
              <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                Try adjusting your budget filter or origin city to find more options.
              </p>
              <button type="button" className="btn-secondary" onClick={handleReset} style={{ marginTop: '1rem' }}>
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="packages-grid">
              {trips.map((trip) => (
                <PackageCard
                  key={trip.id}
                  trip={trip}
                  onBook={(t) => {
                    addRecentPackage(t);
                    setSelectedTrip(t);
                  }}
                  onBookAI={(t) => {
                    addRecentPackage(t);
                    window.dispatchEvent(new CustomEvent('lyan_book_ai', { detail: { trip: t } }));
                  }}
                  onToggleCompare={toggleCompare}
                  isCompared={comparedIds.includes(trip.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Floating Compare Tray if packages are selected */}
      {comparedIds.length > 0 && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(15, 23, 42, 0.95)',
            color: '#fff',
            padding: '0.85rem 1.75rem',
            borderRadius: 'var(--radius-full)',
            boxShadow: '0 12px 36px rgba(0,0,0,0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '1.25rem',
            zIndex: 1400,
            backdropFilter: 'blur(8px)'
          }}
        >
          <span style={{ fontSize: '0.9rem', fontWeight: '700' }}>
            {comparedIds.length} Package(s) Selected for Comparison
          </span>
          <button
            type="button"
            className="btn-coral"
            onClick={() => navigate(`/compare?ids=${comparedIds.join(',')}`)}
            style={{ padding: '0.45rem 1.1rem', fontSize: '0.85rem' }}
          >
            Compare Now ➔
          </button>
          <button
            type="button"
            onClick={() => setComparedIds([])}
            style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '0.82rem' }}
          >
            Clear
          </button>
        </div>
      )}

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
