import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register, user, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'customer',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      if (user.role === 'admin') navigate('/admin', { replace: true });
      else navigate('/dashboard', { replace: true });
    }
  }, [user, loading, navigate]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    const trimmedName = form.name.trim();
    const trimmedEmail = form.email.trim();
    const trimmedPhone = form.phone.trim();

    if (!trimmedName) {
      setError('Please enter your full name.');
      return;
    }

    if (!trimmedEmail) {
      setError('Please enter your email address.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setError('Please enter a valid email address.');
      return;
    }

    if (!form.password) {
      setError('Please enter a password.');
      return;
    }

    if (form.password.length < 3) {
      setError('Password must be at least 3 characters.');
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match. Please verify.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: trimmedName,
        email: trimmedEmail,
        password: form.password,
        confirmPassword: form.confirmPassword,
        role: form.role,
      };
      if (trimmedPhone) {
        payload.phone = trimmedPhone.startsWith('+91') ? trimmedPhone : `+91 ${trimmedPhone}`;
      }

      const authUser = await register(payload);
      if (authUser.role === 'admin') {
        navigate('/admin', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    } catch (err) {
      const respData = err.response?.data;
      if (!err.response) {
        setError('Network error: Unable to reach the authentication server. Please check your backend connection.');
      } else if (err.response.status === 409) {
        setError(respData?.detail || respData?.error || 'An account with this email already exists.');
      } else if (err.response.status === 400) {
        const details = respData?.details;
        const detailMsg = Array.isArray(details) && details.length > 0 ? details[0].msg : null;
        setError(detailMsg || respData?.detail || respData?.error || 'Validation failed. Please verify your details.');
      } else if (err.response.status >= 500) {
        const isProxyError = typeof respData === 'string' && (respData.includes('ECONNREFUSED') || respData.includes('proxy'));
        if (isProxyError) {
          setError('Backend offline: The Python FastAPI backend (port 8000) is not running. Please start the backend service.');
        } else {
          setError(respData?.detail || respData?.error || 'Server error: An unexpected server error occurred. Please try again later.');
        }
      } else {
        setError(respData?.detail || respData?.error || 'Registration failed. Please try again.');
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
              <span>Lyan Travels • Tamil Nadu Hub</span>
            </div>

            <h1 className="auth-hero-headline">
              Begin Your Journey <br />
              <span className="text-highlight">With Lyan Travels</span>
            </h1>

            <p className="auth-hero-description">
              Create your account to discover domestic and international destinations, book transparently with instant PNRs, and manage your travel itineraries.
            </p>

            {/* Benefits */}
            <div className="auth-value-props">
              <div className="prop-item">
                <span className="prop-icon">🎟️</span>
                <div>
                  <strong>Live Booking Management</strong>
                  <p>Track e-tickets, PNR codes, day-by-day itineraries, and digital receipts</p>
                </div>
              </div>
              <div className="prop-item">
                <span className="prop-icon">🌴</span>
                <div>
                  <strong>All Travel Categories</strong>
                  <p>Budget, Economy, Standard, Premium, and Luxury packages for any traveler</p>
                </div>
              </div>
              <div className="prop-item">
                <span className="prop-icon">🤖</span>
                <div>
                  <strong>AI Travel Agent Included</strong>
                  <p>Get instant recommendations and customize trips directly via conversational AI</p>
                </div>
              </div>
            </div>

            <div className="auth-testimonial-box">
              <div className="testimonial-stars">⭐⭐⭐⭐⭐</div>
              <p className="testimonial-quote">
                “Created our account and booked our Andaman holiday in minutes. The customer dashboard and timeline tracking are brilliant!”
              </p>
              <div className="testimonial-author">
                <span className="author-avatar">LT</span>
                <div>
                  <strong>Senthil Kumar</strong>
                  <span>Coimbatore Traveler</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Modern Registration Form */}
        <div className="auth-form-side">
          <div className="auth-form-inner">
            <div className="auth-form-header">
              <div className="auth-form-icon">✨</div>
              <h2>Create an Account</h2>
              <p>Register as a Traveler or Administrator</p>
            </div>

            {error && (
              <div className="auth-error-banner" role="alert">
                <span className="error-icon">⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="modern-auth-form" noValidate>
              <div className="input-group">
                <label htmlFor="reg-name">Full Name</label>
                <div className="input-field-wrapper">
                  <span className="field-icon">👤</span>
                  <input
                    id="reg-name"
                    required
                    autoComplete="name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. Anandha Krishnan"
                  />
                </div>
              </div>

              <div className="input-group">
                <label htmlFor="reg-email">Email Address</label>
                <div className="input-field-wrapper">
                  <span className="field-icon">✉️</span>
                  <input
                    id="reg-email"
                    type="email"
                    required
                    autoComplete="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="e.g. anand@example.com"
                  />
                </div>
              </div>

              <div className="form-grid-2">
                <div className="input-group">
                  <label htmlFor="reg-phone">Mobile Phone (Optional)</label>
                  <div className="input-field-wrapper">
                    <span className="field-icon">🇮🇳</span>
                    <input
                      id="reg-phone"
                      type="tel"
                      autoComplete="tel"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="98765 43210"
                    />
                  </div>
                </div>

                <div className="input-group">
                  <label htmlFor="reg-role">Account Type</label>
                  <div className="input-field-wrapper">
                    <span className="field-icon">🏷️</span>
                    <select
                      id="reg-role"
                      value={form.role}
                      onChange={(e) => setForm({ ...form, role: e.target.value })}
                      className="auth-role-select"
                    >
                      <option value="customer">Customer / Traveler</option>
                      <option value="admin">System Administrator</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="form-grid-2">
                <div className="input-group">
                  <label htmlFor="reg-password">Password</label>
                  <div className="input-field-wrapper">
                    <span className="field-icon">🔒</span>
                    <input
                      id="reg-password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      autoComplete="new-password"
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      placeholder="Min 3 characters"
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

                <div className="input-group">
                  <label htmlFor="reg-confirm">Confirm Password</label>
                  <div className="input-field-wrapper">
                    <span className="field-icon">🔒</span>
                    <input
                      id="reg-confirm"
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      autoComplete="new-password"
                      value={form.confirmPassword}
                      onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                      placeholder="Re-enter password"
                    />
                    <button
                      type="button"
                      className="password-toggle-btn"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                      tabIndex="-1"
                    >
                      {showConfirmPassword ? '🙈' : '👁️'}
                    </button>
                  </div>
                </div>
              </div>

              <p className="auth-password-hint">
                Minimum 3 characters (e.g. 123).
              </p>

              <button type="submit" className="btn-auth-submit" disabled={submitting}>
                {submitting ? (
                  <span className="btn-loading-state">
                    <span className="auth-spinner"></span>
                    Creating Account…
                  </span>
                ) : (
                  <span>Register Account ➔</span>
                )}
              </button>

              <div className="auth-divider">
                <span>or</span>
              </div>

              <div className="auth-alt-action">
                <p>
                  Already have an account?{' '}
                  <Link to="/login" className="auth-switch-link">
                    Sign in to your account
                  </Link>
                </p>
              </div>

              <div className="auth-security-footer">
                <span>🔒 256-Bit SSL Encrypted • GST Compliant • Tamil Nadu Depature Network</span>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
