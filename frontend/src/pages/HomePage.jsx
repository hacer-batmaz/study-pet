import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-16 max-w-4xl mx-auto text-center">
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-950/60 border border-purple-500/30 text-retro-purple text-xs font-semibold mb-6">
        <Sparkles size={16} />
        <span>Oyunlaştırılmış Odak Platformu</span>
      </div>

      <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
        Ders Çalışırken <br />
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-retro-accent via-retro-pink to-retro-purple">
          Sanal Hayvanını Büyüt
        </span>
      </h1>

      <p className="text-gray-300 text-base md:text-lg mb-8 max-w-2xl leading-relaxed">
        StudyPet ile odaklandığın her seans için XP ve jeton kazan, sevimli piksel dostunu besle. Erken pes edersen hayvanın aç kalır!
      </p>

      <Link
        to="/register"
        className="flex items-center gap-2 bg-gradient-to-r from-retro-purple to-pink-600 hover:from-purple-600 text-white font-bold px-8 py-3.5 rounded-xl shadow-lg transition-all"
      >
        <span>Hemen Başla</span>
        <ArrowRight size={18} />
      </Link>
    </div>
  );
}