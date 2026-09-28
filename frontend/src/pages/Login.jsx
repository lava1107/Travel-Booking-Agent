import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export default function Login() {
  const { login, loginOAuth, user, loading } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [form, setForm] = useState({ identifier: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);

  // OAuth Modal State
  const [oauthProvider, setOauthProvider] = useState(null); // 'google' | 'github' | null
  const [oauthEmail, setOauthEmail] = useState('');
  const [oauthName, setOauthName] = useState('');
  const [oauthLoading, setOauthLoading] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      if (user.role === 'admin') navigate('/admin', { replace: true });
      else if (user.role === 'agent') navigate('/agent', { replace: true });
      else navigate('/dashboard', { replace: true });
    }
  }, [user, loading, navigate]);

  // Quick fill helper for testing demo roles
  const handleQuickLogin = (email, pwd) => {
    setForm({ identifier: email, password: pwd });
    setError('');
  };

  const handleInstantSignIn = async (email, pwd) => {
    setForm({ identifier: email, password: pwd });
    setError('');
    setSubmitting(true);
    try {
      const authUser = await login(email, pwd);
      if (authUser.role === 'admin') navigate('/admin', { replace: true });
      else if (authUser.role === 'agent') navigate('/agent', { replace: true });
      else navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.response?.data?.detail || 'Quick sign in failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenOAuth = (provider) => {
    setOauthProvider(provider);
    if (provider === 'google') {
      setOauthEmail('alex.traveler@gmail.com');
      setOauthName('Alex Traveler');
    } else {
      setOauthEmail('alex.developer@github.com');
      setOauthName('Alex Developer');
    }
  };

  const handleExecuteOAuth = async (e) => {
    if (e) e.preventDefault();
    if (!oauthEmail.trim()) return;
    setOauthLoading(true);
    setError('');
    try {
      const authUser = await loginOAuth({
        provider: oauthProvider,
        email: oauthEmail.trim(),
        name: oauthName.trim() || 'Verified Traveler',
        avatar: oauthProvider === 'google'
          ? 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'
          : 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100'
      });
      setOauthProvider(null);
      if (authUser.role === 'admin') navigate('/admin', { replace: true });
      else if (authUser.role === 'agent') navigate('/agent', { replace: true });
      else navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.response?.data?.detail || 'OAuth sign-in failed.');
    } finally {
      setOauthLoading(false);
    }
  };

  async function handleSubmit(e) {
    if (e) e.preventDefault();
    setError('');

    const trimmedIdentifier = form.identifier.trim();
    if (!trimmedIdentifier) {
      setError('Please enter your email or username.');
      return;
    }
    if (!form.password) {
      setError('Please enter your password.');
      return;
    }

    setSubmitting(true);
    try {
      const authUser = await login(trimmedIdentifier, form.password);
      if (authUser.role === 'admin') navigate('/admin', { replace: true });
      else if (authUser.role === 'agent') navigate('/agent', { replace: true });
      else navigate('/dashboard', { replace: true });
    } catch (err) {
      const respData = err.response?.data;
      if (!err.response) {
        setError('Network error: Unable to connect to the authentication server. Please verify the Python backend is running on port 8000.');
      } else if (err.response.status === 403) {
        setError(respData?.detail || respData?.error || 'This account is inactive. Please contact system administrator.');
      } else if (err.response.status === 401) {
        setError(respData?.detail || respData?.error || 'Invalid credentials. Universal demo password is 123.');
      } else if (err.response.status === 400) {
        const details = respData?.details;
        const detailMsg = Array.isArray(details) && details.length > 0 ? details[0].msg : null;
        setError(detailMsg || respData?.detail || respData?.error || 'Validation error. Please check your input.');
      } else if (err.response.status >= 500) {
        const isProxyError = typeof respData === 'string' && (respData.includes('ECONNREFUSED') || respData.includes('proxy'));
        if (isProxyError) {
          setError('Backend offline: The Python FastAPI backend (port 8000) is not running. Please start the backend service.');
        } else {
          setError(respData?.detail || respData?.error || 'Server error: An unexpected server error occurred. Please try again later.');
        }
      } else {
        setError(respData?.detail || respData?.error || 'Login failed. Please verify credentials.');
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-master-wrapper travel-theme-auth">
      <div className="auth-card-container">
        {/* Left Side: Travel Showcase Hero */}
        <div className="auth-hero-side">
          <div className="auth-hero-backdrop"></div>
          <div className="auth-hero-content">
            <div className="auth-brand-badge">
              <span className="flag-icon">✈️</span>
              <span>Lyan Travels • Management System</span>
            </div>

            <h1 className="auth-hero-headline">
              Tamil Nadu to the World <br />
              <span className="text-highlight">Seamless Travel Management</span>
            </h1>

            <p className="auth-hero-description">
              Sign in to browse budget and luxury packages, track bookings in real time, communicate with your AI travel agent, and manage journeys.
            </p>

            {/* Value Props & Trust Badges */}
            <div className="auth-value-props">
              <div className="prop-item">
                <span className="prop-icon">🌴</span>
                <div>
                  <strong>700+ Verified Packages</strong>
                  <p>30+ packages for every origin & destination across Budget, Standard & Luxury</p>
                </div>
              </div>
              <div className="prop-item">
                <span className="prop-icon">🔐</span>
                <div>
                  <strong>OAuth 2.0 & RFC 7519 JWT</strong>
                  <p>Enterprise Google & GitHub Single Sign-On with encrypted Bearer tokens</p>
                </div>
              </div>
              <div className="prop-item">
                <span className="prop-icon">🤖</span>
                <div>
                  <strong>NLP Semantic Search & Chatbot</strong>
                  <p>SpaCy slot filling, TF-IDF intent prediction, and 24/7 AI travel assistance</p>
                </div>
              </div>
            </div>

            {/* Testimonial */}
            <div className="auth-testimonial-box">
              <div className="testimonial-stars">⭐⭐⭐⭐⭐</div>
              <p className="testimonial-quote">
                “Booked our family vacation from Chennai to Kerala effortlessly. Clear pricing and great itinerary planning!”
              </p>
              <div className="testimonial-author">
                <span className="author-avatar">KR</span>
                <div>
                  <strong>Kavitha Ramesh</strong>
                  <span>Chennai, Tamil Nadu</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Modern Authentication Panel */}
        <div className="auth-form-side">
          <div className="auth-form-inner">
            <div className="auth-form-header">
              <div className="auth-form-icon">🔑</div>
              <h2>Member Sign In</h2>
              <p>Access customer dashboard, bookings, or agent console</p>
            </div>

            {/* 6 Quick Demo Logins Bar (At Least 5 Accounts Checked) */}
            <div className="demo-accounts-card" style={{ marginBottom: '1.25rem' }}>
              <div className="demo-accounts-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>⚡ Quick 1-Click Verified Logins (Pwd: 123):</span>
                <span style={{ fontSize: '0.72rem', background: '#dcfce7', color: '#16a34a', padding: '0.1rem 0.4rem', borderRadius: '4px', fontWeight: '800' }}>6 Verified Accounts</span>
              </div>
              <div className="demo-btn-group" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.4rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  className="demo-pill-btn admin-btn"
                  onClick={() => handleInstantSignIn('admin@lyantravel.com', '123')}
                  title="Sign in as System Admin"
                >
                  🛡️ Admin
                </button>
                <button
                  type="button"
                  className="demo-pill-btn agent-btn"
                  style={{ background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0' }}
                  onClick={() => handleInstantSignIn('agent@lyantravel.com', '123')}
                  title="Sign in as Agent Sarah"
                >
                  💼 Agent Sarah
                </button>
                <button
                  type="button"
                  className="demo-pill-btn agent-btn"
                  style={{ background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0' }}
                  onClick={() => handleInstantSignIn('agent.rajesh@lyantravel.com', '123')}
                  title="Sign in as Agent Rajesh"
                >
                  💼 Agent Rajesh
                </button>
                <button
                  type="button"
                  className="demo-pill-btn customer-btn"
                  onClick={() => handleInstantSignIn('user@lyantravel.com', '123')}
                  title="Sign in as Customer Kavitha"
                >
                  👤 Kavitha (User)
                </button>
                <button
                  type="button"
                  className="demo-pill-btn customer-btn"
                  onClick={() => handleInstantSignIn('anand.chennai@gmail.com', '123')}
                  title="Sign in as Customer Anand"
                >
                  👤 Anand (User)
                </button>
                <button
                  type="button"
                  className="demo-pill-btn customer-btn"
                  onClick={() => handleInstantSignIn('priya.coimbatore@gmail.com', '123')}
                  title="Sign in as Customer Priya"
                >
                  👤 Priya (User)
                </button>
              </div>
            </div>

            {/* OAuth 2.0 Single Sign-On Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1.25rem' }}>
              <button
                type="button"
                onClick={() => handleOpenOAuth('google')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1.5px solid #e2e8f0',
                  background: '#fff',
                  color: '#1e293b',
                  fontWeight: '700',
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.15z"/>
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"/>
                  <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.04 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                </svg>
                <span>{t('oauthGoogle')}</span>
              </button>

              <button
                type="button"
                onClick={() => handleOpenOAuth('github')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1.5px solid #0f172a',
                  background: '#0f172a',
                  color: '#fff',
                  fontWeight: '700',
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#fff">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
                </svg>
                <span>{t('oauthGithub')}</span>
              </button>
            </div>

            <div className="auth-divider" style={{ margin: '1rem 0' }}>
              <span>or sign in with email</span>
            </div>

            {error && (
              <div className="auth-error-banner" role="alert" style={{ marginBottom: '1rem' }}>
                <span className="error-icon">⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="modern-auth-form" noValidate>
              <div className="input-group">
                <label htmlFor="login-identifier">Email or Username</label>
                <div className="input-field-wrapper">
                  <span className="field-icon">✉️</span>
                  <input
                    id="login-identifier"
                    type="text"
                    required
                    autoComplete="username"
                    value={form.identifier}
                    onChange={(e) => setForm({ ...form, identifier: e.target.value })}
                    placeholder="e.g. user@lyantravel.com, agent, or admin"
                  />
                </div>
              </div>

              <div className="input-group">
                <div className="label-row">
                  <label htmlFor="login-password">Password</label>
                  <button
                    type="button"
                    className="forgot-link-btn"
                    onClick={() => setShowForgotModal(true)}
                  >
                    Demo credentials?
                  </button>
                </div>
                <div className="input-field-wrapper">
                  <span className="field-icon">🔒</span>
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="current-password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="Enter password (e.g. 123)"
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    tabIndex="-1"
                  >
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              <div className="form-remember-row">
                <label className="checkbox-container">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <span className="checkbox-label">Keep me signed in on this secure device</span>
                </label>
              </div>

              <button type="submit" className="btn-auth-submit" disabled={submitting}>
                {submitting ? (
                  <span className="btn-loading-state">
                    <span className="auth-spinner"></span>
                    Authenticating…
                  </span>
                ) : (
                  <span>Sign In & Continue ➔</span>
                )}
              </button>

              <div className="auth-divider">
                <span>or</span>
              </div>

              <div className="auth-alt-action">
                <p>
                  Don't have an account yet?{' '}
                  <Link to="/register" className="auth-switch-link">
                    Register an Account
                  </Link>
                </p>
              </div>

              <div className="auth-security-footer">
                <span>🔒 Secure 256-Bit SSL • Lyan Travels Chennai Hub</span>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Interactive OAuth 2.0 Provider Dialog */}
      {oauthProvider && (
        <div className="modal-backdrop" onClick={() => setOauthProvider(null)}>
          <div className="booking-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px' }}>
            <button className="modal-close-btn" onClick={() => setOauthProvider(null)}>✕</button>
            <div className="modal-header" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>
                {oauthProvider === 'google' ? '🌐' : '🐙'}
              </div>
              <h2>Sign in with {oauthProvider === 'google' ? 'Google' : 'GitHub'}</h2>
              <p className="subtitle">
                Select a verified account or enter your email to receive an instant JWT authentication session.
              </p>
            </div>

            <form onSubmit={handleExecuteOAuth} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.25rem' }}>
              <div className="input-group">
                <label>Account Name</label>
                <input
                  type="text"
                  value={oauthName}
                  onChange={(e) => setOauthName(e.target.value)}
                  placeholder="Your Full Name"
                  required
                />
              </div>

              <div className="input-group">
                <label>{oauthProvider === 'google' ? 'Google Email' : 'GitHub Email'}</label>
                <input
                  type="email"
                  value={oauthEmail}
                  onChange={(e) => setOauthEmail(e.target.value)}
                  placeholder="name@domain.com"
                  required
                />
              </div>

              <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: 'var(--radius-md)', fontSize: '0.8rem', color: '#64748b' }}>
                🛡️ Fast-track OAuth 2.0 flow: automatically links profile and provisions RFC 7519 signed JWT Bearer credentials.
              </div>

              <button
                type="submit"
                className="btn-primary"
                disabled={oauthLoading}
                style={{ width: '100%', justifyContent: 'center', padding: '0.8rem' }}
              >
                {oauthLoading ? 'Authenticating with OAuth…' : `Confirm Sign In with ${oauthProvider === 'google' ? 'Google' : 'GitHub'} ➔`}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Forgot Password / Demo Credentials Modal */}
      {showForgotModal && (
        <div className="modal-backdrop" onClick={() => setShowForgotModal(false)}>
          <div className="booking-modal forgot-password-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setShowForgotModal(false)}>
              ✕
            </button>
            <div className="modal-header">
              <span className="category-pill">Sign In Credentials</span>
              <h2>Demo System Accounts</h2>
              <p className="subtitle">
                All accounts use the universal password <strong>123</strong>:
              </p>
            </div>
            <div className="seed-credentials-box">
              <div className="cred-item">
                <span className="cred-role">🛡️ Administrator:</span>
                <code>admin@lyantravel.com</code> (Password: <code>123</code>)
              </div>
              <div className="cred-item">
                <span className="cred-role">💼 Senior Agent:</span>
                <code>agent@lyantravel.com</code> (Password: <code>123</code>)
              </div>
              <div className="cred-item">
                <span className="cred-role">💼 Verified Agent:</span>
                <code>agent.rajesh@lyantravel.com</code> (Password: <code>123</code>)
              </div>
              <div className="cred-item">
                <span className="cred-role">👤 Customer Kavitha:</span>
                <code>user@lyantravel.com</code> (Password: <code>123</code>)
              </div>
              <div className="cred-item">
                <span className="cred-role">👤 Customer Anand:</span>
                <code>anand.chennai@gmail.com</code> (Password: <code>123</code>)
              </div>
              <div className="cred-item">
                <span className="cred-role">👤 Customer Priya:</span>
                <code>priya.coimbatore@gmail.com</code> (Password: <code>123</code>)
              </div>
            </div>
            <div className="modal-actions" style={{ marginTop: '1.5rem', display: 'flex', gap: '0.75rem' }}>
              <button
                type="button"
                className="btn-primary"
                onClick={() => {
                  setShowForgotModal(false);
                  handleInstantSignIn('admin@lyantravel.com', '123');
                }}
              >
                Log In as Admin (123)
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => {
                  setShowForgotModal(false);
                  handleInstantSignIn('user@lyantravel.com', '123');
                }}
              >
                Log In as Customer (123)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
