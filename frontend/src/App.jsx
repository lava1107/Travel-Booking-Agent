import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
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
import ApiAccess from './pages/ApiAccess';
import Login from './pages/Login';
import Register from './pages/Register';

// Protected Customer Pages
import CustomerDashboard from './pages/CustomerDashboard';
import MyBookings from './pages/MyBookings';
import PaymentDashboard from './pages/PaymentDashboard';
import NotificationsPage from './pages/NotificationsPage';
import Profile from './pages/Profile';

// Portals
import AgentDashboard from './pages/AgentDashboard';
import AdminDashboard from './pages/AdminDashboard';

export default function App() {
  return (
    <LanguageProvider>
      <RecentProvider>
        <AuthProvider>
          <div className="app-layout">
            <Navbar />

            <div className="main-content-wrapper">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
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
                <Route path="/api-access" element={<ApiAccess />} />

                {/* Auth */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Protected Customer Routes */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['customer', 'admin', 'agent']}>
                      <CustomerDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/my-trips"
                  element={
                    <ProtectedRoute>
                      <MyBookings />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/my-bookings"
                  element={
                    <ProtectedRoute>
                      <MyBookings />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/bookings"
                  element={
                    <ProtectedRoute>
                      <MyBookings />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/payments"
                  element={
                    <ProtectedRoute>
                      <PaymentDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/notifications"
                  element={
                    <ProtectedRoute>
                      <NotificationsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  }
                />

                {/* Travel Agent Portal */}
                <Route
                  path="/agent"
                  element={
                    <ProtectedRoute allowedRoles={['agent', 'admin']}>
                      <AgentDashboard />
                    </ProtectedRoute>
                  }
                />

                {/* Admin Portal */}
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />

                {/* Catch-all redirect */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </div>

            <Footer />
            <ChatbotWidget />
          </div>
        </AuthProvider>
      </RecentProvider>
    </LanguageProvider>
  );
}
