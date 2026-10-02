import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="site-footer" style={{ background: '#0f172a', color: '#cbd5e1', paddingTop: '3.5rem', marginTop: '4rem', borderTop: '4px solid var(--primary)' }}>
      <div className="section-wrapper" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '2.5rem', paddingBottom: '3rem' }}>
        {/* Col 1: Brand */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <span style={{ fontSize: '1.75rem', background: 'var(--primary)', width: '42px', height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '10px', color: '#fff' }}>✈️</span>
            <div>
              <h3 style={{ color: '#fff', fontSize: '1.35rem', fontWeight: '800', lineHeight: '1.1' }}>Lyan Travels</h3>
              <p style={{ fontSize: '0.7rem', color: '#38bdf8', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.6px' }}>Travel Agent Management System</p>
            </div>
          </div>
          <p style={{ fontSize: '0.88rem', lineHeight: '1.6', color: '#94a3b8', marginBottom: '1.25rem' }}>
            Empowering travelers with seamless domestic & international holiday bookings departing from Tamil Nadu (Chennai, Coimbatore, Madurai, Trichy, Salem). Catering to Budget, Economy, Standard, Premium, and Luxury travelers.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', fontSize: '0.78rem' }}>
            <span style={{ background: '#1e293b', padding: '0.25rem 0.6rem', borderRadius: '6px', color: '#38bdf8' }}>🔒 Secure Booking</span>
            <span style={{ background: '#1e293b', padding: '0.25rem 0.6rem', borderRadius: '6px', color: '#34d399' }}>🤖 AI Travel Concierge</span>
            <span style={{ background: '#1e293b', padding: '0.25rem 0.6rem', borderRadius: '6px', color: '#fed7aa' }}>⭐ Certified Agents</span>
          </div>
        </div>

        {/* Col 2: Tamil Nadu Departure Hubs */}
        <div>
          <h4 style={{ color: '#fff', fontSize: '1.05rem', marginBottom: '1.1rem', fontWeight: '700' }}>Departures from Tamil Nadu</h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.9rem' }}>
            <li><Link to="/packages?source=Chennai" style={{ color: '#94a3b8', transition: 'color 0.2s' }}>✈️ Chennai ➔ Kerala / Goa / Maldives</Link></li>
            <li><Link to="/packages?source=Coimbatore" style={{ color: '#94a3b8' }}>✈️ Coimbatore ➔ Goa / Dubai / Singapore</Link></li>
            <li><Link to="/packages?source=Madurai" style={{ color: '#94a3b8' }}>✈️ Madurai ➔ Rajasthan / Kashmir</Link></li>
            <li><Link to="/packages?source=Tiruchirappalli" style={{ color: '#94a3b8' }}>✈️ Trichy ➔ Sri Lanka / Malaysia</Link></li>
            <li><Link to="/packages?source=Salem" style={{ color: '#94a3b8' }}>🚆 Salem ➔ Ooty & Kodaikanal Getaways</Link></li>
            <li><Link to="/packages?source=Puducherry" style={{ color: '#94a3b8' }}>🚗 Puducherry ➔ Coastal Roadtrips</Link></li>
          </ul>
        </div>

        {/* Col 3: Quick Links */}
        <div>
          <h4 style={{ color: '#fff', fontSize: '1.05rem', marginBottom: '1.1rem', fontWeight: '700' }}>Quick Navigation</h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.9rem' }}>
            <li><Link to="/explore" style={{ color: '#94a3b8' }}>🌏 Explore Destinations</Link></li>
            <li><Link to="/packages" style={{ color: '#94a3b8' }}>📦 All Travel Packages</Link></li>
            <li><Link to="/planner" style={{ color: '#94a3b8' }}>🗺️ AI Trip Planner</Link></li>
            <li><Link to="/payments" style={{ color: '#94a3b8' }}>💳 Payments & Invoices</Link></li>
            <li><Link to="/hotels" style={{ color: '#94a3b8' }}>🏨 Partner Hotels & Resorts</Link></li>
            <li><Link to="/offers" style={{ color: '#94a3b8' }}>🏷️ Seasonal Deals & Offers</Link></li>
          </ul>
        </div>

        {/* Col 4: Support & Contact */}
        <div>
          <h4 style={{ color: '#fff', fontSize: '1.05rem', marginBottom: '1.1rem', fontWeight: '700' }}>Contact & Assistance</h4>
          <p style={{ fontSize: '0.88rem', color: '#94a3b8', marginBottom: '0.5rem' }}>📍 <strong>Head Office:</strong> Anna Salai, Chennai, Tamil Nadu</p>
          <p style={{ fontSize: '0.88rem', color: '#94a3b8', marginBottom: '0.5rem' }}>📍 <strong>Branch:</strong> Avinashi Road, Coimbatore, Tamil Nadu</p>
          <p style={{ fontSize: '0.88rem', color: '#94a3b8', marginBottom: '0.5rem' }}>📞 <strong>Support Desk:</strong> +91 44 2855 0199</p>
          <p style={{ fontSize: '0.88rem', color: '#94a3b8', marginBottom: '0.5rem' }}>✉️ <strong>Email:</strong> support@lyantravels.com</p>
          <p style={{ fontSize: '0.88rem', color: '#38bdf8', marginTop: '0.75rem' }}>🤖 AI Travel Agent active 24/7 on website</p>
        </div>
      </div>

      <div style={{ borderTop: '1px solid #1e293b', padding: '1.25rem 1.5rem', textAlign: 'center', fontSize: '0.85rem', color: '#64748b' }}>
        <div className="section-wrapper" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
          <span>© {new Date().getFullYear()} Lyan Travels Private Limited – Travel Agent Management System. All rights reserved.</span>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <Link to="/about" style={{ color: '#94a3b8' }}>About Us</Link>
            <Link to="/contact" style={{ color: '#94a3b8' }}>Customer Support</Link>
            <Link to="/packages" style={{ color: '#94a3b8' }}>Booking Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
