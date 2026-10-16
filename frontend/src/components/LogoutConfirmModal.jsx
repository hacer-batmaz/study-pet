import { AlertTriangle, X, LogOut } from 'lucide-react';

export default function LogoutConfirmModal({ isOpen, onCancel, onConfirm, loading }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-retro-card border-2 border-red-500/50 p-6 md:p-8 rounded-3xl max-w-md w-full shadow-2xl relative text-center">
        {/* Kapat Butonu */}
        <button
          onClick={onCancel}
          disabled={loading}
          className="absolute right-5 top-5 text-gray-400 hover:text-white p-1 rounded-lg"
        >
          <X size={20} />
        </button>

        {/* İkon */}
        <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-red-950/70 border border-red-700/50 text-red-400 flex items-center justify-center">
          <AlertTriangle size={30} />
        </div>

        {/* Başlık ve Mesaj */}
        <h3 className="text-xl font-black text-white mb-2">
          Aktif Seansınız Var!
        </h3>
        <p className="text-xs sm:text-sm text-gray-300 mb-6 leading-relaxed">
          Şu anda devam eden bir çalışma seansınız bulunuyor. Çıkış yaparsanız 
          <strong className="text-red-400"> seansınız iptal edilecek ve sanal dostunuz açlık cezası alacaktır.</strong>
          <br /><br />
          Çıkış yapmak istediğinizden emin misiniz?
        </p>

        {/* Butonlar */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="flex-1 py-3 px-4 rounded-xl bg-retro-dark border border-purple-900/40 text-gray-300 hover:text-white hover:border-purple-600/50 font-bold text-xs transition-colors"
          >
            Vazgeç, Derse Dön
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-3 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-colors disabled:opacity-50"
          >
            <LogOut size={16} />
            <span>{loading ? 'İptal Edilip Çıkılıyor...' : 'Evet, Çıkış Yap'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}