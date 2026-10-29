import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Clock,
  Sparkles,
  ShoppingBag,
  BarChart2,
  ArrowRight,
  ShieldAlert,
  Heart,
  Award,
  Zap
} from 'lucide-react';

export default function HomePage() {
  const { user, loading } = useAuth();

  // Oturum açıksa doğrudan kontrol paneline yönlendir
  if (!loading && user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-retro-dark text-gray-100 flex flex-col justify-between selection:bg-retro-purple selection:text-white">

      {/* 1. HERO BÖLÜMÜ */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28 px-6 max-w-6xl mx-auto w-full">
        {/* Arka plan retro parlama efekti */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[350px] bg-purple-600/15 blur-[120px] rounded-full pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">

          {/* Sol Kolon: Başlık, Açıklama ve Butonlar */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-950/70 border border-purple-800/50 text-retro-accent text-xs font-bold tracking-wider uppercase animate-fadeIn">
              <Sparkles size={14} />
              <span>Oyunlaştırılmış Pomodoro Deneyimi</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-white leading-tight">
              Odaklan, Jeton Kazan,{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-retro-accent via-purple-400 to-pink-400">
                Sanal Dostunu
              </span>{' '}
              Büyüt!
            </h1>

            <p className="text-gray-300 text-base md:text-lg leading-relaxed max-w-xl mx-auto lg:mx-0">
              Sıkıcı zamanlayıcıları unut. Ders çalıştıkça sanal hayvanını hayatta tut, seviye atlat ve mağazadan ödüller satın al. Erken pes edersen dostun aç kalır!
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <Link
                to="/register"
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-retro-purple hover:bg-purple-600 text-white font-extrabold text-sm flex items-center justify-center gap-2.5 shadow-[0_0_25px_rgba(189,147,249,0.4)] hover:shadow-[0_0_35px_rgba(189,147,249,0.6)] transition-all transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <span>Başla</span>
                <ArrowRight size={18} />
              </Link>

              <Link
                to="/login"
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-retro-card/80 hover:bg-retro-card text-gray-200 hover:text-white border border-purple-900/50 hover:border-purple-600/50 font-bold text-sm flex items-center justify-center transition-all"
              >
                Giriş Yap
              </Link>
            </div>
          </div>

          {/* Sağ Kolon: Retro Kart & Pet Simülasyonu */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="w-full max-w-sm bg-retro-card border-2 border-purple-500/30 rounded-3xl p-6 shadow-2xl relative">

              {/* Sanal Hayvan Alanı */}
              <div className="bg-retro-dark/90 border border-purple-900/40 rounded-2xl p-6 text-center mb-5 flex flex-col items-center">
                <div className="text-6xl mb-3 select-none">
                  <img src="/assets/pets/normal_kedi.gif" alt="Normal Kedi" className="w-full h-full object-contain" />
                </div>
                <h4 className="text-base font-extrabold text-white">Mırnav</h4>
                <span className="text-[11px] text-retro-purple font-bold">Seviye 3 Sanal Kedi</span>

                {/* Açlık Barı */}
                <div className="w-full mt-4 space-y-1">
                  <div className="flex justify-between text-[11px] text-gray-400">
                    <span className="flex items-center gap-1 font-bold">
                      <Heart size={12} className="text-rose-400" /> Açlık Puanı
                    </span>
                    <span className="font-mono text-gray-200">85/100</span>
                  </div>
                  <div className="w-full bg-slate-950 rounded-full h-2.5 overflow-hidden border border-purple-900/40">
                    <div className="bg-gradient-to-r from-emerald-500 to-green-400 h-2.5 rounded-full w-[85%]" />
                  </div>
                </div>
              </div>

              {/* Sayaç Kartı */}
              <div className="bg-purple-950/40 border border-purple-900/50 rounded-2xl p-4 text-center">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">
                  Aktif Çalışma Seansı
                </span>
                <span className="font-mono text-3xl font-black text-retro-accent tracking-widest">
                  23:45
                </span>
                <div className="flex justify-center gap-2 mt-3">
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. NASIL ÇALIŞIR? (3 ADIM) */}
      <section className="py-16 px-6 bg-retro-card/40 border-y border-purple-900/30">
        <div className="max-w-5xl mx-auto">
          <div className="text-center space-y-3 mb-12">
            <h2 className="text-2xl sm:text-3xl font-black text-white">Nasıl Çalışır?</h2>
            <p className="text-sm text-gray-400">3 basit adımda çalışma disiplinini oyunlaştır</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-retro-card border border-purple-900/40 p-6 rounded-2xl relative space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-950/80 text-retro-purple border border-purple-800/40 flex items-center justify-center font-black text-sm">
                1
              </div>
              <h3 className="text-lg font-bold text-white">Seansını Başlat</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Çalışacağın dersi ve süreyi belirle.
              </p>
            </div>

            <div className="bg-retro-card border border-purple-900/40 p-6 rounded-2xl relative space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-950/80 text-retro-purple border border-purple-800/40 flex items-center justify-center font-black text-sm">
                2
              </div>
              <h3 className="text-lg font-bold text-white">Ödülleri Topla</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Süreyi başarıyla tamamladığında jeton ve tecrübe puanı kazan. Dostunun seviye atlamasına yardımcı ol.
              </p>
            </div>

            <div className="bg-retro-card border border-purple-900/40 p-6 rounded-2xl relative space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-950/80 text-retro-purple border border-purple-800/40 flex items-center justify-center font-black text-sm">
                3
              </div>
              <h3 className="text-lg font-bold text-white">Besle & Büyüt</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Kazandığın jetonlarla sanal mağazadan lezzetli yiyecekler al, dostunun açlık puanını yüksek tut.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. TEMEL ÖZELLİKLER */}
      <section className="py-20 px-6 max-w-6xl mx-auto w-full">
        <div className="text-center space-y-3 mb-14">
          <h2 className="text-2xl sm:text-3xl font-black text-white">Neden StudyPet?</h2>
          <p className="text-sm text-gray-400">Üretkenliğini zirveye taşıyacak mekanikler</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-retro-card/60 border border-purple-900/40 p-5 rounded-2xl space-y-3 hover:border-purple-600/40 transition-all">
            <div className="p-3 bg-purple-950/60 text-purple-400 rounded-xl w-fit">
              <Clock size={20} />
            </div>
            <h4 className="text-base font-bold text-white">Kesintisiz Sayaç</h4>
            <p className="text-xs text-gray-400 leading-relaxed">
              Sayfa yenilense de sekme kapansa da sunucu senkronu sayesinde süren asla kaybolmaz.
            </p>
          </div>

          <div className="bg-retro-card/60 border border-purple-900/40 p-5 rounded-2xl space-y-3 hover:border-purple-600/40 transition-all">
            <div className="p-3 bg-rose-950/60 text-rose-400 rounded-xl w-fit">
              <ShieldAlert size={20} />
            </div>
            <h4 className="text-base font-bold text-white">Caydırıcı Ceza</h4>
            <p className="text-xs text-gray-400 leading-relaxed">
              Erken pes ettiğinde dostunun açlık puanı düşer. Masadan kalkmadan önce iki kere düşüneceksin!
            </p>
          </div>

          <div className="bg-retro-card/60 border border-purple-900/40 p-5 rounded-2xl space-y-3 hover:border-purple-600/40 transition-all">
            <div className="p-3 bg-yellow-950/60 text-yellow-400 rounded-xl w-fit">
              <ShoppingBag size={20} />
            </div>
            <h4 className="text-base font-bold text-white">Sanal Mağaza</h4>
            <p className="text-xs text-gray-400 leading-relaxed">
              Elma, balık veya sihirli kekler... Kazandığın jetonlarla çantanı lezzetli yiyeceklerle doldur.
            </p>
          </div>

          <div className="bg-retro-card/60 border border-purple-900/40 p-5 rounded-2xl space-y-3 hover:border-purple-600/40 transition-all">
            <div className="p-3 bg-emerald-950/60 text-emerald-400 rounded-xl w-fit">
              <BarChart2 size={20} />
            </div>
            <h4 className="text-base font-bold text-white">Günün Analizi</h4>
            <p className="text-xs text-gray-400 leading-relaxed">
              Hangi derse ne kadar çalıştığını, başarı oranını ve geçmişini filtreli grafiklerle incele.
            </p>
          </div>
        </div>
      </section>

      {/* 4. ÇAĞRI (CTA) ALANI */}
      <section className="py-14 px-6 max-w-4xl mx-auto w-full">
        <div className="bg-gradient-to-r from-purple-950/80 via-retro-card to-purple-950/80 border-2 border-purple-500/40 p-8 md:p-12 rounded-3xl text-center space-y-6 shadow-2xl relative overflow-hidden">
          <h3 className="text-2xl sm:text-3xl font-black text-white">
            Çalışma Alışkanlığını Değiştirmeye Hazır Mısın?
          </h3>
          <p className="text-xs sm:text-sm text-gray-300 max-w-lg mx-auto">
            Hemen ücretsiz hesabını aç, sanal hayvanını seç ve ilk odaklanma seansını başlat!
          </p>
          <div>
            <Link
              to="/register"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-retro-green hover:bg-green-500 text-slate-950 font-black text-sm transition-all transform hover:scale-105"
            >
              <Zap size={18} fill="currentColor" />
              <span>Hemen Kayıt Ol</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}