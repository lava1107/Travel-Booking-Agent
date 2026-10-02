import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import api from '../api/client';
import BookingModal from '../components/BookingModal';
import { formatINR } from '../utils/currency';
import fallbackPackages from '../data/packagesFallback.json';

// Popular preset comparisons
const PRESETS = [
  {
    label: '🏖️ Goa vs Kerala',
    match: (list) => {
      const p1 = list.find((p) => p.destination?.toLowerCase().includes('goa'));
      const p2 = list.find((p) => p.destination?.toLowerCase().includes('kerala') || p.destination?.toLowerCase().includes('munnar'));
      return p1 && p2 ? [p1.id, p2.id] : [];
    }
  },
  {
    label: '⛰️ Ooty vs Kodaikanal',
    match: (list) => {
      const p1 = list.find((p) => p.destination?.toLowerCase().includes('ooty'));
      const p2 = list.find((p) => p.destination?.toLowerCase().includes('kodaikanal'));
      return p1 && p2 ? [p1.id, p2.id] : [];
    }
  },
  {
    label: '✈️ Singapore vs Dubai',
    match: (list) => {
      const p1 = list.find((p) => p.destination?.toLowerCase().includes('singapore'));
      const p2 = list.find((p) => p.destination?.toLowerCase().includes('dubai'));
      return p1 && p2 ? [p1.id, p2.id] : [];
    }
  },
  {
    label: '🏔️ Kashmir vs Rajasthan',
    match: (list) => {
      const p1 = list.find((p) => p.destination?.toLowerCase().includes('kashmir') || p.destination?.toLowerCase().includes('srinagar'));
      const p2 = list.find((p) => p.destination?.toLowerCase().includes('rajasthan') || p.destination?.toLowerCase().includes('jaipur'));
      return p1 && p2 ? [p1.id, p2.id] : [];
    }
  }
];

