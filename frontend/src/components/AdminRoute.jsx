import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AdminRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-retro-dark text-gray-400">
        Yükleniyor...
      </div>
    );
  }

  // Giriş yapılmamışsa login'e, giriş yapılmış ama admin değilse dashboard'a yönlendir
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== 'ADMIN') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}