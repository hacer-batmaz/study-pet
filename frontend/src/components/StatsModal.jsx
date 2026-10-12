import { useState, useEffect } from 'react';
import api from '../api/client';
import { 
  BarChart2, 
  X, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  PieChart, 
  History, 
  Award 
} from 'lucide-react';

export default function StatsModal({ isOpen, onClose }) {
  const [stats, setStats] = useState(null);
  const [history, setHistory] = useState([]);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'history'
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, historyRes] = await Promise.all([
        api.get('/sessions/stats'),
        api.get('/sessions/history?limit=15')
      ]);
      setStats(statsRes.data);
      setHistory(historyRes.data?.history || []);
    } catch (err) {
      console.error('İstatistikler yüklenirken hata:', err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-retro-card border-2 border-purple-500/40 p-6 md:p-8 rounded-3xl max-w-2xl w-full shadow-2xl relative flex flex-col max-h-[85vh]">
        
        {/* Kapat Butonu */}
        <button
          onClick={onClose}
          aria-label="Kapat"
          className="absolute right-5 top-5 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl p-2 transition-colors"
        >
          <X size={20} />
        </button>

        {/* Üst Başlık & Sekmeler */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-purple-900/40 pb-5 mb-5 pr-10 gap-3">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-950/60 text-retro-purple rounded-2xl flex items-center justify-center shrink-0">
              <BarChart2 size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white tracking-wide">Çalışma İstatistikleri</h3>
              <p className="text-xs text-gray-400">Odaklanma geçmişin ve ders analizlerin</p>
            </div>
          </div>

          {/* Sekme Değiştirici */}
          <div className="flex bg-retro-dark p-1 rounded-xl border border-purple-900/40 shrink-0">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'overview'
                  ? 'bg-retro-purple text-white shadow-sm'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Genel Bakış
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'history'
                  ? 'bg-retro-purple text-white shadow-sm'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Geçmiş ({history.length})
            </button>
          </div>
        </div>

        {/* İçerik Alanı */}
        <div className="overflow-y-auto space-y-4 pr-1 flex-1">
          {loading ? (
            <div className="text-center py-16 text-gray-400 text-sm font-medium">
              Veriler yükleniyor...
            </div>
          ) : activeTab === 'overview' ? (
            /* ================= GENEL BAKIŞ SEKMESİ ================= */
            <div className="space-y-5">
              {/* Özet Metrik Kartları */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-retro-dark/80 border border-purple-900/40 p-3.5 rounded-2xl flex flex-col items-center text-center">
                  <Clock size={20} className="text-purple-400 mb-1" />
                  <span className="text-xl font-black font-mono text-white">
                    {stats?.totalHours || 0}s
                  </span>
                  <span className="text-[11px] text-gray-400 font-medium">Toplam Süre</span>
                </div>

                <div className="bg-retro-dark/80 border border-purple-900/40 p-3.5 rounded-2xl flex flex-col items-center text-center">
                  <CheckCircle2 size={20} className="text-emerald-400 mb-1" />
                  <span className="text-xl font-black font-mono text-emerald-400">
                    {stats?.completedCount || 0}
                  </span>
                  <span className="text-[11px] text-gray-400 font-medium">Tamamlanan</span>
                </div>

                <div className="bg-retro-dark/80 border border-purple-900/40 p-3.5 rounded-2xl flex flex-col items-center text-center">
                  <XCircle size={20} className="text-rose-400 mb-1" />
                  <span className="text-xl font-black font-mono text-rose-400">
                    {stats?.abandonedCount || 0}
                  </span>
                  <span className="text-[11px] text-gray-400 font-medium">Pes Edilen</span>
                </div>

                <div className="bg-retro-dark/80 border border-purple-900/40 p-3.5 rounded-2xl flex flex-col items-center text-center">
                  <Award size={20} className="text-yellow-400 mb-1" />
                  <span className="text-xl font-black font-mono text-yellow-400">
                    %{stats?.completionRate || 0}
                  </span>
                  <span className="text-[11px] text-gray-400 font-medium">Başarı Oranı</span>
                </div>
              </div>

              {/* Kategori Bazlı Dağılım */}
              <div className="bg-retro-dark/60 border border-purple-900/40 p-5 rounded-2xl">
                <div className="flex items-center gap-2 mb-4">
                  <PieChart size={18} className="text-retro-accent" />
                  <h4 className="text-sm font-bold text-white">Ders / Kategori Dağılımı</h4>
                </div>

                {(!stats?.categoryStats || stats.categoryStats.length === 0) ? (
                  <p className="text-xs text-gray-400 text-center py-4">
                    Henüz tamamlanmış bir çalışma seansı bulunmuyor.
                  </p>
                ) : (
                  <div className="space-y-3.5">
                    {stats.categoryStats.map((cat) => (
                      <div key={cat.name} className="space-y-1.5">
                        <div className="flex justify-between text-xs">
                          <span className="font-bold text-gray-200">{cat.name}</span>
                          <span className="font-mono text-gray-400">
                            {cat.minutes} dk ({cat.percentage}%)
                          </span>
                        </div>
                        {/* İlerleme Çubuğu */}
                        <div className="w-full bg-slate-900/80 rounded-full h-2.5 overflow-hidden border border-purple-900/30">
                          <div
                            className="bg-gradient-to-r from-purple-500 to-retro-accent h-2.5 rounded-full transition-all duration-500"
                            style={{ width: `${cat.percentage}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* ================= GEÇMİŞ SEKMESİ ================= */
            <div className="space-y-2.5">
              {history.length === 0 ? (
                <div className="text-center py-12 text-gray-400 text-xs">
                  Henüz kaydedilmiş seans geçmişi yok.
                </div>
              ) : (
                history.map((item) => {
                  const isCompleted = item.status === 'completed';
                  const dateStr = new Date(item.createdAt).toLocaleDateString('tr-TR', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit'
                  });

                  return (
                    <div
                      key={item.id}
                      className="bg-retro-dark/70 border border-purple-900/30 hover:border-purple-600/40 px-4 py-3 rounded-xl flex items-center justify-between transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg shrink-0 bg-slate-900/60">
                          {isCompleted ? (
                            <CheckCircle2 size={18} className="text-emerald-400" />
                          ) : (
                            <XCircle size={18} className="text-rose-400" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white">
                              {item.category || 'Genel Çalışma'}
                            </span>
                            <span
                              className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                isCompleted
                                  ? 'bg-emerald-950 text-emerald-300'
                                  : 'bg-rose-950 text-rose-300'
                              }`}
                            >
                              {isCompleted ? 'Tamamlandı' : 'Terk Edildi'}
                            </span>
                          </div>
                          <span className="text-[11px] text-gray-500">{dateStr}</span>
                        </div>
                      </div>

                      <div className="font-mono text-xs font-bold text-gray-300">
                        {item.durationMinutes} dk
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}