export default function ComparePackages() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Mode: 'tiers' (Route Tier Comparison: Budget vs Premium vs Luxury) or 'catalog'
  const [compareMode, setCompareMode] = useState('tiers');

  // Route Tier Parameters
  const [tierOrigin, setTierOrigin] = useState('Madurai');
  const [tierDest, setTierDest] = useState('Goa');

  // Catalog comparison state
  const [allPackages, setAllPackages] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [filterSearch, setFilterSearch] = useState('');

  // Pre-configured route tier data (Madurai to Goa default)
  const tierPackages = useMemo(() => {
    return {
      budget: {
        id: 991,
        title: `${tierOrigin} to ${tierDest} Explorer (Budget Tier)`,
        origin: tierOrigin,
        source: tierOrigin,
        destination: `${tierDest}, India`,
        category: 'Budget',
        amount: 7999,
        price: 7999,
        duration_days: 4,
        transport: 'AC Sleeper Coach / Express Train',
        hotel_category: 'Backpacker Hostel (AC Dorm) / 2-Star Inn',
        meals: 'Complimentary Daily Breakfast & Tea',
        sightseeing: 'Self-Paced Beach & Landmark Pass, Digital Guide Map',
        inclusions: [
          'AC Sleeper Coach from ' + tierOrigin,
          '4 Days / 3 Nights Dorm or Cozy Bed',
          'Daily Breakfast included',
          'Self-guided beach hopping pass',
          '24/7 AI travel concierge support'
        ],
        exclusions: ['Water sports tickets', 'Personal expenses', 'Private cab'],
        free_cancellation: 'Free cancellation up to 24 hours before travel',
        cancellation_policy: 'Free cancellation up to 24 hours before departure date.',
        guide: 'Digital AI Voice Concierge & Map Kit',
        luggage: '15 kg cabin / sleeper baggage',
        rating: 4.8,
        description: 'Perfect for solo travelers, students, and budget backpackers seeking the best value without compromising safety or hygiene.'
      },
      premium: {
        id: 992,
        title: `${tierOrigin} to ${tierDest} Deluxe Holiday (Premium Tier)`,
        origin: tierOrigin,
        source: tierOrigin,
        destination: `${tierDest}, India`,
        category: 'Premium',
        amount: 19499,
        price: 19499,
        duration_days: 5,
        transport: 'Direct Flight (or 3AC Train) + Private AC Sedan Cab',
        hotel_category: '3-Star Beach Resort / Valley Hotel with Swimming Pool',
        meals: 'Daily Buffet Breakfast & 3-Course Dinner',
        sightseeing: 'Dedicated Private AC Sedan with Chauffeur throughout trip',
        inclusions: [
          'Transit from ' + tierOrigin + ' (Flight/3AC + Private AC Cab)',
          '5 Days / 4 Nights Deluxe Resort with Pool',
          'Buffet Breakfast & Dinner included',
          'Mandovi River Sunset Cruise with DJ & folk dance',
          'North & South sightseeing with private driver',
          '24/7 Dedicated Agent Helpline'
        ],
        exclusions: ['Personal alcoholic beverages', 'Optional scuba diving'],
        free_cancellation: 'Free cancellation up to 48 hours before travel',
        cancellation_policy: 'Free cancellation up to 48 hours before departure date.',
        guide: 'Dedicated Tour Coordinator & 24/7 Agent Support',
        luggage: '15 kg check-in + 7 kg cabin baggage',
        rating: 4.9,
        description: 'Our most popular tier. Designed for couples and families desiring seamless comfort, private transportation, and high-quality resort stays.'
      },
      luxury: {
        id: 993,
        title: `${tierOrigin} to ${tierDest} Royal Retreat (Luxury 5-Star VIP Tier)`,
        origin: tierOrigin,
        source: tierOrigin,
        destination: `${tierDest}, India`,
        category: 'Luxury',
        amount: 48999,
        price: 48999,
        duration_days: 6,
        transport: 'Direct Premium Flight + Luxury AC SUV (Innova Crysta / BMW) Chauffeur',
        hotel_category: '5-Star Luxury Beachfront Villa (Taj / Marriott / W Goa) with Private Pool',
        meals: 'All Gourmet Meals Included (Breakfast, Chef Lunch & Candlelight Beach Dinner)',
        sightseeing: 'Private Luxury Chauffeur at disposal 24/7, VIP Airport lounge access',
        inclusions: [
          'Direct Premium Flights from ' + tierOrigin,
          '6 Days / 5 Nights in 5-Star Beach Villa with Private Plunge Pool',
          'All Gourmet Meals (Breakfast, Lunch & Candlelight Beach Dinner)',
          'Private Luxury Yacht Sunset Charter with Champagne',
          'PADI Certified Scuba Diving at Grande Island',
          'VIP Casino Entry & Gourmet Dinner',
          'Personal 1-on-1 VIP Concierge'
        ],
        exclusions: ['None. All-inclusive luxury experience.'],
        free_cancellation: '100% Full Refund anytime up to 72 hours before travel',
        cancellation_policy: 'Full 100% refund anytime up to 72 hours before departure date.',
        guide: 'Personal 1-on-1 VIP Concierge & Private Licensed Historian Guide',
        luggage: '30 kg check-in + 10 kg cabin baggage',
        rating: 5.0,
        description: 'The pinnacle of luxury travel. Indulge in 5-star beachfront villas, private yacht cruises, champagne sunsets, and bespoke VIP concierge treatment.'
      }
    };
  }, [tierOrigin, tierDest]);

  // Load packages with fallback
  useEffect(() => {
    let isMounted = true;

    const loadPackages = async () => {
      setLoading(true);
      let list = [];

      try {
        const { data } = await api.get('/trips');
        if (data?.data && Array.isArray(data.data) && data.data.length > 0) {
          list = data.data;
        } else {
          list = fallbackPackages;
        }
      } catch (err) {
        console.warn('Backend unavailable, using bundled package catalog fallback:', err);
        list = fallbackPackages;
      }

      if (!isMounted) return;
      setAllPackages(list);

      const idsParam = searchParams.get('ids');
      let initialIds = [];

      if (idsParam) {
        const requestedIds = idsParam.split(',').map(Number).filter(Boolean);
        const validIds = requestedIds.filter((id) => list.some((p) => p.id === id));
        if (validIds.length > 0) {
          initialIds = validIds.slice(0, 3);
          setCompareMode('catalog');
        }
      }

      if (initialIds.length < 2 && list.length >= 2) {
        const goa = list.find((p) => p.destination?.toLowerCase().includes('goa'));
        const kerala = list.find((p) => p.destination?.toLowerCase().includes('kerala') || p.destination?.toLowerCase().includes('munnar'));
        if (goa && kerala && goa.id !== kerala.id) {
          initialIds = [goa.id, kerala.id];
        } else {
          initialIds = [list[0].id, list[1].id];
        }
      }

      setSelectedIds(initialIds);
      setLoading(false);
    };

    loadPackages();

    return () => {
      isMounted = false;
    };
  }, [searchParams]);

  const updateSelectedIds = (newIds) => {
    setSelectedIds(newIds);
    if (newIds.length > 0) {
      setSearchParams({ ids: newIds.join(',') }, { replace: true });
    } else {
      setSearchParams({}, { replace: true });
    }
  };

  const activeCompareList = useMemo(() => {
    return allPackages.filter((p) => selectedIds.includes(p.id));
  }, [allPackages, selectedIds]);

  const handleAddId = (id) => {
    const numId = Number(id);
    if (numId && !selectedIds.includes(numId) && selectedIds.length < 3) {
      updateSelectedIds([...selectedIds, numId]);
      setFilterSearch('');
    }
  };

  const handleRemoveId = (id) => {
    updateSelectedIds(selectedIds.filter((item) => item !== id));
  };

  const handleSelectPreset = (preset) => {
    setCompareMode('catalog');
    const ids = preset.match(allPackages);
    if (ids.length >= 2) {
      updateSelectedIds(ids);
    }
  };

  const availableToAdd = useMemo(() => {
    return allPackages.filter((p) => {
      if (selectedIds.includes(p.id)) return false;
      if (!filterSearch.trim()) return true;
      const q = filterSearch.toLowerCase();
      return (
        p.title?.toLowerCase().includes(q) ||
        p.destination?.toLowerCase().includes(q) ||
        p.origin?.toLowerCase().includes(q) ||
        p.source?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q)
      );
    });
  }, [allPackages, selectedIds, filterSearch]);

  const originOptions = ['Madurai', 'Chennai', 'Coimbatore', 'Trichy', 'Salem', 'Bangalore'];
  const destOptions = ['Goa', 'Kerala', 'Ooty', 'Kodaikanal', 'Kashmir', 'Jaipur', 'Dubai', 'Singapore'];

  return (
    <div className="section-wrapper" style={{ paddingTop: '2.5rem', paddingBottom: '4rem' }}>
      {/* Title Header */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <span
          style={{
            fontSize: '0.85rem',
            fontWeight: '700',
            color: 'var(--secondary)',
            textTransform: 'uppercase',
            letterSpacing: '0.6px',
            background: 'rgba(235, 94, 40, 0.08)',
            padding: '0.35rem 0.85rem',
            borderRadius: 'var(--radius-full)'
          }}
        >
          ⚖️ Comparative Intelligence &amp; Tier Analysis
        </span>
        <h1 style={{ fontSize: '2.4rem', color: 'var(--primary)', marginTop: '0.6rem' }}>
          Compare Travel Tiers &amp; Packages
        </h1>
        <p style={{ color: 'var(--text-muted)', maxWidth: '680px', margin: '0.5rem auto 0', fontSize: '1.05rem' }}>
          Evaluate Budget vs Premium vs Luxury tiers for any route, inspect side-by-side amenities, and book directly.
        </p>
      </div>

      {/* Main Mode Toggle Switch */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
        <button
          type="button"
          onClick={() => setCompareMode('tiers')}
          style={{
            padding: '0.75rem 1.5rem',
            borderRadius: 'var(--radius-full)',
            border: '2px solid var(--primary)',
            background: compareMode === 'tiers' ? 'var(--primary)' : '#ffffff',
            color: compareMode === 'tiers' ? '#ffffff' : 'var(--primary)',
            fontWeight: '800',
            fontSize: '0.95rem',
            cursor: 'pointer',
            transition: 'all 0.2s',
            boxShadow: compareMode === 'tiers' ? 'var(--shadow-md)' : 'none'
          }}
        >
          ⚡ Route Tier Comparison (Budget vs Premium vs Luxury)
        </button>
        <button
          type="button"
          onClick={() => setCompareMode('catalog')}
          style={{
            padding: '0.75rem 1.5rem',
            borderRadius: 'var(--radius-full)',
            border: '2px solid var(--primary)',
            background: compareMode === 'catalog' ? 'var(--primary)' : '#ffffff',
            color: compareMode === 'catalog' ? '#ffffff' : 'var(--primary)',
            fontWeight: '800',
            fontSize: '0.95rem',
            cursor: 'pointer',
            transition: 'all 0.2s',
            boxShadow: compareMode === 'catalog' ? 'var(--shadow-md)' : 'none'
          }}
        >
          📦 Custom Package Comparison
        </button>
      </div>

      {/* ========================================================================= */}
      {/* MODE 1: ROUTE TIER COMPARISON (Madurai to Goa Budget vs Premium vs Luxury) */}
      {/* ========================================================================= */}
      {compareMode === 'tiers' && (
        <div>
          {/* Route Configuration Bar */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: 'var(--radius-xl)',
              border: '1.5px solid var(--border-light)',
              padding: '1.5rem',
              boxShadow: 'var(--shadow-sm)',
              marginBottom: '2rem'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', color: 'var(--primary)' }}>
                  📍 Route Selection: {tierOrigin} ➔ {tierDest}
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
                  Comparing Budget, Premium, and Luxury packages departing from {tierOrigin}.
                </p>
              </div>

              {/* Quick Presets */}
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {[
                  { origin: 'Madurai', dest: 'Goa', label: '🌴 Madurai ➔ Goa (Featured)' },
                  { origin: 'Chennai', dest: 'Goa', label: '🏖️ Chennai ➔ Goa' },
                  { origin: 'Coimbatore', dest: 'Kerala', label: '⛰️ Coimbatore ➔ Kerala' },
                  { origin: 'Madurai', dest: 'Ooty', label: '☕ Madurai ➔ Ooty' }
                ].map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setTierOrigin(p.origin);
                      setTierDest(p.dest);
                    }}
                    style={{
                      background: tierOrigin === p.origin && tierDest === p.dest ? 'var(--primary-light)' : '#f8fafc',
                      color: tierOrigin === p.origin && tierDest === p.dest ? 'var(--primary)' : '#475569',
                      border: '1px solid #cbd5e1',
                      borderRadius: 'var(--radius-full)',
                      padding: '0.35rem 0.85rem',
                      fontSize: '0.82rem',
                      fontWeight: '700',
                      cursor: 'pointer'
                    }}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Select Origin & Destination */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
              <div className="form-group">
                <label style={{ fontSize: '0.85rem', fontWeight: '700' }}>🛫 Departure Origin (From)</label>
                <select
                  value={tierOrigin}
                  onChange={(e) => setTierOrigin(e.target.value)}
                  style={{ width: '100%', padding: '0.65rem 0.9rem', borderRadius: '8px', border: '1.5px solid var(--border-light)', fontSize: '0.92rem', fontWeight: '600' }}
                >
                  {originOptions.map((o) => (
                    <option key={o} value={o}>{o} (Tamil Nadu / South Hub)</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label style={{ fontSize: '0.85rem', fontWeight: '700' }}>🛬 Destination (To)</label>
                <select
                  value={tierDest}
                  onChange={(e) => setTierDest(e.target.value)}
                  style={{ width: '100%', padding: '0.65rem 0.9rem', borderRadius: '8px', border: '1.5px solid var(--border-light)', fontSize: '0.92rem', fontWeight: '600' }}
                >
                  {destOptions.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* 3 Side-by-Side Tier Comparison Cards */}
          <div className="tier-comparison-grid">
            {/* 1. BUDGET TIER */}
            <div className="tier-card tier-budget">
              <div>
                <span className="tier-badge">🟢 Budget Explorer</span>
                <h3 style={{ fontSize: '1.35rem', color: '#0f766e', marginBottom: '0.25rem' }}>
                  {tierPackages.budget.tier} Tier
                </h3>
                <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                  {tierPackages.budget.description}
                </p>

                <div className="tier-price" style={{ color: '#0f766e' }}>
                  {formatINR(tierPackages.budget.price)}
                  <span style={{ fontSize: '0.8rem', fontWeight: '500', color: 'var(--text-muted)' }}> / person</span>
                </div>

                <div style={{ background: '#f0fdf4', padding: '0.65rem', borderRadius: '8px', fontSize: '0.8rem', color: '#166534', fontWeight: '700', marginBottom: '1rem' }}>
                  ⏳ {tierPackages.budget.duration_days} Days / 3 Nights • ⭐ {tierPackages.budget.rating}/5
                </div>

                <ul className="tier-features-list">
                  <li className="tier-feature-item">
                    <span className="check">✓</span>
                    <span><strong>Transport:</strong> {tierPackages.budget.transport}</span>
                  </li>
                  <li className="tier-feature-item">
                    <span className="check">✓</span>
                    <span><strong>Stay:</strong> {tierPackages.budget.hotel_category}</span>
                  </li>
                  <li className="tier-feature-item">
                    <span className="check">✓</span>
                    <span><strong>Meals:</strong> {tierPackages.budget.meals}</span>
                  </li>
                  <li className="tier-feature-item">
                    <span className="check">✓</span>
                    <span><strong>Sightseeing:</strong> {tierPackages.budget.sightseeing}</span>
                  </li>
                  <li className="tier-feature-item">
                    <span className="check">✓</span>
                    <span><strong>Luggage:</strong> {tierPackages.budget.luggage}</span>
                  </li>
                  <li className="tier-feature-item">
                    <span className="check">✓</span>
                    <span><strong>Cancellation:</strong> {tierPackages.budget.free_cancellation}</span>
                  </li>
                </ul>
              </div>

              <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-light)' }}>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => setSelectedTrip(tierPackages.budget)}
                  style={{ width: '100%', justifyContent: 'center', background: '#0d9488', padding: '0.8rem' }}
                >
                  ⚡ Book Budget Tier ➔
                </button>
              </div>
            </div>

            {/* 2. PREMIUM TIER */}
            <div className="tier-card tier-premium">
              <div style={{ position: 'absolute', top: '-14px', left: '50%', transform: 'translateX(-50%)', background: 'var(--primary)', color: '#fff', padding: '0.2rem 1rem', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: '800', letterSpacing: '0.5px' }}>
                ⭐ MOST POPULAR CHOICE
              </div>

              <div>
                <span className="tier-badge">🔵 Deluxe Comfort</span>
                <h3 style={{ fontSize: '1.35rem', color: 'var(--primary)', marginBottom: '0.25rem' }}>
                  {tierPackages.premium.tier} Tier
                </h3>
                <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                  {tierPackages.premium.description}
                </p>

                <div className="tier-price" style={{ color: 'var(--primary)' }}>
                  {formatINR(tierPackages.premium.price)}
                  <span style={{ fontSize: '0.8rem', fontWeight: '500', color: 'var(--text-muted)' }}> / person</span>
                </div>

                <div style={{ background: 'var(--primary-light)', padding: '0.65rem', borderRadius: '8px', fontSize: '0.8rem', color: 'var(--primary)', fontWeight: '700', marginBottom: '1rem' }}>
                  ⏳ {tierPackages.premium.duration_days} Days / 4 Nights • ⭐ {tierPackages.premium.rating}/5
                </div>

                <ul className="tier-features-list">
                  <li className="tier-feature-item">
                    <span className="check">✓</span>
                    <span><strong>Transport:</strong> {tierPackages.premium.transport}</span>
                  </li>
                  <li className="tier-feature-item">
                    <span className="check">✓</span>
                    <span><strong>Stay:</strong> {tierPackages.premium.hotel_category}</span>
                  </li>
                  <li className="tier-feature-item">
                    <span className="check">✓</span>
                    <span><strong>Meals:</strong> {tierPackages.premium.meals}</span>
                  </li>
                  <li className="tier-feature-item">
                    <span className="check">✓</span>
                    <span><strong>Sightseeing:</strong> {tierPackages.premium.sightseeing}</span>
                  </li>
                  <li className="tier-feature-item">
                    <span className="check">✓</span>
                    <span><strong>Luggage:</strong> {tierPackages.premium.luggage}</span>
                  </li>
                  <li className="tier-feature-item">
                    <span className="check">✓</span>
                    <span><strong>Cancellation:</strong> {tierPackages.premium.free_cancellation}</span>
                  </li>
                </ul>
              </div>

              <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-light)' }}>
                <button
                  type="button"
                  className="btn-coral"
                  onClick={() => setSelectedTrip(tierPackages.premium)}
                  style={{ width: '100%', justifyContent: 'center', padding: '0.8rem', fontSize: '0.95rem' }}
                >
                  ⚡ Book Premium Tier ➔
                </button>
              </div>
            </div>

            {/* 3. LUXURY TIER */}
            <div className="tier-card tier-luxury">
              <div>
                <span className="tier-badge">🟡 5-Star VIP Luxury</span>
                <h3 style={{ fontSize: '1.35rem', color: '#92400e', marginBottom: '0.25rem' }}>
                  {tierPackages.luxury.tier} Tier
                </h3>
                <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                  {tierPackages.luxury.description}
                </p>

                <div className="tier-price" style={{ color: '#92400e' }}>
                  {formatINR(tierPackages.luxury.price)}
                  <span style={{ fontSize: '0.8rem', fontWeight: '500', color: 'var(--text-muted)' }}> / person</span>
                </div>

                <div style={{ background: '#fef3c7', padding: '0.65rem', borderRadius: '8px', fontSize: '0.8rem', color: '#92400e', fontWeight: '700', marginBottom: '1rem' }}>
                  ⏳ {tierPackages.luxury.duration_days} Days / 5 Nights • ⭐ {tierPackages.luxury.rating}/5
                </div>

                <ul className="tier-features-list">
                  <li className="tier-feature-item">
                    <span className="check">✓</span>
                    <span><strong>Transport:</strong> {tierPackages.luxury.transport}</span>
                  </li>
                  <li className="tier-feature-item">
                    <span className="check">✓</span>
                    <span><strong>Stay:</strong> {tierPackages.luxury.hotel_category}</span>
                  </li>
                  <li className="tier-feature-item">
                    <span className="check">✓</span>
                    <span><strong>Meals:</strong> {tierPackages.luxury.meals}</span>
                  </li>
                  <li className="tier-feature-item">
                    <span className="check">✓</span>
                    <span><strong>Sightseeing:</strong> {tierPackages.luxury.sightseeing}</span>
                  </li>
                  <li className="tier-feature-item">
                    <span className="check">✓</span>
                    <span><strong>Luggage:</strong> {tierPackages.luxury.luggage}</span>
                  </li>
                  <li className="tier-feature-item">
                    <span className="check">✓</span>
                    <span><strong>Cancellation:</strong> {tierPackages.luxury.free_cancellation}</span>
                  </li>
                </ul>
              </div>

              <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-light)' }}>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => setSelectedTrip(tierPackages.luxury)}
                  style={{ width: '100%', justifyContent: 'center', background: '#d97706', padding: '0.8rem' }}
                >
                  ⚡ Book Luxury Tier ➔
                </button>
              </div>
            </div>
          </div>

          {/* Deep Feature Comparison Matrix Table */}
          <div style={{ marginTop: '3rem', background: '#fff', borderRadius: 'var(--radius-xl)', border: '1.5px solid var(--border-light)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ padding: '1.25rem 1.5rem', background: 'var(--bg-subtle)', borderBottom: '1px solid var(--border-light)' }}>
              <h3 style={{ fontSize: '1.15rem', color: 'var(--primary)' }}>
                Detailed Feature Matrix: {tierOrigin} ➔ {tierDest}
              </h3>
            </div>
            <table className="custom-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8fafc' }}>
                  <th style={{ padding: '1rem', textAlign: 'left', width: '22%' }}>Feature</th>
                  <th style={{ padding: '1rem', textAlign: 'left', width: '26%', color: '#0d9488' }}>Budget Tier</th>
                  <th style={{ padding: '1rem', textAlign: 'left', width: '26%', color: 'var(--primary)' }}>Premium Tier</th>
                  <th style={{ padding: '1rem', textAlign: 'left', width: '26%', color: '#d97706' }}>Luxury Tier</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ padding: '1rem', fontWeight: '700' }}>Price per Person</td>
                  <td style={{ padding: '1rem', fontWeight: '800', color: '#0d9488' }}>{formatINR(tierPackages.budget.price)}</td>
                  <td style={{ padding: '1rem', fontWeight: '800', color: 'var(--primary)' }}>{formatINR(tierPackages.premium.price)}</td>
                  <td style={{ padding: '1rem', fontWeight: '800', color: '#d97706' }}>{formatINR(tierPackages.luxury.price)}</td>
                </tr>
                <tr style={{ background: '#f8fafc' }}>
                  <td style={{ padding: '1rem', fontWeight: '700' }}>Transport Mode</td>
                  <td style={{ padding: '1rem' }}>AC Sleeper Coach / Express Train</td>
                  <td style={{ padding: '1rem' }}>Economy Flight / 3AC Superfast Train</td>
                  <td style={{ padding: '1rem' }}>Direct Premium Flight + Luxury AC SUV</td>
                </tr>
                <tr>
                  <td style={{ padding: '1rem', fontWeight: '700' }}>Accommodation</td>
                  <td style={{ padding: '1rem' }}>Backpacker Hostel (AC Dorm) / 2-Star</td>
                  <td style={{ padding: '1rem' }}>3-Star Resort with Pool</td>
                  <td style={{ padding: '1rem' }}>5-Star Beach Villa with Private Pool</td>
                </tr>
                <tr style={{ background: '#f8fafc' }}>
                  <td style={{ padding: '1rem', fontWeight: '700' }}>Meal Plan</td>
                  <td style={{ padding: '1rem' }}>Breakfast &amp; Tea</td>
                  <td style={{ padding: '1rem' }}>Buffet Breakfast &amp; 3-Course Dinner</td>
                  <td style={{ padding: '1rem' }}>All Meals Gourmet Dining + Candlelight</td>
                </tr>
                <tr>
                  <td style={{ padding: '1rem', fontWeight: '700' }}>Exclusive Activities</td>
                  <td style={{ padding: '1rem' }}>Self-paced beach walking pass</td>
                  <td style={{ padding: '1rem' }}>Mandovi River Cruise with DJ</td>
                  <td style={{ padding: '1rem' }}>Private Yacht Charter + Scuba Diving</td>
                </tr>
                <tr style={{ background: '#f8fafc' }}>
                  <td style={{ padding: '1rem', fontWeight: '700' }}>Cancellation Policy</td>
                  <td style={{ padding: '1rem' }}>Free up to 24 hours</td>
                  <td style={{ padding: '1rem' }}>Free up to 48 hours</td>
                  <td style={{ padding: '1rem' }}>100% Refund up to 72 hours</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 2: CUSTOM CATALOG PACKAGE COMPARISON */}
      {/* ========================================================================= */}
      {compareMode === 'catalog' && (
        <div>
          {/* Preset Quick-Compare Pills */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '0.65rem',
              flexWrap: 'wrap',
              marginBottom: '2rem'
            }}
          >
            <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-muted)' }}>
              Quick Comparisons:
            </span>
            {PRESETS.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectPreset(preset)}
                style={{
                  background: '#fff',
                  border: '1.5px solid var(--border-light)',
                  borderRadius: 'var(--radius-full)',
                  padding: '0.45rem 1rem',
                  fontSize: '0.85rem',
                  fontWeight: '600',
                  color: 'var(--primary)',
                  cursor: 'pointer',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                  transition: 'all 0.2s ease'
                }}
              >
                {preset.label}
              </button>
            ))}
          </div>

          {/* Selector & Actions Bar */}
          <div
            style={{
              background: '#fff',
              padding: '1.25rem 1.75rem',
              borderRadius: 'var(--radius-xl)',
              border: '1px solid var(--border-light)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '2rem',
              flexWrap: 'wrap',
              gap: '1rem',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ fontSize: '0.95rem', color: 'var(--text-dark)', fontWeight: '700' }}>
                Comparing <span style={{ color: 'var(--secondary)' }}>{activeCompareList.length}</span> of 3 packages
              </div>
              {activeCompareList.length > 0 && (
                <button
                  type="button"
                  onClick={() => updateSelectedIds([])}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#ef4444',
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    textDecoration: 'underline'
                  }}
                >
                  Clear all
                </button>
              )}
            </div>

            {/* Add Package Dropdown */}
            {selectedIds.length < 3 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.88rem', fontWeight: '700', color: 'var(--text-dark)' }}>
                  + Add Package:
                </span>
                <select
                  onChange={(e) => {
                    if (e.target.value) {
                      handleAddId(e.target.value);
                      e.target.value = '';
                    }
                  }}
                  defaultValue=""
                  style={{
                    padding: '0.5rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1.5px solid var(--border-light)',
                    maxWidth: '380px',
                    fontSize: '0.88rem',
                    background: '#f8fafc',
                    cursor: 'pointer'
                  }}
                >
                  <option value="" disabled>
                    Select package to compare ({availableToAdd.length} available)...
                  </option>
                  {availableToAdd.slice(0, 50).map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title} — {formatINR(p.amount)} ({p.duration_days || 5}D)
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Comparison Cards Grid */}
          {activeCompareList.length === 0 ? (
            <div style={{ background: '#fff', borderRadius: 'var(--radius-xl)', padding: '4rem 1.5rem', textAlign: 'center', border: '1px solid var(--border-light)' }}>
              <span style={{ fontSize: '3.5rem', display: 'block', marginBottom: '1rem' }}>⚖️</span>
              <h3 style={{ color: 'var(--primary)' }}>No packages selected for comparison</h3>
              <p style={{ color: 'var(--text-muted)', margin: '0.5rem auto 1.5rem', maxWidth: '400px' }}>
                Select up to 3 packages from the dropdown above or switch to Route Tier Comparison.
              </p>
              <button
                type="button"
                className="btn-primary"
                onClick={() => setCompareMode('tiers')}
              >
                Switch to Route Tier Comparison
              </button>
            </div>
          ) : (
            <div style={{ background: '#fff', borderRadius: 'var(--radius-xl)', border: '1.5px solid var(--border-light)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
              <table className="custom-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f8fafc' }}>
                    <th style={{ padding: '1rem', width: '25%' }}>Package</th>
                    {activeCompareList.map((p) => (
                      <th key={p.id} style={{ padding: '1rem', textAlign: 'left' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontWeight: '800' }}>{p.title}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveId(p.id)}
                            style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '1rem' }}
                            title="Remove"
                          >
                            ✕
                          </button>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ padding: '1rem', fontWeight: '700' }}>Route</td>
                    {activeCompareList.map((p) => (
                      <td key={p.id} style={{ padding: '1rem' }}>{p.source || p.origin} ➔ {p.destination}</td>
                    ))}
                  </tr>
                  <tr style={{ background: '#f8fafc' }}>
                    <td style={{ padding: '1rem', fontWeight: '700' }}>Price per Person</td>
                    {activeCompareList.map((p) => (
                      <td key={p.id} style={{ padding: '1rem', fontWeight: '800', color: 'var(--primary)' }}>{formatINR(p.amount)}</td>
                    ))}
                  </tr>
                  <tr>
                    <td style={{ padding: '1rem', fontWeight: '700' }}>Category &amp; Transport</td>
                    {activeCompareList.map((p) => (
                      <td key={p.id} style={{ padding: '1rem' }}>{p.category || 'Standard'} • {p.transport}</td>
                    ))}
                  </tr>
                  <tr style={{ background: '#f8fafc' }}>
                    <td style={{ padding: '1rem', fontWeight: '700' }}>Hotel &amp; Meals</td>
                    {activeCompareList.map((p) => (
                      <td key={p.id} style={{ padding: '1rem' }}>{p.hotel_category || '3-Star'} • {p.meals || 'Breakfast included'}</td>
                    ))}
                  </tr>
                  <tr>
                    <td style={{ padding: '1rem', fontWeight: '700' }}>Action</td>
                    {activeCompareList.map((p) => (
                      <td key={p.id} style={{ padding: '1rem' }}>
                        <button
                          type="button"
                          className="btn-coral"
                          onClick={() => setSelectedTrip(p)}
                          style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                        >
                          ⚡ Book Package
                        </button>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Booking Modal with Payment Process */}
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
