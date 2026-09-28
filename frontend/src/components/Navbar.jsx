import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useRecent } from '../context/RecentContext';
import { formatINR } from '../utils/currency';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { lang, setLang, t } = useLanguage();
  const { recentPackages, recentSearches, clearRecent } = useRecent();
  const [showRecentMenu, setShowRecentMenu] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const role = user?.role || 'guest';
  const isAdmin = role === 'admin';
  const isAgent = role === 'agent';
  const isCustomer = role === 'customer';

  const isActive = (path) => location.pathname === path;

  return (
    <header className="site-header">
      <div className="header-container">
        {/* Brand Logo */}
        <Link to="/" className="brand-logo" title="Lyan Travels – Home">
          <div className="brand-icon">✈️</div>
          <div className="brand-text">
            <span className="brand-title">Lyan Travels</span>
            <span className="brand-subtitle">Travel Agent Management System</span>
          </div>
        </Link>

        {/* Dynamic Navigation according to Role */}
        <nav className="site-nav">
          <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>
            🏠 {t('navHome')}
          </Link>
          <Link to="/packages" className={`nav-link ${isActive('/packages') ? 'active' : ''}`}>
            📦 {t('navPackages')}
          </Link>
          <Link to="/planner" className={`nav-link ${isActive('/planner') ? 'active' : ''}`}>
            🗺️ {t('navPlanner')}
          </Link>
          <Link to="/compare" className={`nav-link ${isActive('/compare') ? 'active' : ''}`}>
            ⚖️ {t('navCompare')}
          </Link>
          <Link to="/hotels" className={`nav-link ${isActive('/hotels') ? 'active' : ''}`}>
            🏨 {t('navHotels')}
          </Link>
          <Link to="/api-access" className={`nav-link ${isActive('/api-access') ? 'active' : ''}`}>
            ⚡ {t('navApi')}
          </Link>

          {/* Customer Logged-in links */}
          {isAuthenticated && isCustomer && (
            <>
              <Link to="/dashboard" className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}>
                📊 Dashboard
              </Link>
              <Link to="/my-bookings" className={`nav-link ${isActive('/my-bookings') ? 'active' : ''}`}>
                🧳 {t('navBookings')}
              </Link>
            </>
          )}

          {/* Travel Agent Logged-in links */}
          {isAuthenticated && isAgent && (
            <>
              <Link to="/agent" className={`nav-link ${isActive('/agent') ? 'active' : ''}`}>
                💼 {t('navAgent')}
              </Link>
            </>
          )}

          {/* Admin Logged-in links */}
          {isAuthenticated && isAdmin && (
            <>
              <Link to="/admin" className={`nav-link ${isActive('/admin') ? 'active' : ''}`}>
                🛡️ {t('navAdmin')}
              </Link>
            </>
          )}
        </nav>

        {/* Header Right Action Items */}
        <div className="header-actions">
          {/* Multi-lingual Selector */}
          <div className="lang-switcher" style={{ display: 'flex', alignItems: 'center' }}>
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value)}
              aria-label="Select Language"
              style={{
                background: '#f8fafc',
                border: '1.5px solid #cbd5e1',
                borderRadius: 'var(--radius-full)',
                padding: '0.35rem 0.65rem',
                fontSize: '0.8rem',
                fontWeight: '700',
                color: 'var(--primary)',
                cursor: 'pointer',
                outline: 'none'
              }}
            >
              <option value="en">🌐 English (EN)</option>
              <option value="ta">🇮🇳 தமிழ் (Tamil)</option>
              <option value="hi">🇮🇳 हिन्दी (Hindi)</option>
              <option value="es">🇪🇸 Español (ES)</option>
            </select>
          </div>

          {/* Recently Accessed Dropdown Flyout */}
          <div style={{ position: 'relative' }}>
            <button
              type="button"
              onClick={() => setShowRecentMenu(!showRecentMenu)}
              style={{
                background: recentPackages.length > 0 ? '#eff6ff' : '#f8fafc',
                border: '1px solid #cbd5e1',
                borderRadius: 'var(--radius-full)',
                padding: '0.35rem 0.75rem',
                fontSize: '0.8rem',
                fontWeight: '700',
                color: recentPackages.length > 0 ? '#1d4ed8' : '#64748b',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}
              title="View recently accessed packages and destinations"
            >
              <span>🕒</span>
              <span className="hide-on-mobile">{t('recentlyViewed')}</span>
              {recentPackages.length > 0 && (
                <span style={{ background: '#2563eb', color: '#fff', fontSize: '0.7rem', padding: '0.1rem 0.4rem', borderRadius: '10px' }}>
                  {recentPackages.length}
                </span>
              )}
            </button>

            {showRecentMenu && (
              <div
                style={{
                  position: 'absolute',
                  top: '120%',
                  right: 0,
                  width: '320px',
                  background: '#fff',
                  borderRadius: 'var(--radius-lg)',
                  boxShadow: '0 12px 32px rgba(0,0,0,0.18)',
                  border: '1px solid #e2e8f0',
                  padding: '1rem',
                  zIndex: 2000
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.5rem' }}>
                  <span style={{ fontWeight: '800', fontSize: '0.85rem', color: 'var(--primary)' }}>
                    🕒 Recently Accessed
                  </span>
                  {recentPackages.length > 0 && (
                    <button
                      type="button"
                      onClick={() => { clearRecent(); setShowRecentMenu(false); }}
                      style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer' }}
                    >
                      Clear
                    </button>
                  )}
                </div>

                {recentPackages.length === 0 ? (
                  <p style={{ fontSize: '0.82rem', color: '#94a3b8', textAlign: 'center', margin: '1rem 0' }}>
                    No packages viewed yet. Browse the catalog to see recent trips here!
                  </p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', maxHeight: '280px', overflowY: 'auto' }}>
                    {recentPackages.map((p) => (
                      <Link
                        key={p.id}
                        to={`/packages/${p.id}`}
                        onClick={() => setShowRecentMenu(false)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.65rem',
                          padding: '0.45rem',
                          borderRadius: 'var(--radius-md)',
                          textDecoration: 'none',
                          color: 'inherit',
                          transition: 'background 0.2s',
                          background: '#f8fafc'
                        }}
                      >
                        <img
                          src={p.image_url}
                          alt={p.title}
                          style={{ width: '42px', height: '42px', borderRadius: '6px', objectFit: 'cover' }}
                        />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '0.82rem', fontWeight: '700', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {p.title}
                          </div>
                          <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                            {p.source} ➔ {p.destination.split(',')[0]} • {formatINR(p.amount)}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* User Auth Section */}
          {isAuthenticated ? (
            <div className="user-menu">
              <span className={`role-badge role-${role}`}>
                {isAdmin ? 'Admin' : (isAgent ? 'Travel Agent' : 'Traveler')}
              </span>

              {user?.oauth_provider && (
                <span
                  style={{
                    fontSize: '0.7rem',
                    background: user.oauth_provider === 'google' ? '#fef3c7' : '#e2e8f0',
                    color: user.oauth_provider === 'google' ? '#92400e' : '#0f172a',
                    padding: '0.15rem 0.45rem',
                    borderRadius: '4px',
                    fontWeight: '800'
                  }}
                  title={`Signed in via ${user.oauth_provider}`}
                >
                  {user.oauth_provider === 'google' ? 'Google' : 'GitHub'}
                </span>
              )}

              {isCustomer && (
                <Link to="/notifications" className="nav-link" title="Notifications">
                  🔔
                </Link>
              )}

              <Link to="/profile" className="user-profile-pill" title="View Profile">
                <div className="user-avatar">{user?.name ? user.name.charAt(0).toUpperCase() : 'U'}</div>
                <span className="user-name">{user?.name?.split(' ')[0] || user?.email}</span>
              </Link>

              <button onClick={handleLogout} className="btn-logout" title="Sign out">
                {t('navLogout')}
              </button>
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="btn-login">
                {t('navLogin')}
              </Link>
              <Link to="/register" className="btn-register">
                {t('navRegister')}
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
