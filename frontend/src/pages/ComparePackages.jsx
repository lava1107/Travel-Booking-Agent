import { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import api from '../api/client';
import BookingModal from '../components/BookingModal';
import { formatINR } from '../utils/currency';

export default function ComparePackages() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [packages, setPackages] = useState([]);
  const [allPackages, setAllPackages] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTrip, setSelectedTrip] = useState(null);

  useEffect(() => {
    api.get('/trips')
      .then(({ data }) => {
        const list = data.data || [];
        setAllPackages(list);

        const idsParam = searchParams.get('ids');
        let initialIds = [];
        if (idsParam) {
          initialIds = idsParam.split(',').map(Number).filter(Boolean);
        } else if (list.length >= 2) {
          initialIds = [list[0].id, list[1].id];
        }
        setSelectedIds(initialIds);
      })
      .catch((err) => console.error('Failed to load trips for comparison:', err))
      .finally(() => setLoading(false));
  }, [searchParams]);

  const activeCompareList = allPackages.filter((p) => selectedIds.includes(p.id));

  const handleAddId = (e) => {
    const id = Number(e.target.value);
    if (id && !selectedIds.includes(id) && selectedIds.length < 3) {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleRemoveId = (id) => {
    setSelectedIds(selectedIds.filter((item) => item !== id));
  };

  return (
    <div className="section-wrapper" style={{ paddingTop: '2.5rem', paddingBottom: '4rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--secondary)', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
          Comparative Evaluation
        </span>
        <h1 style={{ fontSize: '2.4rem', color: 'var(--primary)', marginTop: '0.35rem' }}>
          Compare Travel Packages
        </h1>
        <p style={{ color: 'var(--text-muted)', maxWidth: '680px', margin: '0.5rem auto 0', fontSize: '1.05rem' }}>
          Evaluate price, hotel tiers, transport, meals, and cancellation policies side-by-side to make the best travel decision.
        </p>
      </div>

      {/* Add Package Selector */}
      <div style={{ background: '#fff', padding: '1.25rem 1.75rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ fontSize: '0.92rem', color: 'var(--text-dark)', fontWeight: '600' }}>
          Comparing <strong>{activeCompareList.length}</strong> of 3 max packages
        </div>

        {selectedIds.length < 3 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: '700' }}>+ Add to compare:</label>
            <select onChange={handleAddId} defaultValue="" style={{ padding: '0.45rem 0.85rem', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--border-light)' }}>
              <option value="" disabled>Select package to add</option>
              {allPackages.filter(p => !selectedIds.includes(p.id)).map(p => (
                <option key={p.id} value={p.id}>
                  {p.title} (₹{Number(p.amount).toLocaleString('en-IN')})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Side-by-Side Comparison Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}>Loading comparison…</div>
      ) : activeCompareList.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', background: '#fff', borderRadius: 'var(--radius-lg)' }}>
          <p>Please select at least 2 packages to compare.</p>
          <Link to="/packages" className="btn-primary" style={{ marginTop: '1rem', display: 'inline-block' }}>Browse Packages</Link>
        </div>
      ) : (
        <div className="custom-table-wrap" style={{ overflowX: 'auto' }}>
          <table className="custom-table" style={{ minWidth: '750px' }}>
            <thead>
              <tr>
                <th style={{ width: '220px' }}>Feature / Spec</th>
                {activeCompareList.map((p) => (
                  <th key={p.id} style={{ verticalAlign: 'top', minWidth: '220px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <span style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--primary)' }}>
                        {p.title}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveId(p.id)}
                        style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '1.1rem' }}
                        title="Remove"
                      >
                        ✕
                      </button>
                    </div>
                    <div style={{ marginTop: '0.5rem' }}>
                      <span className={`cat-badge cat-${(p.category || 'Standard').toLowerCase()}`}>
                        {p.category || 'Standard'}
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Price / Person</strong></td>
                {activeCompareList.map((p) => (
                  <td key={p.id}>
                    <strong style={{ fontSize: '1.25rem', color: 'var(--primary)' }}>
                      {formatINR(p.amount)}
                    </strong>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>+ 5% GST</div>
                  </td>
                ))}
              </tr>
              <tr>
                <td><strong>Route (TN Origin)</strong></td>
                {activeCompareList.map((p) => (
                  <td key={p.id}>
                    📍 {p.origin || p.source || 'Chennai'} ➔ 🏝️ {p.destination}
                  </td>
                ))}
              </tr>
              <tr>
                <td><strong>Trip Type</strong></td>
                {activeCompareList.map((p) => (
                  <td key={p.id}>{p.destination_type || 'Domestic'}</td>
                ))}
              </tr>
              <tr>
                <td><strong>Duration</strong></td>
                {activeCompareList.map((p) => (
                  <td key={p.id}>{p.duration_days} Days / {p.duration_nights || p.duration_days - 1} Nights</td>
                ))}
              </tr>
              <tr>
                <td><strong>Transport</strong></td>
                {activeCompareList.map((p) => (
                  <td key={p.id}>🚀 {p.transport}</td>
                ))}
              </tr>
              <tr>
                <td><strong>Hotel Category</strong></td>
                {activeCompareList.map((p) => (
                  <td key={p.id}>🏨 {p.hotel_category || '3-Star Deluxe'}</td>
                ))}
              </tr>
              <tr>
                <td><strong>Meals Included</strong></td>
                {activeCompareList.map((p) => (
                  <td key={p.id}>🍽️ {p.meals || 'Breakfast Included'}</td>
                ))}
              </tr>
              <tr>
                <td><strong>Customer Rating</strong></td>
                {activeCompareList.map((p) => (
                  <td key={p.id}>⭐ {p.rating} / 5 ({p.reviews_count || 45} reviews)</td>
                ))}
              </tr>
              <tr>
                <td><strong>Cancellation Policy</strong></td>
                {activeCompareList.map((p) => (
                  <td key={p.id} style={{ fontSize: '0.84rem' }}>
                    {p.cancellation_policy || 'Free cancellation up to 48 hours prior to travel date.'}
                  </td>
                ))}
              </tr>
              <tr>
                <td><strong>Action</strong></td>
                {activeCompareList.map((p) => (
                  <td key={p.id}>
                    <button
                      type="button"
                      className="btn-coral"
                      onClick={() => setSelectedTrip(p)}
                      style={{ padding: '0.45rem 0.95rem', fontSize: '0.85rem' }}
                    >
                      Book Now ➔
                    </button>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* Booking Modal */}
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
