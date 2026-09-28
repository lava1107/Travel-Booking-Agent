import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';

export default function Offers() {
  const navigate = useNavigate();
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState(null);

  useEffect(() => {
    api.get('/offers')
      .then(({ data }) => setOffers(data.data || []))
      .catch((err) => console.error('Failed to load offers:', err))
      .finally(() => setLoading(false));
  }, []);

  const handleCopy = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 3000);
  };

  return (
    <div className="section-wrapper" style={{ paddingTop: '2.5rem', paddingBottom: '4rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--secondary)', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
          Special Promotions & Discounts
        </span>
        <h1 style={{ fontSize: '2.4rem', color: 'var(--primary)', marginTop: '0.35rem' }}>
          Travel Offers & Seasonal Deals
        </h1>
        <p style={{ color: 'var(--text-muted)', maxWidth: '680px', margin: '0.5rem auto 0', fontSize: '1.05rem' }}>
          Exclusive savings on weekend getaways, family packages, student trips, and international routes originating from Tamil Nadu.
        </p>
      </div>

      {loading ? (
        <p style={{ textAlign: 'center' }}>Loading seasonal offers…</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.75rem' }}>
          {offers.map((offer) => (
            <div
              key={offer.id}
              style={{
                background: '#fff',
                borderRadius: 'var(--radius-xl)',
                border: '1.5px solid var(--border-light)',
                padding: '1.75rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: 'var(--shadow-sm)',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <div style={{ position: 'absolute', top: 0, right: 0, background: 'var(--accent-coral)', color: '#fff', padding: '0.3rem 0.85rem', borderBottomLeftRadius: 'var(--radius-md)', fontSize: '0.8rem', fontWeight: '800' }}>
                {offer.discount}
              </div>

              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {offer.category} • Origin: {offer.origin || 'Tamil Nadu'}
                </span>
                <h3 style={{ fontSize: '1.25rem', color: 'var(--primary)', margin: '0.4rem 0 0.65rem' }}>
                  {offer.title}
                </h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-body)', lineHeight: '1.5', marginBottom: '1.25rem' }}>
                  {offer.description}
                </p>
              </div>

              <div style={{ borderTop: '1px dashed var(--border-light)', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: '700' }}>PROMO CODE</div>
                  <div style={{ fontSize: '1.05rem', fontWeight: '800', color: 'var(--primary)', letterSpacing: '0.5px' }}>
                    {offer.code}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => handleCopy(offer.code)}
                    style={{ padding: '0.4rem 0.75rem', fontSize: '0.82rem' }}
                  >
                    {copiedCode === offer.code ? '✓ Copied' : 'Copy'}
                  </button>
                  <button
                    type="button"
                    className="btn-primary"
                    onClick={() => navigate('/packages')}
                    style={{ padding: '0.4rem 0.85rem', fontSize: '0.82rem' }}
                  >
                    Redeem ➔
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
