import { useState, useEffect, useRef } from 'react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import AbandonModal from './AbandonModal';
import AbandonResultModal from './AbandonResultModal';
import { Play, Square, Sparkles, BookOpen, Clock, Plus, Trash2, X } from 'lucide-react';

const PRESETS = [15, 25, 45, 60];

// Web Audio API ile retro tamamlama melodisi
const playCompletionSound = () => { 
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    const notes = [
      { freq: 523.25, start: 0, duration: 0.18 },
      { freq: 659.25, start: 0.18, duration: 0.18 },
      { freq: 783.99, start: 0.36, duration: 0.22 },
      { freq: 1046.5, start: 0.58, duration: 0.55 },
    ];

    notes.forEach(({ freq, start, duration }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + start);

      gain.gain.setValueAtTime(0.15, ctx.currentTime + start);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + start + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + start);
      osc.stop(ctx.currentTime + start + duration);
    });
  } catch (e) {
    console.warn('Ses çalınamadı:', e);
  }
};

export default function Timer({ onSessionFinished }) {
  const { user, updateUserState } = useAuth();

  // Kullanıcıya özel localStorage anahtarı
  const storageKey = user?.id ? `studypet_categories_${user.id}` : null;

  const [categories, setCategories] = useState(['Genel Çalışma']);
  const [category, setCategory] = useState('Genel Çalışma');
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  const [selectedDuration, setSelectedDuration] = useState(25);
  const [customInput, setCustomInput] = useState('25');
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionId, setSessionId] = useState(null);

  const [isAbandonModalOpen, setIsAbandonModalOpen] = useState(false);
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);
  const [abandonResultData, setAbandonResultData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [completionMessage, setCompletionMessage] = useState(null);

  const timerRef = useRef(null);
  const endsAtRef = useRef(null);
  const completingRef = useRef(false);

  // Kullanıcı değiştikçe o kullanıcıya özel kategorileri localStorage'dan oku
  useEffect(() => {
    if (storageKey) {
      try {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setCategories(parsed);
            setCategory(parsed[0]);
            return;
          }
        }
      } catch (e) {
        console.warn('Kategoriler okunamadı:', e);
      }
      // İlk defa giriş yapılmışsa sadece 'Genel Çalışma'
      setCategories(['Genel Çalışma']);
      setCategory('Genel Çalışma');
    }
  }, [storageKey]);

  // Sayfa yenilendiğinde (F5) backend'deki aktif seansı kontrol edip geri yükler
  useEffect(() => {
    const checkActiveSession = async () => {
      try {
        const res = await api.get('/sessions/active');
        const session = res.data?.activeSession;

        if (session) {
          setSessionId(session.id);
          if (session.category) {
            setCategory(session.category);
          }
          if (session.durationMinutes) {
            setSelectedDuration(session.durationMinutes);
            setCustomInput(session.durationMinutes.toString());
          }

          const remaining = Math.max(0, session.remainingSeconds ?? 0);
          endsAtRef.current = Date.now() + remaining * 1000;
          setTimeLeft(remaining);
          setIsRunning(true);
        }
      } catch (err) {
        console.error('Aktif seans kontrol edilirken hata:', err.response?.data || err.message);
      }
    };

    checkActiveSession();
  }, []);

  // Yeni kategori ekleme (Kişiye özel kaydeder)
  const handleAddCategory = (e) => {
    e.preventDefault();
    const trimmed = newCategoryName.trim();
    if (!trimmed) return;

    if (categories.includes(trimmed)) {
      setCategory(trimmed);
      setNewCategoryName('');
      setIsAddingCategory(false);
      return;
    }

    const updated = [...categories, trimmed];
    setCategories(updated);
    setCategory(trimmed);
    setNewCategoryName('');
    setIsAddingCategory(false);

    if (storageKey) {
      localStorage.setItem(storageKey, JSON.stringify(updated));
    }
  };

  // Kategori silme (Genel Çalışma asla silinemez)
  const handleDeleteCategory = (catToDelete) => {
    if (catToDelete === 'Genel Çalışma') {
      alert('Varsayılan "Genel Çalışma" kategorisi silinemez.');
      return;
    }

    const updated = categories.filter((c) => c !== catToDelete);
    setCategories(updated);
    setCategory('Genel Çalışma');

    if (storageKey) {
      localStorage.setItem(storageKey, JSON.stringify(updated));
    }
  };

  const handlePresetSelect = (mins) => {
    if (isRunning) return;
    setSelectedDuration(mins);
    setCustomInput(mins.toString());
    setTimeLeft(mins * 60);
  };

  const handleCustomChange = (e) => {
    if (isRunning) return;
    const val = e.target.value;
    setCustomInput(val);
    const parsed = parseInt(val, 10);
    if (!isNaN(parsed) && parsed > 0 && parsed <= 180) {
      setSelectedDuration(parsed);
      setTimeLeft(parsed * 60);
    }
  };

  // Zamanlayıcı döngüsü
  useEffect(() => {
    if (!isRunning) return;

    const tick = () => {
      if (endsAtRef.current === null) return;
      const left = Math.max(0, Math.round((endsAtRef.current - Date.now()) / 1000));
      setTimeLeft(left);
    };

    tick();
    timerRef.current = setInterval(tick, 1000);

    const onVisible = () => {
      if (document.visibilityState === 'visible') tick();
    };
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      clearInterval(timerRef.current);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [isRunning]);

  // Süre 0'a ulaşınca seansı tamamla
  useEffect(() => {
    if (isRunning && timeLeft === 0 && !completingRef.current) {
      setIsAbandonModalOpen(false);
      handleCompleteSession();
    }
  }, [isRunning, timeLeft]);

  const handleStartSession = async () => {
    if (selectedDuration < 1) {
      alert('Lütfen geçerli bir süre girin.');
      return;
    }
    setLoading(true);
    setCompletionMessage(null);

    try {
      const res = await api.post('/sessions/start', {
        category,
        durationMinutes: selectedDuration
      });

      const createdId = res.data?.session?.id || res.data?.session?._id || res.data?.id;
      setSessionId(createdId);
      completingRef.current = false;
      endsAtRef.current = Date.now() + selectedDuration * 60 * 1000;
      setTimeLeft(selectedDuration * 60);
      setIsRunning(true);
    } catch (err) {
      alert(err.response?.data?.error || 'Seans başlatılamadı.');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteSession = async () => {
    if (completingRef.current) return;
    completingRef.current = true;
    playCompletionSound();
    setLoading(true);

    try {
      const res = await api.post('/sessions/complete', { sessionId });

      endsAtRef.current = null;
      setIsRunning(false);
      setSessionId(null);
      setTimeLeft(selectedDuration * 60);

      const updatedCoins = res.data?.userCoins ?? res.data?.coins ?? res.data?.totalCoins;
      const petData = res.data?.pet || {};

      updateUserState({
        ...(updatedCoins !== undefined && { coins: updatedCoins }),
        ...(res.data?.pet && {
          pet: {
            ...user?.pet,
            level: petData.level ?? user?.pet?.level,
            xp: petData.xp ?? user?.pet?.xp,
            hungerLevel: petData.hungerLevel ?? user?.pet?.hungerLevel
          }
        })
      });

      const earnedCoinsAmount =
        res.data?.rewards?.coinsEarned ??
        res.data?.rewards?.coins ??
        res.data?.rewards?.earnedCoins ??
        res.data?.earnedCoins ??
        0;

      const earnedXpAmount =
        res.data?.rewards?.xpEarned ??
        res.data?.rewards?.xp ??
        res.data?.rewards?.earnedXp ??
        res.data?.earnedXp ??
        0;

      setCompletionMessage({
        earnedCoins: earnedCoinsAmount,
        earnedXp: earnedXpAmount,
        levelUp: Boolean(res.data?.rewards?.leveledUp || res.data?.rewards?.levelUp || petData.levelUp)
      });

      if (onSessionFinished) onSessionFinished();
    } catch (err) {
      console.error('Seans Tamamlama Hatası:', err.response?.data || err.message);
      completingRef.current = false;
      endsAtRef.current = null;
      setIsRunning(false);
      alert(err.response?.data?.error || err.response?.data?.message || 'Seans tamamlanırken hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAbandonModal = () => {
    setIsAbandonModalOpen(true);
  };

  const handleCancelAbandon = () => {
    setIsAbandonModalOpen(false);
  };

  const handleConfirmAbandon = async () => {
    setLoading(true);
    try {
      const res = await api.post('/sessions/abandon', {
        sessionId: sessionId ? Number(sessionId) : null
      });

      endsAtRef.current = null;
      setIsRunning(false);
      setSessionId(null);
      setTimeLeft(selectedDuration * 60);
      setIsAbandonModalOpen(false);

      const updatedHunger = res.data?.pet?.hungerLevel;
      const dynamicPenalty = res.data?.penaltyAmount ?? Math.min(40, 10 + Math.floor(selectedDuration / 5));

      if (res.data?.pet) {
        updateUserState({
          pet: {
            ...user.pet,
            hungerLevel: updatedHunger
          }
        });
      }

      setAbandonResultData({
        abandonedCategory: category,
        penaltyAmount: dynamicPenalty,
        remainingHunger: updatedHunger ?? Math.max(0, (user?.pet?.hungerLevel || 100) - dynamicPenalty)
      });
      setIsResultModalOpen(true);

      if (onSessionFinished) onSessionFinished();
    } catch (err) {
      console.error('Abandon Hatası:', err.response?.data || err.message);
      endsAtRef.current = null;
      setIsRunning(false);
      setIsAbandonModalOpen(false);
      alert(err.response?.data?.error || err.response?.data?.message || 'Seans iptal edilemedi.');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-retro-card border border-purple-900/40 p-6 md:p-8 rounded-2xl shadow-xl flex flex-col items-center">
      {/* Başarılı Seans Tebrik Kartı */}
      {completionMessage && (
        <div className="w-full mb-6 p-4 rounded-xl bg-retro-green/10 border border-retro-green/40 text-retro-green flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles size={20} />
            <span className="font-bold text-sm">
              Tebrikler! +{completionMessage.earnedCoins} Jeton & +{completionMessage.earnedXp} XP kazandın!
              {completionMessage.levelUp && ' 🌟 Dostun seviye atladı!'}
            </span>
          </div>
          <button onClick={() => setCompletionMessage(null)} className="text-xs underline text-gray-400">
            Kapat
          </button>
        </div>
      )}

      {/* Kontroller & Seçim Alanları */}
      {!isRunning ? (
        <div className="w-full space-y-5 mb-6">
          {/* ÜST BLOK: Kategori Seçimi */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-300 uppercase tracking-wider">
                <BookOpen size={14} className="text-retro-accent" />
                <span>Ders / Kategori Seçimi</span>
              </label>

              {!isAddingCategory && (
                <button
                  type="button"
                  onClick={() => setIsAddingCategory(true)}
                  className="flex items-center gap-1 text-xs text-retro-accent hover:text-white transition-colors"
                >
                  <Plus size={14} />
                  <span>Yeni Kategori Ekle</span>
                </button>
              )}
            </div>

            {isAddingCategory ? (
              <form onSubmit={handleAddCategory} className="flex items-center gap-2 animate-fadeIn">
                <input
                  type="text"
                  autoFocus
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="Kategori Adı (Örn: Matematik, Fizik)..."
                  className="flex-1 h-11 bg-retro-dark border border-retro-accent/60 focus:border-retro-accent rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none transition-colors"
                />
                <button
                  type="submit"
                  className="h-11 px-5 bg-retro-purple hover:bg-purple-600 text-white rounded-xl text-sm font-bold shadow-md transition-colors shrink-0"
                >
                  Ekle
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddingCategory(false)}
                  className="h-11 w-11 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/5 rounded-xl border border-transparent transition-colors shrink-0"
                >
                  <X size={18} />
                </button>
              </form>
            ) : (
              <div className="flex items-center gap-2">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="flex-1 h-11 bg-retro-dark border border-purple-900/50 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-retro-purple transition-colors"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>

                {categories.length > 1 && category !== 'Genel Çalışma' && (
                  <button
                    type="button"
                    onClick={() => handleDeleteCategory(category)}
                    title="Seçili Kategoriyi Sil"
                    className="h-11 w-11 flex items-center justify-center bg-retro-dark border border-purple-900/40 hover:border-red-500/50 text-gray-400 hover:text-red-400 rounded-xl transition-colors shrink-0"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* ORTA BLOK: Süre Seçimi */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
              <Clock size={14} className="text-retro-accent" />
              <span>Odaklanma Süresi</span>
            </label>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-stretch">
              <div className="grid grid-cols-2 gap-2">
                {PRESETS.map((mins) => {
                  const isSelected = selectedDuration === mins && customInput === mins.toString();
                  return (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => handlePresetSelect(mins)}
                      className={`py-2.5 px-3 text-xs font-bold rounded-xl border transition-all flex items-center justify-center ${isSelected
                        ? 'border-retro-purple bg-retro-purple/20 text-retro-purple shadow'
                        : 'border-purple-900/30 bg-retro-dark/60 text-gray-300 hover:border-purple-600/40 hover:text-white'
                        }`}
                    >
                      {mins} Dk {mins === 25 ? '(Pomodoro)' : ''}
                    </button>
                  );
                })}
              </div>

              <div className="bg-retro-dark/60 border border-purple-900/40 rounded-xl px-4 py-2.5 flex items-center justify-between">
                <span className="text-xs font-bold text-gray-300">Elle Gir:</span>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min="1"
                    max="300"
                    value={customInput}
                    onChange={handleCustomChange}
                    placeholder="25"
                    className="w-16 bg-retro-dark focus:border-retro-accent rounded-lg px-2 py-1.5 text-center text-sm font-bold text-retro-accent focus:outline-none"
                  />
                  <span className="text-xs font-bold text-gray-400">dk</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-xs uppercase tracking-wider text-retro-purple font-semibold bg-purple-950/60 border border-purple-800/40 px-3 py-1 rounded-full mb-4">
          Odaklanılıyor: {category}
        </div>
      )}

      {/* ALT BLOK: Sayaç */}
      <div className="my-6">
        <span className="font-mono text-6xl md:text-7xl font-extrabold tracking-widest text-white drop-shadow-[0_0_15px_rgba(189,147,249,0.3)]">
          {formatTime(timeLeft)}
        </span>
      </div>

      {/* Başlat / Vazgeç Butonları */}
      <div className="w-full max-w-xs">
        {!isRunning ? (
          <button
            onClick={handleStartSession}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-retro-green hover:bg-green-500 text-retro-dark font-black py-3.5 rounded-xl shadow-lg transition-all disabled:opacity-50"
          >
            <Play size={20} fill="currentColor" />
            <span>Odaklanmaya Başla</span>
          </button>
        ) : (
          <button
            onClick={handleOpenAbandonModal}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 rounded-xl shadow-lg transition-colors disabled:opacity-50"
          >
            <Square size={18} fill="currentColor" />
            <span>Vazgeç</span>
          </button>
        )}
      </div>

      <AbandonModal
        isOpen={isAbandonModalOpen}
        onCancel={handleCancelAbandon}
        onConfirm={handleConfirmAbandon}
        petName={user?.pet?.name}
        duration={selectedDuration}
        loading={loading}
      />

      <AbandonResultModal
        isOpen={isResultModalOpen}
        onClose={() => setIsResultModalOpen(false)}
        data={abandonResultData}
      />
    </div>
  );
}