import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import { LogOut, BarChart2 } from 'lucide-react';
import StatsModal from './StatsModal';
import LogoutConfirmModal from './LogoutConfirmModal';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [isStatsOpen, setIsStatsOpen] = useState(false);

  // Çıkış Onay Modalı ve Seans State'leri
  const [activeSessionToAbandon, setActiveSessionToAbandon] = useState(null);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);

  // Çıkış butonuna basıldığında aktif seansı denetle
  const handleLogoutClick = async () => {
    try {
      const res = await api.get('/sessions/active');
      const activeSession = res.data?.activeSession;

      if (activeSession && activeSession.remainingSeconds > 0) {
        setActiveSessionToAbandon(activeSession);
        setIsLogoutModalOpen(true);
        return;
      }
    } catch (err) {
      console.warn('Aktif seans sorgulanamadı:', err);
    }

    logout();
  };

  // Onaylandığında seansı terk et, cezayı uygula ve oturumu kapat
  const handleConfirmLogout = async () => {
    setLogoutLoading(true);
    try {
      if (activeSessionToAbandon?.id) {
        await api.post('/sessions/abandon', {
          sessionId: activeSessionToAbandon.id
        });
      }
    } catch (err) {
      console.error('Çıkışta seans iptal edilirken hata:', err);
    } finally {
      setLogoutLoading(false);
      setIsLogoutModalOpen(false);
      logout();
    }
  };

  return (
    <>
      <nav className="bg-retro-card border-b border-purple-900/40 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-2xl">🐱</span>
          <span className="text-xl font-bold tracking-wider text-retro-accent">
            Study<span className="text-white">Pet</span>
          </span>
        </Link>

        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-3">
              {/* İstatistikler Butonu */}
              <button
                type="button"
                onClick={() => setIsStatsOpen(true)}
                title="Çalışma İstatistikleri"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-950/60 hover:bg-purple-900/70 text-purple-300 hover:text-white border border-purple-800/40 transition-colors text-xs font-bold"
              >
                <BarChart2 size={16} />
                <span className="hidden sm:inline">İstatistikler</span>
              </button>

              {/* Jeton Göstergesi */}
              <span className="text-retro-accent text-sm font-semibold">🪙 {user.coins}</span>

              {/* Kontrollü Çıkış Butonu */}
              <button
                onClick={handleLogoutClick}
                className="text-gray-400 hover:text-red-400 p-1.5 transition-colors"
                title="Çıkış"
              >
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/login" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">
                Giriş Yap
              </Link>
              <Link
                to="/register"
                className="text-sm font-medium bg-retro-purple hover:bg-purple-600 text-white px-4 py-1.5 rounded-lg transition-colors"
              >
                Kayıt Ol
              </Link>
            </div>
          )}
        </div>
      </nav>

      {/* İstatistik Modalı */}
      <StatsModal 
        isOpen={isStatsOpen} 
        onClose={() => setIsStatsOpen(false)} 
      />

      {/* Çıkış Uyarı Modalı */}
      <LogoutConfirmModal
        isOpen={isLogoutModalOpen}
        onCancel={() => setIsLogoutModalOpen(false)}
        onConfirm={handleConfirmLogout}
        loading={logoutLoading}
      />
    </>
  );
}