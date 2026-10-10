import { useState, useEffect } from 'react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { ShoppingBag, X, Coins, Sparkles, Check } from 'lucide-react';

const getItemEmoji = (item) => {
    if (item.icon) return item.icon;
    if (item.type === 'accessory') return '🎩';
    if (item.type === 'decor') return '🪴';
    if (item.name.includes('Elma')) return '🍎';
    if (item.name.includes('Balık')) return '🐟';
    if (item.name.includes('Havuç')) return '🥕';
    if (item.name.includes('Kek')) return '🍰';
    return '🍖';
};

export default function ShopModal({ isOpen, onClose }) {
    const { user, updateUserState } = useAuth();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [buyingId, setBuyingId] = useState(null);
    const [message, setMessage] = useState(null);

    useEffect(() => {
        if (isOpen) {
            fetchShopItems();
            setMessage(null);
        }
    }, [isOpen]);

    const fetchShopItems = async () => {
        setLoading(true);
        try {
            const res = await api.get('/shop/items');
            setItems(res.data.items || res.data || []);
        } catch (err) {
            console.error('Ürünler yüklenirken hata:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleBuy = async (item) => {
        if ((user?.coins || 0) < item.price) {
            setMessage({ type: 'error', text: 'Yetersiz jeton! Biraz daha ders çalışmalısın.' });
            return;
        }

        setBuyingId(item.id);
        setMessage(null);

        try {
            const res = await api.post('/shop/buy', { itemId: item.id });

            updateUserState({
                coins: res.data.coins
            });

            setMessage({
                type: 'success',
                text: `${item.name} çantana eklendi!`
            });
        } catch (err) {
            setMessage({
                type: 'error',
                text: err.response?.data?.error || 'Satın alma işlemi başarısız oldu.'
            });
        } finally {
            setBuyingId(null);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
            <div className="bg-retro-card border-2 border-yellow-500/40 p-6 md:p-8 rounded-3xl max-w-xl w-full shadow-2xl relative flex flex-col max-h-[85vh]">
                <button
                    onClick={onClose}
                    aria-label="Kapat"
                    className="absolute right-5 top-5 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl p-2 transition-colors"
                >
                    <X size={20} />
                </button>

                <div className="flex items-center justify-between border-b border-purple-900/40 pb-5 mb-6 pr-10">
                    <div className="flex items-center gap-3.5">
                        <div className="p-3 bg-yellow-950/60 text-yellow-400 rounded-2xl flex items-center justify-center shrink-0">
                            <ShoppingBag size={24} />
                        </div>
                        <div className="flex flex-col gap-0.5">
                            <h3 className="text-xl font-bold text-white tracking-wide">Sanal Mağaza</h3>
                            <p className="text-xs text-gray-400">Dostun için yiyecek ve ödüller al</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 bg-yellow-950/50 px-3.5 py-2 rounded-xl shrink-0">
                        <Coins size={18} className="text-retro-accent" />
                        <span className="font-mono font-extrabold text-sm text-retro-accent">
                            {user?.coins ?? 0}
                        </span>
                    </div>
                </div>

                {message && (
                    <div
                        className={`p-3.5 rounded-xl text-xs font-semibold mb-5 flex items-center gap-2.5 animate-fadeIn shrink-0 ${
                            message.type === 'success'
                                ? 'bg-emerald-950/70 text-emerald-300'
                                : 'bg-red-950/70 text-red-300'
                        }`}
                    >
                        {message.type === 'success' ? (
                            <Check size={16} className="shrink-0" />
                        ) : (
                            <Sparkles size={16} className="shrink-0" />
                        )}
                        <span>{message.text}</span>
                    </div>
                )}

                <div className="overflow-y-auto space-y-3.5 pr-2 flex-1">
                    {loading ? (
                        <div className="text-center py-10 text-gray-400 text-sm">Ürünler yükleniyor...</div>
                    ) : items.length === 0 ? (
                        <div className="text-center py-10 text-gray-400 text-sm">Mağazada henüz ürün bulunmuyor.</div>
                    ) : (
                        items.map((item) => {
                            const canAfford = (user?.coins || 0) >= item.price;
                            const isBuying = buyingId === item.id;

                            return (
                                <div
                                    key={item.id}
                                    className="bg-retro-dark/70 border border-purple-900/40 hover:border-yellow-500/30 px-5 py-4 rounded-2xl flex items-center justify-between gap-4 transition-all"
                                >
                                    <div className="flex items-center gap-4 min-w-0">
                                        <span className="text-3xl select-none bg-retro-card p-2.5 rounded-2xl border border-purple-900/40 shrink-0">
                                            {getItemEmoji(item)}
                                        </span>
                                        <div className="flex flex-col gap-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <h4 className="text-sm font-bold text-white truncate">{item.name}</h4>
                                                <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-md border ${
                                                    item.type === 'food'
                                                        ? 'bg-orange-950/60 border-orange-700/40 text-orange-300'
                                                        : item.type === 'accessory'
                                                        ? 'bg-purple-950/60 border-purple-700/40 text-purple-300'
                                                        : 'bg-emerald-950/60 border-emerald-700/40 text-emerald-300'
                                                }`}>
                                                    {item.type === 'food' ? 'Yiyecek' : item.type === 'accessory' ? 'Aksesuar' : 'Dekor'}
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-400 truncate">
                                                {item.type === 'food'
                                                    ? `+${item.effectValue} Açlık Doldurur`
                                                    : item.type === 'accessory'
                                                    ? 'Evcil hayvan aksesuarı'
                                                    : 'Çalışma odası dekorasyonu'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 shrink-0">
                                        <div className="flex items-center gap-1.5 font-mono font-bold text-sm text-yellow-400">
                                            <span>{item.price}</span>
                                            <Coins size={15} />
                                        </div>

                                        <button
                                            type="button"
                                            disabled={!canAfford || isBuying}
                                            onClick={() => handleBuy(item)}
                                            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md ${
                                                canAfford
                                                    ? 'bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-slate-950 cursor-pointer active:scale-95'
                                                    : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                                            }`}
                                        >
                                            {isBuying ? 'Alınıyor...' : 'Satın Al'}
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
}