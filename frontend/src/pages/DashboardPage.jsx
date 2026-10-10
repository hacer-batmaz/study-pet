import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Timer from '../components/Timer';
import ShopModal from '../components/ShopModal';
import FeedModal from '../components/FeedModal';
import { Heart, Award, Utensils, ShoppingBag } from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [isFeedOpen, setIsFeedOpen] = useState(false);
  const pet = user?.pet;

  const getPetEmoji = (type) => {
    switch (type) {
      case 'dog': return '🐶';
      case 'rabbit': return '🐰';
      default: return '🐱';
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Üst Bilgi Başlığı */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white">
            Çalışma Odası 🎮
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Odaklan, jetonları topla ve <span className="text-retro-pink font-semibold">{pet?.name}</span>'i mutlu et!
          </p>
        </div>
      </div>

      {/* İki Sütunlu Grid Düzeni */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* SOL SÜTUN: Hayvanın Sanal Odası */}
        <div className="lg:col-span-5 bg-retro-card border border-purple-900/40 p-6 rounded-2xl shadow-xl flex flex-col items-center">
          <div className="w-full flex items-center justify-between border-b border-purple-900/40 pb-4 mb-6">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>{pet?.name}</span>
                <span className="text-xs bg-purple-950/80 text-retro-purple px-2 py-0.5 rounded-full font-bold">
                  Lv. {pet?.level || 1}
                </span>
              </h2>
            </div>
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider"></span>
          </div>

          {/* Hayvan Sahnesi */}
          <div className="w-full aspect-square max-w-[260px] bg-retro-dark/80 border-2 border-purple-900/50 rounded-2xl flex flex-col items-center justify-center p-6 mb-6 shadow-inner relative overflow-hidden">
            <span className="text-8xl select-none animate-bounce drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)]">
              {getPetEmoji(pet?.type)}
            </span>
            <div className="absolute bottom-3 text-xs text-gray-500 font-mono">
              {pet?.hungerLevel && pet.hungerLevel < 30 ? '😴 Çok aç ve yorgun...' : '✨ Odaklanmanı bekliyor!'}
            </div>
          </div>

          {/* Barlar: Açlık & XP */}
          <div className="w-full space-y-4 mb-6">
            <div>
              <div className="flex justify-between text-xs font-bold mb-1.5">
                <span className="flex items-center gap-1 text-retro-pink">
                  <Heart size={14} className="fill-retro-pink" />
                  <span>Açlık Durumu</span>
                </span>
                <span className="text-gray-300">%{pet?.hungerLevel || 0}</span>
              </div>
              <div className="w-full bg-retro-dark h-3 rounded-full overflow-hidden border border-purple-900/40 p-0.5">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${(pet?.hungerLevel || 0) > 50
                      ? 'bg-retro-green'
                      : (pet?.hungerLevel || 0) > 25
                        ? 'bg-yellow-400'
                        : 'bg-red-500'
                    }`}
                  style={{ width: `${pet?.hungerLevel || 0}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold mb-1.5">
                <span className="flex items-center gap-1 text-retro-accent">
                  <Award size={14} />
                  <span>Tecrübe (XP)</span>
                </span>
                <span className="text-gray-300">{pet?.xp || 0} / {(pet?.level || 1) * 100}</span>
              </div>
              <div className="w-full bg-retro-dark h-3 rounded-full overflow-hidden border border-purple-900/40 p-0.5">
                <div
                  className="h-full bg-retro-accent rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, ((pet?.xp || 0) / ((pet?.level || 1) * 100)) * 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Aksiyon Butonları */}
          <div className="w-full grid grid-cols-2 gap-3">
            <button
              onClick={() => setIsFeedOpen(true)}
              className="flex items-center justify-center gap-1.5 bg-pink-950/40 hover:bg-pink-900/50 border border-pink-600/40 text-retro-pink font-bold py-2.5 rounded-xl text-xs transition-colors"
            >
              <Utensils size={15} />
              <span>Besle</span>
            </button>
            <button
              onClick={() => setIsShopOpen(true)}
              className="flex items-center justify-center gap-1.5 bg-yellow-950/40 hover:bg-yellow-900/50 border border-yellow-600/40 text-retro-accent font-bold py-2.5 rounded-xl text-xs transition-colors"
            >
              <ShoppingBag size={15} />
              <span>Mağaza</span>
            </button>
          </div>
        </div>

        {/* SAĞ SÜTUN: Pomodoro Odak Sayacı */}
        <div className="lg:col-span-7">
          <Timer />
        </div>
      </div>

      {/* Modallar */}
      <ShopModal isOpen={isShopOpen} onClose={() => setIsShopOpen(false)} />
      <FeedModal
        isOpen={isFeedOpen}
        onClose={() => setIsFeedOpen(false)}
        onOpenShop={() => setIsShopOpen(true)}
      />
    </div>
  );
}