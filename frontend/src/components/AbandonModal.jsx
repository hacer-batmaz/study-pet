import { AlertTriangle, X } from 'lucide-react';

export default function AbandonModal({ isOpen, onCancel, onConfirm, petName, duration = 25, loading }) {
  if (!isOpen) return null;

  // Seans süresine göre dinamik ceza puanı formülü (10 taban + her 5 dk için +1, maks 40)
  const estimatedPenalty = Math.min(40, 10 + Math.floor(duration / 5));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="bg-retro-card border-2 border-red-500/60 p-6 rounded-2xl max-w-md w-full shadow-2xl relative text-center">
        {/* Kapat Çarpı İkonu
        <button
          onClick={onCancel}
          disabled={loading}
          className="absolute right-4 top-4 text-gray-400 hover:text-white transition-colors"
        >
          <X size={20} />
        </button> */}

        {/* Uyarı İkonu */}
        <div className="inline-flex p-3 bg-red-950/60 text-red-400 rounded-2xl mb-4 animate-bounce">
          <AlertTriangle size={36} />
        </div>

        <h3 className="text-xl font-bold text-white mb-2">
          Odaklanmayı Bırakıyor musun?
        </h3>

        <p className="text-gray-300 text-sm leading-relaxed mb-6">
          Seansı erken terk edersen odaklanma süren kaydedilmeyecek ve{' '}
          <strong className="text-retro-pink">{petName || 'Dostun'}</strong>{' '}
          açlık seviyesinden <span className="text-red-400 font-bold">-{estimatedPenalty} Puan</span> kaybedecek!
        </p>

        {/* Aksiyon Butonları */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 bg-retro-green/20 hover:bg-retro-green/30 border border-retro-green/40 text-retro-green font-bold py-2.5 rounded-xl transition-colors"
          >
            Çalışmaya Devam Et
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 rounded-xl transition-colors shadow-lg shadow-red-600/30 disabled:opacity-50"
          >
            {loading ? 'İptal Ediliyor...' : 'Evet, Pes Et'}
          </button>
        </div>
      </div>
    </div>
  );
}