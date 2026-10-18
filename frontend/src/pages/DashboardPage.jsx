import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Timer from '../components/Timer';
import ShopModal from '../components/ShopModal';
import FeedModal from '../components/FeedModal';
import PetDisplay from '../components/PetDisplay';
import LevelUpModal from '../components/LevelUpModal';
import { Utensils, ShoppingBag } from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [isFeedOpen, setIsFeedOpen] = useState(false);
  const [isStudying, setIsStudying] = useState(false);
  const [levelUpData, setLevelUpData] = useState(null); // { newLevel: 2, isOpen: true }

  const pet = user?.pet;

  // Sayaç tamamlandığında seviye atlama kontrolünü tetikleyen callback
  const handleSessionComplete = (updatedPet) => {
    const previousLevel = pet?.level || 1;
    if (updatedPet && updatedPet.level > previousLevel) {
      setLevelUpData({
        isOpen: true,
        newLevel: updatedPet.level,
        petName: updatedPet.name || pet?.name,
        petType: updatedPet.type || pet?.type
      });
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-4 md:py-8 animate-fadeIn">
      {/* Üst Bilgi Başlığı */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-white tracking-wide">
            Çalışma Odası 🎮
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Odaklan, jetonları topla ve{' '}
            <span className="text-retro-accent font-bold">{pet?.name || 'Dostun'}</span>'u mutlu et!
          </p>
        </div>
      </div>

      {/* İki Sütunlu Grid Düzeni */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* SOL SÜTUN: Hayvanın Sanal Odası (PetDisplay & Besleme Aksiyonları) */}
        <div className="lg:col-span-5 bg-retro-card border border-purple-900/40 p-6 rounded-3xl shadow-xl flex flex-col gap-6">
          
          {/* Hayvanın Dinamik Görünümü (cat, dog, rabbit + açlık modları) */}
          <PetDisplay 
            pet={pet} 
            isStudying={isStudying} 
            isLevelingUp={!!levelUpData?.isOpen} 
          />

          {/* Tecrübe (XP) İlerleme Barı */}
          <div className="bg-retro-dark/70 border border-purple-900/30 p-4 rounded-2xl">
            <div className="flex justify-between text-xs font-bold mb-2">
              <span className="text-gray-300">Seviye İlerlemesi (XP)</span>
              <span className="text-retro-accent font-mono font-bold">
                {pet?.xp || 0} / {(pet?.level || 1) * 100} XP
              </span>
            </div>
            <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-purple-900/40 p-0.5">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-retro-accent rounded-full transition-all duration-500 shadow-sm"
                style={{
                  width: `${Math.min(100, ((pet?.xp || 0) / ((pet?.level || 1) * 100)) * 100)}%`
                }}
              />
            </div>
          </div>

          {/* Hızlı Aksiyon Butonları */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setIsFeedOpen(true)}
              className="flex items-center justify-center gap-2 bg-pink-950/40 hover:bg-pink-900/50 border border-pink-600/40 text-rose-300 font-bold py-3 rounded-xl text-xs transition-colors shadow-sm"
            >
              <Utensils size={16} />
              <span>Dostunu Besle</span>
            </button>
            <button
              onClick={() => setIsShopOpen(true)}
              className="flex items-center justify-center gap-2 bg-yellow-950/40 hover:bg-yellow-900/50 border border-yellow-600/40 text-retro-accent font-bold py-3 rounded-xl text-xs transition-colors shadow-sm"
            >
              <ShoppingBag size={16} />
              <span>Sanal Mağaza</span>
            </button>
          </div>
        </div>

        {/* SAĞ SÜTUN: Pomodoro Odak Sayacı */}
        <div className="lg:col-span-7">
          <Timer 
            onStateChange={(studying) => setIsStudying(studying)} 
            onSessionComplete={handleSessionComplete} 
          />
        </div>
      </div>

      {/* Modallar */}
      <ShopModal 
        isOpen={isShopOpen} 
        onClose={() => setIsShopOpen(false)} 
      />
      
      <FeedModal
        isOpen={isFeedOpen}
        onClose={() => setIsFeedOpen(false)}
        onOpenShop={() => setIsShopOpen(true)}
      />

      <LevelUpModal
        isOpen={levelUpData?.isOpen}
        onClose={() => setLevelUpData(null)}
        newLevel={levelUpData?.newLevel}
        petName={levelUpData?.petName || pet?.name}
        petType={levelUpData?.petType || pet?.type}
      />
    </div>
  );
}