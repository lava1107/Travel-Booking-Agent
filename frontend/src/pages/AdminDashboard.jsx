import { useState, useEffect } from 'react';
import api from '../api/client';
import { formatINR } from '../utils/currency';
import { useAuth } from '../context/AuthContext';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [allBookings, setAllBookings] = useState([]);
  const [allPackages, setAllPackages] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [aiConversations, setAiConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'bookings', 'users', 'packages', 'destinations', 'ai-monitoring', 'reports'
  const [message, setMessage] = useState('');
  const [selectedConv, setSelectedConv] = useState(null);

  // New Package Form State
  const [showPkgModal, setShowPkgModal] = useState(false);
  const [newPkg, setNewPkg] = useState({
    title: '',
    origin: 'Chennai',
    destination: '',
    destination_type: 'Domestic',
    category: 'Standard',
    amount: 25000,
    transport: 'Flight + Private Cab',
    hotel_category: '3-Star Deluxe',
    meals: 'Buffet Breakfast Included',
    duration_days: 5,
    available_seats: 15,
    description: '',
    image_url: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80',
    popular_from_tn: true,
  });

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes, bookingsRes, pkgsRes, destsRes, aiRes, reportsRes] = await Promise.all([
        api.get('/dashboard/stats'),
        api.get('/dashboard/users'),
        api.get('/bookings/all'),
        api.get('/trips'),
        api.get('/destinations'),
        api.get('/ai/conversations'),
        api.get('/reports/analytics'),
      ]);
      setStats(statsRes.data.stats);
      setUsersList(usersRes.data.data || []);
      setAllBookings(bookingsRes.data.data || []);
      setAllPackages(pkgsRes.data.data || []);
      setDestinations(destsRes.data.data || []);
      setAiConversations(aiRes.data.data || []);
      setAnalytics(reportsRes.data);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleToggleUserStatus = async (targetUser) => {
    const newStatus = !targetUser.is_active;
    try {
      await api.put(`/dashboard/users/${targetUser.id}/status`, { isActive: newStatus });
      setMessage(`User ${targetUser.email} has been ${newStatus ? 'activated' : 'deactivated'}.`);
      await fetchAdminData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update user status.');
    }
  };

  const handleUpdateBookingStatus = async (bookingId, newStatus) => {
    try {
      await api.put(`/bookings/${bookingId}/status`, { status: newStatus });
      setMessage(`Booking #${bookingId} status updated to ${newStatus}.`);
      await fetchAdminData();
    } catch (err) {
      alert('Failed to update booking status.');
    }
  };

  const handleCreatePackage = async (e) => {
    e.preventDefault();
    try {
      await api.post('/trips', newPkg);
      setMessage(`Package "${newPkg.title}" published successfully.`);
      setShowPkgModal(false);
      await fetchAdminData();
    } catch (err) {
      alert('Failed to publish package.');
    }
  };

  const handleDeletePackage = async (pkgId) => {
    if (!window.confirm('Are you sure you want to deactivate this package?')) return;
    try {
      await api.delete(`/trips/${pkgId}`);
      setMessage('Package removed from catalog.');
      await fetchAdminData();
    } catch (err) {
      alert('Failed to remove package.');
    }
  };

  return (
    <div className="dashboard-container">
      {/* Banner */}
      <div className="dashboard-banner">
        <div>
          <h1>System Administration & Operations Suite 🛡️</h1>
          <p>
            Logged in as <strong>{user?.name || user?.email}</strong> • Full Platform Management Authority
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <span style={{ background: '#ecfdf5', color: '#065f46', padding: '0.35rem 0.85rem', borderRadius: 'var(--radius-full)', fontSize: '0.85rem', fontWeight: '700' }}>
            🟢 Live Python FastAPI Backend • Machine Learning Engine Active
          </span>
        </div>
      </div>

      {message && (
        <div style={{ background: '#ecfdf5', border: '1px solid #10b981', color: '#065f46', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
          {message}
        </div>
      )}

      {/* Metrics Row */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-icon">💰</div>
          <div className="metric-data">
            <span className="metric-val">{formatINR(stats?.totalRevenue || 0, true)}</span>
            <span className="metric-title">Platform Revenue (INR)</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">📑</div>
          <div className="metric-data">
            <span className="metric-val">{stats?.totalBookings || allBookings.length}</span>
            <span className="metric-title">Total Bookings</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">👥</div>
          <div className="metric-data">
            <span className="metric-val">{stats?.totalUsers || usersList.length}</span>
            <span className="metric-title">Registered Accounts</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">🤖</div>
          <div className="metric-data">
            <span className="metric-val">{aiConversations.length}</span>
            <span className="metric-title">AI Agent Conversations</span>
          </div>
        </div>
      </div>

      {/* Admin Nav Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '2px solid var(--border-light)', flexWrap: 'wrap' }}>
        {[
          { key: 'overview', label: '📊 Analytics & Overview' },
          { key: 'bookings', label: `📑 Bookings (${allBookings.length})` },
          { key: 'users', label: `👥 Customers & Agents (${usersList.length})` },
          { key: 'packages', label: `📦 Package Management (${allPackages.length})` },
          { key: 'destinations', label: `🏝️ Destinations (${destinations.length})` },
          { key: 'ai-monitoring', label: `🤖 AI Monitoring (${aiConversations.length})` },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            style={{
              padding: '0.75rem 1.25rem',
              fontWeight: '700',
              fontSize: '0.92rem',
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === tab.key ? '3px solid var(--primary)' : '3px solid transparent',
              color: activeTab === tab.key ? 'var(--primary)' : 'var(--text-muted)',
              cursor: 'pointer',
              marginBottom: '-2px'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Analytics & Overview */}
      {activeTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Visual Charts Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.75rem' }}>
            {/* Chart 1: Revenue by Month */}
            <div style={{ background: '#fff', padding: '1.75rem', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-light)' }}>
              <h3 style={{ fontSize: '1.15rem', color: 'var(--primary)', marginBottom: '1.25rem' }}>
                Monthly Platform Volume (₹ INR)
              </h3>
              <div style={{ display: 'flex', alignItems: 'flex-end', height: '180px', gap: '1rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem' }}>
                {analytics?.monthly?.map((m, idx) => {
                  const maxRev = 350000;
                  const heightPct = Math.min(100, Math.round((m.revenue / maxRev) * 100));
                  return (
                    <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                      <span style={{ fontSize: '0.7rem', fontWeight: '700', color: 'var(--primary)', marginBottom: '0.25rem' }}>
                        ₹{Math.round(m.revenue / 1000)}k
                      </span>
                      <div style={{ width: '100%', height: `${heightPct}%`, background: 'linear-gradient(180deg, var(--secondary) 0%, var(--primary) 100%)', borderRadius: '4px 4px 0 0' }} />
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.4rem', whiteSpace: 'nowrap' }}>
                        {m.month.split(' ')[0]}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Chart 2: Domestic vs International */}
            <div style={{ background: '#fff', padding: '1.75rem', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-light)' }}>
              <h3 style={{ fontSize: '1.15rem', color: 'var(--primary)', marginBottom: '1.25rem' }}>
                Domestic vs International Distribution
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', fontWeight: '700', marginBottom: '0.25rem' }}>
                    <span>Domestic India Journeys</span>
                    <span>{analytics?.domestic_vs_international?.Domestic || 12} bookings</span>
                  </div>
                  <div style={{ height: '12px', background: '#e2e8f0', borderRadius: '6px', overflow: 'hidden' }}>
                    <div style={{ width: '70%', height: '100%', background: 'var(--secondary)' }} />
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', fontWeight: '700', marginBottom: '0.25rem' }}>
                    <span>International Departures</span>
                    <span>{analytics?.domestic_vs_international?.International || 5} bookings</span>
                  </div>
                  <div style={{ height: '12px', background: '#e2e8f0', borderRadius: '6px', overflow: 'hidden' }}>
                    <div style={{ width: '30%', height: '100%', background: 'var(--accent-coral)' }} />
                  </div>
                </div>

                <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '0.75rem', marginTop: '0.5rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  🤖 <strong>AI Impact:</strong> {analytics?.ai_metrics?.ai_bookings || 0} automated bookings created directly via Conversational AI Concierge.
                </div>
              </div>
            </div>

            {/* Chart 3: Package Categories */}
            <div style={{ background: '#fff', padding: '1.75rem', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-light)' }}>
              <h3 style={{ fontSize: '1.15rem', color: 'var(--primary)', marginBottom: '1.25rem' }}>
                Active Package Tiers (No Luxury-Only Lock)
              </h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.65rem' }}>
                {Object.entries(analytics?.package_categories || {}).map(([cat, count]) => (
                  <div key={cat} style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', padding: '0.75rem 1rem', display: 'flex', flexDirection: 'column', minWidth: '100px' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '700' }}>{cat.toUpperCase()}</span>
                    <span style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--primary)' }}>{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Bookings Management */}
      {activeTab === 'bookings' && (
        <div style={{ background: '#fff', padding: '1.75rem', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-light)' }}>
          <h3 style={{ fontSize: '1.25rem', color: 'var(--primary)', marginBottom: '1.25rem' }}>
            Platform Bookings Database
          </h3>
          <div className="custom-table-wrap">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>PNR</th>
                  <th>Customer</th>
                  <th>Package & Route</th>
                  <th>Date</th>
                  <th>Travelers</th>
                  <th>Total Billed</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {allBookings.map((b) => (
                  <tr key={b.id}>
                    <td><strong>{b.booking_code}</strong></td>
                    <td>
                      <div>{b.customer_name}</div>
                      <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>{b.customer_email}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: '600' }}>{b.trip_title}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{b.source} ➔ {b.destination}</div>
                    </td>
                    <td>{new Date(b.travel_date).toLocaleDateString()}</td>
                    <td>{b.travelers_count} Pax</td>
                    <td><strong style={{ color: 'var(--primary)' }}>{formatINR(b.total_amount)}</strong></td>
                    <td>
                      <span className={`status-badge status-${b.status}`}>
                        {b.status.toUpperCase()}
                      </span>
                    </td>
                    <td>
                      {b.status !== 'cancelled' && (
                        <button
                          type="button"
                          onClick={() => handleUpdateBookingStatus(b.id, 'cancelled')}
                          style={{ padding: '0.3rem 0.65rem', background: '#fee2e2', color: '#991b1b', border: '1px solid #fca5a5', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer' }}
                        >
                          Cancel / Refund
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Users Management */}
      {activeTab === 'users' && (
        <div style={{ background: '#fff', padding: '1.75rem', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-light)' }}>
          <h3 style={{ fontSize: '1.25rem', color: 'var(--primary)', marginBottom: '1.25rem' }}>
            Registered Users & Role Control
          </h3>
          <div className="custom-table-wrap">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>User ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {usersList.map((u) => (
                  <tr key={u.id}>
                    <td>#{u.id}</td>
                    <td><strong>{u.name}</strong></td>
                    <td>{u.email}</td>
                    <td>{u.phone || '—'}</td>
                    <td>
                      <span className={`role-badge role-${u.role}`}>{u.role}</span>
                    </td>
                    <td>
                      <span style={{ color: u.is_active ? '#16a34a' : '#dc2626', fontWeight: '700', fontSize: '0.85rem' }}>
                        {u.is_active ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td>
                      <button
                        type="button"
                        onClick={() => handleToggleUserStatus(u)}
                        style={{ padding: '0.3rem 0.65rem', borderRadius: '4px', border: '1px solid var(--border-light)', background: '#fff', cursor: 'pointer', fontSize: '0.8rem' }}
                      >
                        {u.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Package Management */}
      {activeTab === 'packages' && (
        <div style={{ background: '#fff', padding: '1.75rem', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-light)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.25rem', color: 'var(--primary)' }}>
              Travel Packages Catalogue ({allPackages.length})
            </h3>
            <button
              type="button"
              className="btn-coral"
              onClick={() => setShowPkgModal(true)}
            >
              + Create New Package
            </button>
          </div>

          <div className="custom-table-wrap">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Title</th>
                  <th>Origin</th>
                  <th>Destination</th>
                  <th>Category</th>
                  <th>Rate / Pax</th>
                  <th>Slots</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {allPackages.map((p) => (
                  <tr key={p.id}>
                    <td>#{p.id}</td>
                    <td><strong>{p.title}</strong></td>
                    <td>{p.origin || p.source}</td>
                    <td>{p.destination}</td>
                    <td>
                      <span className={`cat-badge cat-${(p.category || 'Standard').toLowerCase()}`}>
                        {p.category}
                      </span>
                    </td>
                    <td>{formatINR(p.amount)}</td>
                    <td>{p.available_seats}</td>
                    <td>
                      <button
                        type="button"
                        onClick={() => handleDeletePackage(p.id)}
                        style={{ padding: '0.3rem 0.65rem', background: '#fee2e2', color: '#991b1b', border: '1px solid #fca5a5', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer' }}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 5: Destinations */}
      {activeTab === 'destinations' && (
        <div style={{ background: '#fff', padding: '1.75rem', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-light)' }}>
          <h3 style={{ fontSize: '1.25rem', color: 'var(--primary)', marginBottom: '1.25rem' }}>
            Destination Hubs & Tamil Nadu Routes
          </h3>
          <div className="dest-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
            {destinations.map((d) => (
              <div key={d.id} className="dest-card" style={{ height: '280px' }}>
                <img src={d.image_url} alt={d.name} className="dest-img" />
                <div className="dest-overlay">
                  <span className="dest-tag">{d.type} • {d.country}</span>
                  <h3 className="dest-name">{d.name}</h3>
                  <div style={{ fontSize: '0.8rem', color: '#fed7aa' }}>From {formatINR(d.starting_price)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 6: AI Agent Monitoring */}
      {activeTab === 'ai-monitoring' && (
        <div style={{ background: '#fff', padding: '1.75rem', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-light)' }}>
          <h3 style={{ fontSize: '1.25rem', color: 'var(--primary)', marginBottom: '1.25rem' }}>
            Conversational AI Agent Monitoring & Audit Logs
          </h3>

          <div className="custom-table-wrap">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Session ID</th>
                  <th>Customer</th>
                  <th>Intent</th>
                  <th>Tools Called</th>
                  <th>Handoff</th>
                  <th>Status</th>
                  <th>Inspect</th>
                </tr>
              </thead>
              <tbody>
                {aiConversations.map((c) => (
                  <tr key={c.conversation_id}>
                    <td><code>{c.conversation_id}</code></td>
                    <td>
                      <div><strong>{c.customer_name}</strong></div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{c.customer_email}</div>
                    </td>
                    <td>
                      <span style={{ background: 'var(--primary-light)', color: 'var(--primary)', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: '700' }}>
                        {c.intent}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                        {c.tools_called?.map((t, idx) => (
                          <span key={idx} style={{ fontSize: '0.7rem', background: '#f1f5f9', padding: '0.1rem 0.35rem', borderRadius: '3px' }}>
                            {t}()
                          </span>
                        ))}
                      </div>
                    </td>
                    <td>
                      <span style={{ color: c.human_handoff ? '#d97706' : '#16a34a', fontWeight: '700', fontSize: '0.85rem' }}>
                        {c.human_handoff ? 'YES' : 'NO'}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge ${c.human_handoff ? 'status-pending' : 'status-confirmed'}`}>
                        {c.status || 'Active'}
                      </span>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="btn-secondary"
                        onClick={() => setSelectedConv(c)}
                        style={{ padding: '0.35rem 0.65rem', fontSize: '0.78rem' }}
                      >
                        Transcript
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Inspect AI Chat Transcript Modal */}
      {selectedConv && (
        <div className="modal-overlay" onClick={() => setSelectedConv(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '640px' }}>
            <div className="modal-header">
              <h3 style={{ color: 'var(--primary)' }}>
                AI Session Transcript: {selectedConv.customer_name}
              </h3>
              <button className="modal-close-btn" onClick={() => setSelectedConv(null)}>✕</button>
            </div>

            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: 'var(--radius-md)', maxHeight: '350px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
              {selectedConv.messages?.map((m, idx) => (
                <div
                  key={idx}
                  style={{
                    background: m.role === 'user' ? 'var(--primary-light)' : '#fff',
                    border: '1px solid var(--border-light)',
                    padding: '0.75rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                    maxWidth: '85%'
                  }}
                >
                  <div style={{ fontSize: '0.72rem', fontWeight: '800', color: m.role === 'user' ? 'var(--primary)' : 'var(--secondary)', marginBottom: '0.2rem', textTransform: 'uppercase' }}>
                    {m.role === 'user' ? 'Customer' : 'AI Agent'}
                  </div>
                  <div style={{ fontSize: '0.88rem', color: 'var(--text-dark)', whiteSpace: 'pre-wrap' }}>{m.text}</div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button type="button" className="btn-primary" onClick={() => setSelectedConv(null)}>
                Close Transcript
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Package Modal */}
      {showPkgModal && (
        <div className="modal-overlay" onClick={() => setShowPkgModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h3 style={{ color: 'var(--primary)' }}>Create New Travel Package</h3>
              <button className="modal-close-btn" onClick={() => setShowPkgModal(false)}>✕</button>
            </div>

            <form onSubmit={handleCreatePackage} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label>Package Title</label>
                <input
                  type="text"
                  value={newPkg.title}
                  onChange={(e) => setNewPkg({ ...newPkg, title: e.target.value })}
                  placeholder="e.g. Ooty & Kodaikanal Hill Station Retreat"
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Origin (Tamil Nadu)</label>
                  <input
                    type="text"
                    value={newPkg.origin}
                    onChange={(e) => setNewPkg({ ...newPkg, origin: e.target.value, source: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Destination</label>
                  <input
                    type="text"
                    value={newPkg.destination}
                    onChange={(e) => setNewPkg({ ...newPkg, destination: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Category</label>
                  <select
                    value={newPkg.category}
                    onChange={(e) => setNewPkg({ ...newPkg, category: e.target.value })}
                  >
                    <option value="Budget">Budget</option>
                    <option value="Economy">Economy</option>
                    <option value="Standard">Standard</option>
                    <option value="Premium">Premium</option>
                    <option value="Luxury">Luxury</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Rate / Traveler (₹)</label>
                  <input
                    type="number"
                    value={newPkg.amount}
                    onChange={(e) => setNewPkg({ ...newPkg, amount: Number(e.target.value) })}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Brief Description</label>
                <textarea
                  rows="3"
                  value={newPkg.description}
                  onChange={(e) => setNewPkg({ ...newPkg, description: e.target.value })}
                  style={{ padding: '0.65rem', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--border-light)' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" className="btn-secondary" onClick={() => setShowPkgModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-coral">
                  Publish Package
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
