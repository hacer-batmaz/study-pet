import { useMemo } from 'react';
import { Heart, AlertCircle, Sparkles } from 'lucide-react';

// 3 Hayvan Türü ve Açlık Aralıklarına Göre Retro İfadeler & Karakterler
const PET_VISUALS = {
  cat: {
    name: 'Kedi',
    happy: { emoji: '😸', badge: 'Harika Hissediyor!', statusColor: 'text-emerald-400' },
    normal: { emoji: '🐱', badge: 'Keyfi Yerinde', statusColor: 'text-purple-300' },
    sad: { emoji: '😿', badge: 'Çok Aç ve Yorgun...', statusColor: 'text-rose-400' }
  },
  dog: {
    name: 'Köpek',
    happy: { emoji: '🐶', badge: 'Kuyruk Sallıyor!', statusColor: 'text-emerald-400' },
    normal: { emoji: '🐕', badge: 'Sadık Dostun', statusColor: 'text-purple-300' },
    sad: { emoji: '🥺', badge: 'Acıktı ve Üzgün...', statusColor: 'text-rose-400' }
  },
  rabbit: {
    name: 'Tavşan',
    happy: { emoji: '🐰', badge: 'Neşeyle Zıplıyor!', statusColor: 'text-emerald-400' },
    normal: { emoji: '🐇', badge: 'Havuç Bekliyor', statusColor: 'text-purple-300' },
    sad: { emoji: '🐇💧', badge: 'Halsiz Düştü...', statusColor: 'text-rose-400' }
  }
};

export default function PetDisplay({ pet, isStudying = false, isLevelingUp = false }) {
  const petType = (pet?.type || 'cat').toLowerCase();
  const hunger = pet?.hungerLevel ?? 100;

  // Açlık durumuna göre ruh halini belirle
  const mood = useMemo(() => {
    if (hunger >= 70) return 'happy';
    if (hunger >= 30) return 'normal';
    return 'sad';
  }, [hunger]);

  const currentVisual = PET_VISUALS[petType] || PET_VISUALS.cat;
  const moodData = currentVisual[mood];

  return (
    <div className="relative flex flex-col items-center justify-center p-6 bg-retro-dark/80 rounded-3xl border border-purple-900/40 select-none overflow-hidden">
      
      {/* Seviye Atlama Arka Plan Parıltısı */}
      {isLevelingUp && (
        <div className="absolute inset-0 bg-yellow-500/20 animate-pulse pointer-events-none rounded-3xl" />
      )}

      {/* Ruh Hali Durum Rozeti */}
      <div className="absolute top-4 left-4 flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/80 border border-purple-900/40 text-[11px] font-bold">
        {mood === 'happy' && <Sparkles size={12} className="text-yellow-400 animate-spin" />}
        {mood === 'sad' && <AlertCircle size={12} className="text-rose-400 animate-bounce" />}
        {mood === 'normal' && <Heart size={12} className="text-purple-400" />}
        <span className={moodData.statusColor}>{moodData.badge}</span>
      </div>

      {/* Seviye Etiketi */}
      <div className="absolute top-4 right-4 px-2.5 py-1 rounded-xl bg-purple-950/80 border border-purple-800/40 text-[11px] font-black text-retro-accent">
        Lvl {pet?.level || 1}
      </div>

      {/* Hayvan Görseli / Animasyon Kutusu */}
      <div className="relative my-6 flex items-center justify-center">
        {/* Odaklanma Halinde Çalışma Işığı */}
        {isStudying && (
          <div className="absolute -inset-4 bg-purple-600/20 blur-xl rounded-full animate-ping" />
        )}

        <div
          className={`text-7xl md:text-8xl transition-all duration-300 filter drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)] ${
            mood === 'happy'
              ? 'animate-bounce'
              : mood === 'sad'
              ? 'animate-pulse opacity-75 grayscale-[30%]'
              : isStudying
              ? 'animate-pulse'
              : ''
          } ${isLevelingUp ? 'scale-125 transition-transform' : ''}`}
        >
          {moodData.emoji}
        </div>
      </div>

      {/* Hayvan İsmi ve Türü */}
      <div className="text-center space-y-1">
        <h3 className="text-lg font-black text-white tracking-wide">
          {pet?.name || 'Sanal Dostun'}
        </h3>
        <p className="text-xs text-gray-400 font-medium">
          {currentVisual.name} • {pet?.xp || 0} XP
        </p>
      </div>

      {/* Açlık Göstergesi */}
      <div className="w-full max-w-xs mt-5 space-y-1.5">
        <div className="flex justify-between text-xs">
          <span className="flex items-center gap-1 font-bold text-gray-300">
            <Heart size={13} className={hunger < 30 ? 'text-rose-500 animate-ping' : 'text-rose-400'} />
            Açlık Seviyesi
          </span>
          <span className={`font-mono font-bold ${hunger < 30 ? 'text-rose-400' : 'text-gray-200'}`}>
            {hunger}/100
          </span>
        </div>

        {/* Açlık Barı */}
        <div className="w-full bg-slate-950 rounded-full h-3 overflow-hidden border border-purple-900/40 p-0.5">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              hunger >= 70
                ? 'bg-gradient-to-r from-emerald-500 to-green-400'
                : hunger >= 30
                ? 'bg-gradient-to-r from-yellow-500 to-amber-400'
                : 'bg-gradient-to-r from-rose-600 to-red-500 animate-pulse'
            }`}
            style={{ width: `${Math.max(5, Math.min(100, hunger))}%` }}
          />
        </div>
      </div>
    </div>
  );
}