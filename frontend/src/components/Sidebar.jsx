import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Clock, 
  ShoppingBag, 
  BarChart2, 
  LogOut, 
  Coins, 
  Heart, 
  Sparkles,
  Menu,
  X
} from 'lucide-react';
import ShopModal from './ShopModal';
import StatsModal from './StatsModal';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [isStatsOpen, setIsStatsOpen] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const pet = user?.pet;

  return (
    <>
      {/* Mobilde Menü Açma Butonu */}
      <div className="md:hidden fixed top-4 left-4 z-40">
        <button
          onClick={() => setIsMobileOpen(true)}
          className="p-2.5 rounded-xl bg-retro-card border border-purple-900/40 text-retro-purple hover:text-white shadow-lg"
          aria-label="Menüyü Aç"
        >
          <Menu size={22} />
        </button>
      </div>

      {/* Mobilde Karartma Arka Planı */}
      {isMobileOpen && (
        <div 
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 md:hidden animate-fadeIn"
        />
      )}

      {/* Ana Sidebar Çubuğu */}
      <aside
        className={`fixed md:sticky top-0 left-0 h-screen w-64 bg-retro-card border-r border-purple-900/40 p-5 flex flex-col justify-between z-50 transition-transform duration-300 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Üst Kısım: Logo ve Kapat Butonu */}
        <div>
          <div className="flex items-center justify-between pb-6 border-b border-purple-900/40 mb-6">
            <div className="flex items-center gap-2.5">
              <span className="text-3xl select-none">🐱</span>
              <div>
                <h1 className="text-xl font-black tracking-wider text-retro-accent">
                  Study<span className="text-white">Pet</span>
                </h1>
                <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
                  Odaklan & Büyüt
                </p>
              </div>
            </div>

            {/* Mobilde Kapat Butonu */}
            <button
              onClick={() => setIsMobileOpen(false)}
              className="md:hidden text-gray-400 hover:text-white p-1 rounded-lg"
            >
              <X size={20} />
            </button>
          </div>

          {/* Hayvan & Kullanıcı Durum Kartı */}
          <div className="bg-retro-dark/80 border border-purple-900/40 rounded-2xl p-4 mb-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-white truncate">
                {pet?.name || 'Sanal Dostun'}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-950/80 text-retro-purple border border-purple-800/40">
                Lvl {pet?.level || 1}
              </span>
            </div>

            {/* Açlık Barı */}
            <div className="space-y-1 mb-2">
              <div className="flex justify-between text-[11px] text-gray-400">
                <span className="flex items-center gap-1">
                  <Heart size={12} className="text-red-400" /> Açlık
                </span>
                <span className="font-mono text-gray-200">
                  {pet?.hungerLevel ?? 100}/100
                </span>
              </div>
              <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-purple-900/30">
                <div
                  className="bg-gradient-to-r from-red-500 to-rose-400 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${pet?.hungerLevel ?? 100}%` }}
                />
              </div>
            </div>

            {/* Jeton Göstergesi */}
            <div className="flex items-center justify-between pt-2 border-t border-purple-900/30 text-xs">
              <span className="text-gray-400">Bakiye</span>
              <div className="flex items-center gap-1 text-retro-accent font-mono font-bold">
                <Coins size={14} />
                <span>{user?.coins ?? 0}</span>
              </div>
            </div>
          </div>

          {/* Menü Butonları */}
          <nav className="space-y-2">
            <button
              onClick={() => setIsMobileOpen(false)}
              className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl bg-retro-purple/20 border border-retro-purple/40 text-retro-purple hover:bg-retro-purple/30 font-bold text-xs transition-colors"
            >
              <Clock size={18} />
              <span>Çalışma Sayacı</span>
            </button>

            <button
              onClick={() => {
                setIsShopOpen(true);
                setIsMobileOpen(false);
              }}
              className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl bg-retro-dark/60 hover:bg-yellow-950/40 border border-purple-900/30 hover:border-yellow-500/40 text-gray-300 hover:text-yellow-400 font-bold text-xs transition-colors"
            >
              <ShoppingBag size={18} />
              <span>Sanal Mağaza</span>
            </button>

            <button
              onClick={() => {
                setIsStatsOpen(true);
                setIsMobileOpen(false);
              }}
              className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl bg-retro-dark/60 hover:bg-purple-950/60 border border-purple-900/30 hover:border-purple-600/40 text-gray-300 hover:text-purple-300 font-bold text-xs transition-colors"
            >
              <BarChart2 size={18} />
              <span>İstatistikler & Geçmiş</span>
            </button>
          </nav>
        </div>

        {/* Alt Kısım: Çıkış Yap */}
        <div className="pt-4 border-t border-purple-900/40">
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-red-500/20 bg-red-950/30 hover:bg-red-950/60 text-red-300 font-bold text-xs transition-colors"
          >
            <LogOut size={16} />
            <span>Çıkış Yap</span>
          </button>
        </div>
      </aside>

      {/* Modallar */}
      <ShopModal isOpen={isShopOpen} onClose={() => setIsShopOpen(false)} />
      <StatsModal isOpen={isStatsOpen} onClose={() => setIsStatsOpen(false)} />
    </>
  );
}