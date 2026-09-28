import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export default function ProtectedPlaceholder({ title = 'Protected Page' }) {
  const { user, logout } = useAuth();

  return (
    <div className="dashboard">
      <h1>{title}</h1>
      <p>Signed in as <strong>{user?.email}</strong> ({user?.role})</p>
      <p>This protected module is reserved for authenticated users.</p>
      <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem' }}>
        <Link
          to={user?.role === 'admin' ? '/admin' : user?.role === 'agent' ? '/agent' : '/dashboard'}
          style={{ padding: '0.6rem 1rem', background: '#0f4c81', color: '#fff', borderRadius: '6px', textDecoration: 'none' }}
        >
          Back to Dashboard
        </Link>
        <button
          onClick={logout}
          style={{ padding: '0.6rem 1rem', background: '#c0392b', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
        >
          Log out
        </button>
      </div>
    </div>
  );
}
