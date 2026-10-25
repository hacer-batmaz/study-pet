import { useMemo } from 'react';
import { Heart, AlertCircle, Sparkles } from 'lucide-react';

//GIF animasyonlari
const PET_ANIMATIONS = {
  cat: {
    name: 'Kedi',
    cok_mutlu: {
      gif: '/assets/pets/cok_mutlu_kedi.gif',
      badge: 'Çok Mutlu & Enerjik!',
      statusColor: 'text-emerald-400'
    },
    normal: {
      gif: '/assets/pets/normal_kedi.gif',
      badge: 'Keyfi Yerinde',
      statusColor: 'text-purple-300'
    },
    mutsuz: {
      gif: '/assets/pets/mutsuz_kedi.gif',
      badge: 'Çok Aç ve Yorgun...',
      statusColor: 'text-rose-400'
    }
  },
  dog: {
    name: 'Köpek',
    cok_mutlu: {
      gif: '/assets/pets/cok_mutlu_kopek.gif',
      badge: 'Kuyruk Sallıyor!',
      statusColor: 'text-emerald-400'
    },
    normal: {
      gif: '/assets/pets/normal_kopek.gif',
      badge: 'Sakin ve Uysal',
      statusColor: 'text-purple-300'
    },
    mutsuz: {
      gif: '/assets/pets/mutsuz_kopek.gif',
      badge: 'Acıktı ve Halsiz...',
      statusColor: 'text-rose-400'
    }
  },
  rabbit: {
    name: 'Tavşan',
    cok_mutlu: {
      gif: '/assets/pets/cok_mutlu_tavsan.gif',
      badge: 'Neşeyle Zıplıyor!',
      statusColor: 'text-emerald-400'
    },
    normal: {
      gif: '/assets/pets/normal_tavsan.gif',
      badge: 'Havuç Bekliyor',
      statusColor: 'text-purple-300'
    },
    mutsuz: {
      gif: '/assets/pets/mutsuz_tavsan.gif',
      badge: 'Halsiz Düştü...',
      statusColor: 'text-rose-400'
    }
  }
};

export default function PetDisplay({ pet, isLevelingUp = false }) {
  const petType = (pet?.type || 'cat').toLowerCase();
  const hunger = pet?.hungerLevel ?? 100;

  const currentMood = useMemo(() => {
    if (hunger >= 70) return 'cok_mutlu';
    if (hunger >= 30) return 'normal';
    return 'mutsuz';
  }, [hunger]);

  const petConfig = PET_ANIMATIONS[petType] || PET_ANIMATIONS.cat;
  const activeVisual = petConfig[currentMood] || petConfig.normal;

  return (
    <div className="relative flex flex-col items-center justify-center p-6 bg-retro-dark/80 rounded-3xl border border-purple-900/40 select-none overflow-hidden">

      {/* Seviye Atlama Arka Plan Parıltısı */}
      {isLevelingUp && (
        <div className="absolute inset-0 bg-yellow-500/20 animate-pulse pointer-events-none rounded-3xl z-10" />
      )}

      {/* Ruh Hali Durum Rozeti */}
      <div className="absolute top-4 left-4 flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/80 border border-purple-900/40 text-[11px] font-bold z-10">
        {currentMood === 'cok_mutlu' && <Sparkles size={12} className="text-emerald-400 animate-spin" />}
        {currentMood === 'normal' && <Heart size={12} className="text-purple-400" />}
        {currentMood === 'mutsuz' && <AlertCircle size={12} className="text-rose-400 animate-bounce" />}
        <span className={activeVisual.statusColor}>{activeVisual.badge}</span>
      </div>

      {/* Seviye Etiketi */}
      <div className="absolute top-4 right-4 px-2.5 py-1 rounded-xl bg-purple-950/80 border border-purple-800/40 text-[11px] font-black text-retro-accent z-10">
        Lvl {pet?.level || 1}
      </div>

      {/* Hayvan GIF Animasyon Alanı */}
      <div className="relative my-4 w-44 h-44 sm:w-52 sm:h-52 flex items-center justify-center">
        {/* Retro Arka Plan Işık Efekti */}
        <div
          className={`absolute inset-0 rounded-full blur-2xl transition-all duration-500 -z-0 ${hunger >= 70
              ? 'bg-emerald-600/20'
              : hunger >= 30
                ? 'bg-purple-600/20'
                : 'bg-rose-600/20'
            }`}
        />

        {/* Canlı GIF Görseli */}
        <img
          src={activeVisual.gif}
          alt={`${pet?.name || 'Sanal Hayvan'} - ${currentMood}`}
          className={`w-full h-full object-contain pixelated drop-shadow-[0_12px_18px_rgba(0,0,0,0.6)] transition-transform duration-300 ${isLevelingUp ? 'scale-125' : 'scale-100'
            }`}
          style={{ imageRendering: 'pixelated' }}
        />
      </div>

      {/* Hayvan İsmi ve Türü */}
      <div className="text-center space-y-0.5 mt-1">
        <h3 className="text-lg font-black text-white tracking-wide">
          {pet?.name || 'Sanal Dostun'}
        </h3>
        <p className="text-xs text-gray-400 font-medium">
          {petConfig.name} • {pet?.xp || 0} XP
        </p>
      </div>

      {/* Açlık Göstergesi */}
      <div className="w-full max-w-xs mt-4 space-y-1.5">
        <div className="flex justify-between text-xs">
          <span className="flex items-center gap-1 font-bold text-gray-300">
            <Heart size={13} className={hunger < 30 ? 'text-rose-500 animate-ping' : 'text-rose-400'} />
            Açlık Seviyesi
          </span>
          <span className={`font-mono font-bold ${hunger >= 70 ? 'text-emerald-400' : hunger >= 30 ? 'text-yellow-400' : 'text-rose-400'
            }`}>
            {hunger}/100
          </span>
        </div>

        {/* Açlık Barı */}
        <div className="w-full bg-slate-950 rounded-full h-3 overflow-hidden border border-purple-900/40 p-0.5">
          <div
            className={`h-full rounded-full transition-all duration-500 ${hunger >= 70
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