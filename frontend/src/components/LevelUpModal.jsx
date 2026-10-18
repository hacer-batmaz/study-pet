import { Award, Sparkles, X, ChevronRight } from 'lucide-react';

export default function LevelUpModal({ isOpen, onClose, newLevel, petName, petType }) {
  if (!isOpen) return null;

  const emoji = petType === 'dog' ? '🐶' : petType === 'rabbit' ? '🐰' : '🐱';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-retro-card border-2 border-yellow-500/60 p-8 rounded-3xl max-w-md w-full shadow-[0_0_50px_rgba(234,179,8,0.3)] relative text-center">
        
        {/* Kapat Butonu */}
        <button
          onClick={onClose}
          className="absolute right-5 top-5 text-gray-400 hover:text-white p-1 rounded-lg"
        >
          <X size={20} />
        </button>

        {/* Üst Rozet */}
        <div className="w-16 h-16 mx-auto mb-4 rounded-3xl bg-yellow-500/20 border-2 border-yellow-400 flex items-center justify-center text-yellow-400 shadow-lg animate-bounce">
          <Award size={36} />
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-950 border border-purple-800 text-retro-accent text-xs font-bold uppercase tracking-wider mb-3">
          <Sparkles size={14} />
          <span>Tebrikler! Seviye Atladın</span>
        </div>

        <h3 className="text-2xl font-black text-white mb-2">
          {petName} Artık Seviye {newLevel}!
        </h3>

        <div className="text-6xl my-4 animate-pulse select-none">
          {emoji}
        </div>

        <p className="text-xs sm:text-sm text-gray-300 mb-6 leading-relaxed">
          Çalışma disiplinin sayesinde dostun daha da güçlendi. Odaklanmaya devam ederek yeni ödüllerin kilidini açabilirsin!
        </p>

        <button
          onClick={onClose}
          className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg transition-transform transform hover:scale-105"
        >
          <span>Harika, Devam Et</span>
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}