import { Link } from 'react-router-dom';

export default function TransportPage() {
  const hubs = [
    {
      city: 'Chennai (MAA)',
      title: 'Chennai International & Domestic Hub',
      code: 'MAA',
      desc: 'Tamil Nadu’s largest air travel gateway with direct flights to Singapore, Dubai, Sri Lanka, Maldives, London, Paris, and all domestic metros.',
      keyRoutes: ['Chennai ➔ Singapore (4h 10m Direct)', 'Chennai ➔ Maldives (2h 45m Direct)', 'Chennai ➔ Goa (1h 50m)', 'Chennai ➔ Delhi (2h 40m)']
    },
    {
      city: 'Coimbatore (CJB)',
      title: 'Coimbatore Air & Rail Terminal',
      code: 'CJB',
      desc: 'Serving Western Tamil Nadu with non-stop flights to Singapore, Sharjah/Dubai, Mumbai, Delhi, Bengaluru, and Chennai, plus Vande Bharat trains.',
      keyRoutes: ['Coimbatore ➔ Goa via BLR', 'Coimbatore ➔ Singapore Direct', 'Coimbatore ➔ Kerala Road/Rail', 'Coimbatore ➔ Delhi']
    },
    {
      city: 'Tiruchirappalli (TRZ)',
      title: 'Trichy International Airport',
      code: 'TRZ',
      desc: 'Fastest growing international hub in Central Tamil Nadu with high-frequency direct flights to Sri Lanka, Malaysia, Singapore, and UAE.',
      keyRoutes: ['Trichy ➔ Colombo, Sri Lanka (55m Direct)', 'Trichy ➔ Kuala Lumpur (4h Direct)', 'Trichy ➔ Singapore (4h Direct)']
    },
    {
      city: 'Madurai (IXM)',
      title: 'Madurai Airport & Southern Transit Hub',
      code: 'IXM',
      desc: 'Key departure point for South Tamil Nadu travelers heading to Sri Lanka, Dubai, Bengaluru, Chennai, and North Indian pilgrimage circuits.',
      keyRoutes: ['Madurai ➔ Colombo (Direct)', 'Madurai ➔ Dubai via Chennai', 'Madurai ➔ Rajasthan Circuits']
    }
  ];

  return (
    <div className="section-wrapper" style={{ paddingTop: '2.5rem', paddingBottom: '4rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--secondary)', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
          Transit & Logistics Engine
        </span>
        <h1 style={{ fontSize: '2.4rem', color: 'var(--primary)', marginTop: '0.35rem' }}>
          Flights & Transport Connectivity
        </h1>
        <p style={{ color: 'var(--text-muted)', maxWidth: '720px', margin: '0.5rem auto 0', fontSize: '1.05rem' }}>
          Lyan Travels integrates flight charters, scheduled airline tickets, high-speed rail, and chauffeur cabs originating from Tamil Nadu.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))', gap: '1.75rem', marginBottom: '3rem' }}>
        {hubs.map((hub) => (
          <div
            key={hub.code}
            style={{
              background: '#fff',
              borderRadius: 'var(--radius-xl)',
              border: '1px solid var(--border-light)',
              padding: '1.75rem',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--primary)' }}>{hub.city}</span>
              <span style={{ fontSize: '0.75rem', background: 'var(--primary-light)', color: 'var(--primary)', padding: '0.2rem 0.55rem', borderRadius: '4px', fontWeight: '800' }}>
                {hub.code}
              </span>
            </div>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-body)', lineHeight: '1.6', marginBottom: '1rem' }}>
              {hub.desc}
            </p>
            <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '0.75rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Key Flights & Routes:
              </span>
              <ul style={{ paddingLeft: '1.1rem', margin: '0.4rem 0 0', fontSize: '0.84rem', color: 'var(--text-body)', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                {hub.keyRoutes.map((r, idx) => (
                  <li key={idx}>{r}</li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      <div style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-xl)', padding: '2rem', textAlign: 'center' }}>
        <h3 style={{ color: 'var(--primary)', fontSize: '1.4rem', marginBottom: '0.5rem' }}>
          Need Custom Flight or Private Transport Assistance?
        </h3>
        <p style={{ color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto 1.5rem', fontSize: '0.95rem' }}>
          Our travel agents can book group airline tickets, arrange premium tempo travelers, and coordinate seamless airport transfers.
        </p>
        <Link to="/contact" className="btn-primary">
          Connect with Transport Coordinator ➔
        </Link>
      </div>
    </div>
  );
}
