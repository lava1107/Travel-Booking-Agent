import React from 'react';

import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { RecentProvider } from './context/RecentContext';
import ProtectedRoute from './routes/ProtectedRoute';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ChatbotWidget from './components/ChatbotWidget';

// Pages
import Home from './pages/Home';
import Explore from './pages/Explore';
import Packages from './pages/Packages';
import PackageDetails from './pages/PackageDetails';
import TripPlanner from './pages/TripPlanner';
import ComparePackages from './pages/ComparePackages';
import Offers from './pages/Offers';
import TransportPage from './pages/TransportPage';
import HotelsPage from './pages/HotelsPage';
import ReviewsPage from './pages/ReviewsPage';
import SupportPage from './pages/SupportPage';
import AboutContact from './pages/AboutContact';
import Login from './pages/Login';
import Register from './pages/Register';

// Protected Customer Pages
import CustomerDashboard from './pages/CustomerDashboard';
import MyBookings from './pages/MyBookings';
import PaymentDashboard from './pages/PaymentDashboard';
import NotificationsPage from './pages/NotificationsPage';
import Profile from './pages/Profile';

// Portals
import AdminDashboard from './pages/AdminDashboard';

function AppContent() {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return (
      <div
        className="page-loading"
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: '1rem',
          background: 'var(--bg-main)',
        }}
      >
        <div
          className="auth-spinner"
          style={{
            width: '42px',
            height: '42px',
            border: '4px solid var(--primary-light)',
            borderTopColor: 'var(--primary)',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
          }}
        ></div>
        <p style={{ color: 'var(--primary)', fontWeight: '700', fontSize: '1.05rem' }}>
          Initializing Lyan Travels Platform...
        </p>
      </div>
    );
  }

  // BEFORE LOGIN: Show Login or Register page ONLY. Entire system is gated.
  if (!isAuthenticated) {
    return (
      <div className="app-layout auth-locked-layout">
        <Navbar />
        <div className="main-content-wrapper">
          <Routes>
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </div>
        <Footer isAuthGate={true} />
      </div>
    );
  }

  // AFTER LOGIN: Entire system is unlocked with all portals, bookings, and AI concierge!
  return (
    <div className="app-layout">
      <Navbar />

      <div className="main-content-wrapper">
        <Routes>
          {/* Default authenticated landing */}
          <Route
            path="/"
            element={<Navigate to={user?.role === 'admin' ? '/admin' : '/dashboard'} replace />}
          />
          <Route path="/home" element={<Home />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/packages" element={<Packages />} />
          <Route path="/packages/:id" element={<PackageDetails />} />
          <Route path="/planner" element={<TripPlanner />} />
          <Route path="/compare" element={<ComparePackages />} />
          <Route path="/offers" element={<Offers />} />
          <Route path="/transport" element={<TransportPage />} />
          <Route path="/hotels" element={<HotelsPage />} />
          <Route path="/reviews" element={<ReviewsPage />} />
          <Route path="/support" element={<SupportPage />} />
          <Route path="/about" element={<AboutContact />} />
          <Route path="/contact" element={<AboutContact />} />

          {/* Auth redirects when already logged in */}
          <Route
            path="/login"
            element={<Navigate to={user?.role === 'admin' ? '/admin' : '/dashboard'} replace />}
          />
          <Route
            path="/register"
            element={<Navigate to={user?.role === 'admin' ? '/admin' : '/dashboard'} replace />}
          />

          {/* Member & Dashboard Pages */}
          <Route path="/dashboard" element={<CustomerDashboard />} />
          <Route path="/my-trips" element={<MyBookings />} />
          <Route path="/my-bookings" element={<MyBookings />} />
          <Route path="/bookings" element={<MyBookings />} />
          <Route path="/payments" element={<PaymentDashboard />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/profile" element={<Profile />} />

          {/* Admin Portal */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route
            path="*"
            element={<Navigate to={user?.role === 'admin' ? '/admin' : '/dashboard'} replace />}
          />
        </Routes>
      </div>

      <Footer />
      <ChatbotWidget />
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <RecentProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </RecentProvider>
    </LanguageProvider>
  );
}

