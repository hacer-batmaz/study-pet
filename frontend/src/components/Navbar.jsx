import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, BarChart2 } from 'lucide-react';
import StatsModal from './StatsModal';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [isStatsOpen, setIsStatsOpen] = useState(false);

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

              {/* Çıkış Yap Butonu */}
              <button
                onClick={logout}
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

      {/* İstatistikler & Geçmiş Modalı */}
      <StatsModal 
        isOpen={isStatsOpen} 
        onClose={() => setIsStatsOpen(false)} 
      />
    </>
  );
}