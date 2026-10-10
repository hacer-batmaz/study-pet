import { AlertOctagon, HeartCrack, X, RotateCcw } from 'lucide-react';

export default function AbandonResultModal({ isOpen, onClose, data }) {
  if (!isOpen || !data) return null;

  return (
    /* 1. Tüm ekranı kaplayan ve ortalayan karartma katmanı */
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      
      {/* 2. Ekranın tam ortasında duran Pop-up Kartı */}
      <div className="bg-retro-card border-2 border-red-500/70 p-6 md:p-8 rounded-2xl max-w-md w-full shadow-2xl relative text-center">
        
        {/* Sağ Üst Kapatma Çarpı Butonu */}
        <button
          onClick={onClose}
          aria-label="Kapat"
          className="absolute right-4 top-4 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg p-1.5 transition-colors"
        >
          <X size={20} />
        </button>

        {/* Dikkat Çeken İkon */}
        <div className="inline-flex p-3.5 bg-red-950/70 text-red-400 rounded-2xl mb-4 border border-red-500/30 animate-pulse">
          <AlertOctagon size={40} />
        </div>

        <h3 className="text-xl font-bold text-white mb-1.5">
          Çalışma Seansı İptal Edildi
        </h3>
        <p className="text-xs text-gray-400 mb-6">
          Seans erken sonlandırıldığı için ceza uygulandı.
        </p>

        {/* Bilgi Satırları */}
        <div className="space-y-2.5 text-left mb-6">
          <div className="bg-retro-dark/80 p-3 rounded-xl flex items-center justify-between">
            <span className="text-xs text-gray-400">İptal Edilen Seans:</span>
            <span className="text-sm font-bold text-white">{data.abandonedCategory}</span>
          </div>

          <div className="bg-retro-dark/80 p-3 rounded-xl flex items-center justify-between">
            <span className="text-xs text-gray-400">Uygulanan Ceza:</span>
            <span className="text-sm font-bold text-red-400">-{data.penaltyAmount} Açlık Puanı</span>
          </div>

          <div className="bg-retro-dark/80 p-3 rounded-xl flex items-center justify-between">
            <span className="text-xs text-gray-400">Kalan Açlık Durumu:</span>
            <span className="text-sm font-bold text-retro-pink flex items-center gap-1.5">
              <HeartCrack size={15} /> %{data.remainingHunger}
            </span>
          </div>
        </div>

        {/* Kapat ve Devam Et Butonu */}
        <button
          onClick={onClose}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-red-600/30 transition-all text-sm"
        >
          <RotateCcw size={16} />
          <span>Tamam, Yeni Seansa Başla</span>
        </button>
      </div>
    </div>
  );
}