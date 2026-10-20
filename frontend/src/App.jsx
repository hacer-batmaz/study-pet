import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import DashboardLayout from './components/DashboardLayout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import AdminPage from './pages/AdminPage';

// Giriş yapılmamışsa login'e atan koruma bileşeni
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-gray-400">Yükleniyor...</div>;
  }

  return user ? children : <Navigate to="/login" replace />;
}

// Yalnızca ADMIN rolündeki kullanıcıların erişimine izin veren koruma bileşeni
function AdminRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-gray-400">Yükleniyor...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== 'ADMIN') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

// Halka açık sayfaların üstünde Navbar, altında Footer olan düzen
function PublicLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col justify-between">
      <Navbar />
      <main className="flex-1 flex flex-col">{children}</main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-retro-dark text-gray-100 font-sans">
          <Routes>
            {/* Halka Açık Sayfalar (Navbar + Sayfa + Footer) */}
            <Route
              path="/"
              element={
                <PublicLayout>
                  <HomePage />
                </PublicLayout>
              }
            />
            <Route
              path="/login"
              element={
                <PublicLayout>
                  <LoginPage />
                </PublicLayout>
              }
            />
            <Route
              path="/register"
              element={
                <PublicLayout>
                  <RegisterPage />
                </PublicLayout>
              }
            />

            {/* Korumalı Dashboard Sayfası (Sidebar + DashboardPage + Footer) */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <DashboardPage />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />

            {/* Korumalı Yönetim Paneli Sayfası (Yalnızca ADMIN) */}
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <DashboardLayout>
                    <AdminPage />
                  </DashboardLayout>
                </AdminRoute>
              }
            />

            {/* Tanımsız rotalar için ana sayfaya yönlendir */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}