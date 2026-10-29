import { useState, useEffect } from 'react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Utensils, X, Heart, Sparkles, Check, ShoppingBag } from 'lucide-react';
import { getItemEmoji } from '../utils/itemIcons';

export default function FeedModal({ isOpen, onClose, onOpenShop }) {
    const { user, updateUserState } = useAuth();
    const [inventory, setInventory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [feedingId, setFeedingId] = useState(null);
    const [message, setMessage] = useState(null);

    useEffect(() => {
        if (isOpen) {
            fetchInventory();
            setMessage(null);
        }
    }, [isOpen]);

    const fetchInventory = async () => {
        setLoading(true);
        try {
            const res = await api.get('/shop/inventory');
            const dataList = res.data?.inventory || [];

            // Yalnızca 'food' türündeki eşyaları çantada listele
            const foodOnly = dataList.filter(
                (inv) => {
                    const itemType = (inv.item?.type || inv.type || 'food').toLowerCase();
                    return itemType === 'food';
                }
            );

            const formattedList = foodOnly.map((inv) => {
                const itemData = inv.item || {};
                return {
                    id: inv.id,
                    itemId: inv.itemId,
                    name: itemData.name || 'Yiyecek',
                    icon: getItemEmoji(itemData),
                    effectValue: itemData.effectValue || 20,
                    quantity: inv.quantity || 1
                };
            });

            setInventory(formattedList);
        } catch (err) {
            console.error('Envanter yüklenirken hata:', err.response?.data || err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleFeed = async (item) => {
        setFeedingId(item.id);
        setMessage(null);

        try {
            const res = await api.post('/pets/feed', { inventoryId: item.id });

            updateUserState({
                pet: {
                    ...user.pet,
                    hungerLevel: res.data.pet.hungerLevel
                }
            });

            setMessage({
                type: 'success',
                text: res.data.message || 'Dostun beslendi!'
            });

            fetchInventory();
        } catch (err) {
            setMessage({
                type: 'error',
                text: err.response?.data?.error || 'Besleme işlemi başarısız oldu.'
            });
        } finally {
            setFeedingId(null);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
            <div className="bg-retro-card border-2 border-pink-500/40 p-6 md:p-8 rounded-3xl max-w-xl w-full shadow-2xl relative flex flex-col max-h-[85vh]">
                <button
                    onClick={onClose}
                    aria-label="Kapat"
                    className="absolute right-5 top-5 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl p-2 transition-colors"
                >
                    <X size={20} />
                </button>

                <div className="flex items-center justify-between border-b border-purple-900/40 pb-5 mb-6 pr-10">
                    <div className="flex items-center gap-3.5">
                        <div className="p-3 bg-pink-950/60 text-retro-pink rounded-2xl flex items-center justify-center shrink-0">
                            <Utensils size={24} />
                        </div>
                        <div className="flex flex-col gap-0.5">
                            <h3 className="text-xl font-bold text-white tracking-wide">Dostunu Besle</h3>
                            <p className="text-xs text-gray-400">Çantandaki yiyeceklerle enerjisini yenile</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-1.5 bg-pink-950/50 px-3.5 py-2 rounded-xl shrink-0">
                        <Heart size={16} className="text-retro-pink fill-retro-pink" />
                        <span className="font-mono font-extrabold text-sm text-retro-pink">
                            %{user?.pet?.hungerLevel ?? 0}
                        </span>
                    </div>
                </div>

                {message && (
                    <div
                        className={`p-3.5 rounded-xl text-xs font-semibold mb-5 flex items-center gap-2.5 animate-fadeIn shrink-0 ${message.type === 'success'
                                ? 'bg-emerald-950/70 text-emerald-300'
                                : message.type === 'info'
                                    ? 'bg-blue-950/70 text-blue-300'
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
                        <div className="text-center py-10 text-gray-400 text-sm">Çanta yükleniyor...</div>
                    ) : inventory.length === 0 ? (
                        <div className="text-center py-10 flex flex-col items-center gap-3">
                            <span className="text-4xl">🎒</span>
                            <p className="text-gray-300 text-sm font-semibold">Çantanda hiç yiyecek kalmamış!</p>
                            <p className="text-xs text-gray-400 max-w-xs">
                                Odaklanarak kazandığın jetonlarla mağazadan lezzetli yiyecekler alabilirsin.
                            </p>
                            <button
                                type="button"
                                onClick={() => {
                                    onClose();
                                    if (onOpenShop) onOpenShop();
                                }}
                                className="mt-2 flex items-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs transition-colors"
                            >
                                <ShoppingBag size={15} />
                                <span>Mağazaya Git</span>
                            </button>
                        </div>
                    ) : (
                        inventory.map((item) => {
                            const isFeeding = feedingId === item.id;

                            return (
                                <div
                                    key={item.id}
                                    className="bg-retro-dark/70 border border-purple-900/40 hover:border-pink-500/30 px-5 py-4 rounded-2xl flex items-center justify-between gap-4 transition-all"
                                >
                                    <div className="flex items-center gap-4 min-w-0">
                                        <span className="text-3xl select-none bg-retro-card p-2.5 rounded-2xl border border-purple-900/40 shrink-0">
                                            {item.icon}
                                        </span>
                                        <div className="flex flex-col gap-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <h4 className="text-sm font-bold text-white truncate">{item.name}</h4>
                                                <span className="text-xs bg-purple-950 text-purple-300 px-2 py-0.5 rounded-md font-mono">
                                                    x{item.quantity || 1}
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-400 truncate">
                                                +{item.effectValue} Açlık Kazandırır
                                            </p>
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        disabled={isFeeding}
                                        onClick={() => handleFeed(item)}
                                        className="px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white cursor-pointer active:scale-95 disabled:opacity-50 shrink-0"
                                    >
                                        {isFeeding ? 'Yediriliyor...' : 'Yedir'}
                                    </button>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
}