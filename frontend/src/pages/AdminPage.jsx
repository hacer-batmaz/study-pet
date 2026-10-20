import { useState, useEffect } from 'react';
import api from '../api/client';
import {
    ShieldAlert,
    Users,
    ShoppingBag,
    BarChart3,
    FileText,
    Plus,
    Search,
    CheckCircle2,
    XCircle,
    Clock,
    Coins,
    AlertTriangle,
    RefreshCw
} from 'lucide-react';

export default function AdminPage() {
    const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'users' | 'shop' | 'logs'
    const [loading, setLoading] = useState(false);

    // 1. Genel İstatistikler State
    const [stats, setStats] = useState(null);

    // 2. Kullanıcılar State
    const [users, setUsers] = useState([]);
    const [userSearch, setUserSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('ALL');
    const [statusFilter, setStatusFilter] = useState('ALL');

    // 3. Mağaza Ürünleri State
    const [shopItems, setShopItems] = useState([]);
    const [shopSort, setShopSort] = useState('active_first'); // 'all' | 'active_first' | 'passive_first' | 'price_asc' | 'price_desc
    const [isAddProductOpen, setIsAddProductOpen] = useState(false);
    const [newProduct, setNewProduct] = useState({
        name: '',
        type: 'food',
        price: 20,
        effectValue: 25,
        spriteUrl: '/assets/items/apple.png'
    });

    // 4. Denetim Günlüğü State
    const [logs, setLogs] = useState([]);

    // Yeni Kullanıcı Ekleme Modalı State'leri
    const [isAddUserOpen, setIsAddUserOpen] = useState(false);
    const [newUser, setNewUser] = useState({
        username: '',
        email: '',
        password: '',
        role: 'USER',
        petName: '',
        petType: 'cat'
    });

    // Kullanıcı Askıya Alma / Aktifleştirme Onay Modalı State'i
    // Kullanıcı Durum ve Rol Değişikliği Onay Modalı State'i
    const [confirmModalData, setConfirmModalData] = useState({
        isOpen: false,
        user: null,
        actionType: 'suspend', // 'suspend' | 'activate' | 'role_change'
        newRole: null
    });

    useEffect(() => {
        fetchStats();
        if (activeTab === 'users') fetchUsers();
        if (activeTab === 'shop') fetchShopItems();
        if (activeTab === 'logs') fetchLogs();
    }, [activeTab]);

    const fetchStats = async () => {
        try {
            const res = await api.get('/admin/stats');
            setStats(res.data);
        } catch (err) {
            console.error('Stats hatası:', err);
        }
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();
        try {
            await api.post('/admin/users', newUser);
            setIsAddUserOpen(false);
            setNewUser({
                username: '',
                email: '',
                password: '',
                role: 'USER',
                petName: '',
                petType: 'cat'
            });
            fetchUsers();
            fetchStats();
            alert('Kullanıcı başarıyla oluşturuldu!');
        } catch (err) {
            alert(err.response?.data?.error || 'Kullanıcı oluşturulamadı.');
        }
    };

    const fetchUsers = async (
        overrideRole = roleFilter,
        overrideStatus = statusFilter,
        overrideSearch = userSearch
    ) => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (overrideSearch) params.append('search', overrideSearch);
            if (overrideRole !== 'ALL') params.append('role', overrideRole);
            if (overrideStatus !== 'ALL') params.append('status', overrideStatus);

            const res = await api.get(`/admin/users?${params.toString()}`);
            setUsers(res.data.users || []);
        } catch (err) {
            console.error('Kullanıcılar alınamadı:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchShopItems = async () => {
        setLoading(true);
        try {
            const res = await api.get('/admin/shop');
            setShopItems(res.data.items || []);
        } catch (err) {
            console.error('Ürünler alınamadı:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const res = await api.get('/admin/logs');
            setLogs(res.data.logs || []);
        } catch (err) {
            console.error('Loglar alınamadı:', err);
        } finally {
            setLoading(false);
        }
    };

    // Modal'ı açan tetikleyici
    const handleOpenStatusModal = (user) => {
        setConfirmModalData({
            isOpen: true,
            user,
            actionType: user.isActive ? 'suspend' : 'activate'
        });
    };

    // Kullanıcı Askıya Alma / Aktifleştirme
    const handleConfirmUserStatus = async () => {
        const { user, actionType } = confirmModalData;
        if (!user) return;

        try {
            await api.put(`/admin/users/${user.id}/status`, {
                isActive: actionType === 'activate'
            });

            // Modalı kapat ve listeyi güncelle
            setConfirmModalData({ isOpen: false, user: null, actionType: 'suspend' });
            fetchUsers();
            fetchStats();
        } catch (err) {
            alert(err.response?.data?.error || 'İşlem gerçekleştirilemedi.');
        }
    };

    // Rol select'i değiştiğinde modalı aç
    const handleOpenRoleModal = (user, selectedRole) => {
        if (user.role === selectedRole) return;

        setConfirmModalData({
            isOpen: true,
            user,
            actionType: 'role_change',
            newRole: selectedRole
        });
    };

    // Kullanıcı Rol Değiştirme
    const handleConfirmAction = async () => {
        const { user, actionType, newRole } = confirmModalData;
        if (!user) return;

        try {
            if (actionType === 'role_change') {
                await api.put(`/admin/users/${user.id}/status`, { role: newRole });
            } else {
                await api.put(`/admin/users/${user.id}/status`, {
                    isActive: actionType === 'activate'
                });
            }

            setConfirmModalData({ isOpen: false, user: null, actionType: 'suspend', newRole: null });
            fetchUsers();
            fetchStats();
        } catch (err) {
            alert(err.response?.data?.error || 'İşlem gerçekleştirilemedi.');
            // Hata durumunda da modalı kapatıp listeyi tazeleyelim ki select eski değerine dönsün
            setConfirmModalData({ isOpen: false, user: null, actionType: 'suspend', newRole: null });
            fetchUsers();
        }
    };

    // Yeni Mağaza Ürünü Ekleme
    const handleCreateProduct = async (e) => {
        e.preventDefault();
        try {
            await api.post('/admin/shop', newProduct);
            setIsAddProductOpen(false);
            setNewProduct({
                name: '',
                type: 'food',
                price: 20,
                effectValue: 25,
                spriteUrl: '/assets/items/apple.png'
            });
            fetchShopItems();
        } catch (err) {
            alert(err.response?.data?.error || 'Ürün eklenemedi.');
        }
    };

    // Ürün Aktif/Pasif Yapma (Soft-delete)
    const handleToggleShopItem = async (itemId) => {
        try {
            await api.put(`/admin/shop/${itemId}/toggle`);
            fetchShopItems();
        } catch (err) {
            alert(err.response?.data?.error || 'Ürün durumu güncellenemedi.');
        }
    };

    // Mağaza ürünlerini seçilen kritere göre sırala / filtrele
    const sortedShopItems = [...shopItems].sort((a, b) => {
        if (shopSort === 'active_first') {
            // Aktifler önce (true -> -1, false -> 1)
            return (b.isActive === a.isActive) ? a.id - b.id : b.isActive ? 1 : -1;
        }
        if (shopSort === 'passive_first') {
            // Pasifler önce
            return (b.isActive === a.isActive) ? a.id - b.id : a.isActive ? 1 : -1;
        }
        if (shopSort === 'price_asc') {
            return a.price - b.price;
        }
        if (shopSort === 'price_desc') {
            return b.price - a.price;
        }
        return a.id - b.id;
    });

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 animate-fadeIn">
            {/* Üst Başlık */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-purple-900/40 mb-8 gap-4">
                <div>
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-2xl">
                            <ShieldAlert size={28} />
                        </div>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-black text-white tracking-wide">
                                Sistem Yönetim Paneli
                            </h1>
                            <p className="text-xs sm:text-sm text-gray-400">
                                Platform metrikleri, kullanıcı yetkileri ve mağaza içerik denetimi
                            </p>
                        </div>
                    </div>
                </div>

                {/* Sekme Butonları */}
                <div className="flex items-center gap-1.5 bg-retro-dark p-1.5 rounded-2xl border border-purple-900/40 overflow-x-auto max-w-full">
                    {[
                        { id: 'overview', label: 'Genel Bakış', icon: BarChart3 },
                        { id: 'users', label: 'Kullanıcılar', icon: Users },
                        { id: 'shop', label: 'Mağaza Yönetimi', icon: ShoppingBag },
                        { id: 'logs', label: 'Denetim Günlüğü', icon: FileText }
                    ].map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${isActive
                                    ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                <Icon size={16} />
                                <span>{tab.label}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* ================= 1. SEKME: GENEL BAKIŞ (OVERVIEW) ================= */}
            {activeTab === 'overview' && (
                <div className="space-y-6">
                    {/* Metrik Kartları */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-retro-card border border-purple-900/40 p-5 rounded-2xl">
                            <div className="flex justify-between items-center text-gray-400 mb-2 text-xs font-bold">
                                <span>Toplam Üye</span>
                                <Users size={18} className="text-purple-400" />
                            </div>
                            <div className="text-2xl font-black text-white font-mono">
                                {stats?.totalUsers || 0}
                            </div>
                            <p className="text-[11px] text-emerald-400 mt-1 font-semibold">
                                {stats?.activeUsers || 0} aktif hesap
                            </p>
                        </div>

                        <div className="bg-retro-card border border-purple-900/40 p-5 rounded-2xl">
                            <div className="flex justify-between items-center text-gray-400 mb-2 text-xs font-bold">
                                <span>Tamamlanan Seanslar</span>
                                <CheckCircle2 size={18} className="text-emerald-400" />
                            </div>
                            <div className="text-2xl font-black text-emerald-400 font-mono">
                                {stats?.completedSessions || 0}
                            </div>
                            <p className="text-[11px] text-gray-400 mt-1">
                                Toplam {stats?.totalSessions || 0} seans içinden
                            </p>
                        </div>

                        <div className="bg-retro-card border border-purple-900/40 p-5 rounded-2xl">
                            <div className="flex justify-between items-center text-gray-400 mb-2 text-xs font-bold">
                                <span>Terk Edilme Oranı</span>
                                <AlertTriangle size={18} className="text-rose-400" />
                            </div>
                            <div className="text-2xl font-black text-rose-400 font-mono">
                                %{stats?.abandonedRate || 0}
                            </div>
                            <p className="text-[11px] text-gray-400 mt-1">
                                {stats?.abandonedSessions || 0} seans yarıda bırakıldı
                            </p>
                        </div>

                        <div className="bg-retro-card border border-purple-900/40 p-5 rounded-2xl">
                            <div className="flex justify-between items-center text-gray-400 mb-2 text-xs font-bold">
                                <span>Toplam Odaklanma</span>
                                <Clock size={18} className="text-yellow-400" />
                            </div>
                            <div className="text-2xl font-black text-yellow-400 font-mono">
                                {stats?.totalStudyHours || 0} saat
                            </div>
                            <p className="text-[11px] text-gray-400 mt-1">
                                {stats?.totalStudyMinutes || 0} dakika ders çalışıldı
                            </p>
                        </div>
                    </div>

                    {/* En Çok Çalışılan Kategoriler */}
                    <div className="bg-retro-card border border-purple-900/40 p-6 rounded-3xl">
                        <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                            <BarChart3 size={18} className="text-retro-accent" />
                            <span>Platform Genelinde En Popüler Ders Kategorileri</span>
                        </h3>
                        {(!stats?.topCategories || stats.topCategories.length === 0) ? (
                            <p className="text-xs text-gray-400">Henüz tamamlanmış seans kaydı bulunmuyor.</p>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {stats.topCategories.map((c) => (
                                    <div key={c.name} className="bg-retro-dark/60 p-4 rounded-xl border border-purple-900/30 flex justify-between items-center">
                                        <span className="text-sm font-bold text-gray-200">{c.name}</span>
                                        <span className="text-xs font-mono bg-purple-950/80 text-purple-300 border border-purple-800/40 px-3 py-1 rounded-full font-bold">
                                            {c.count} Seans
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ================= 2. SEKME: KULLANICI YÖNETİMİ ================= */}
            {activeTab === 'users' && (
                <div className="space-y-4">
                    {/* Filtre, Arama ve Kullanıcı Ekleme Barı */}
                    <div className="bg-retro-card border border-purple-900/40 p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-3">
                        <div className="relative flex-1 w-full">
                            <Search size={16} className="absolute left-3.5 top-3.5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Kullanıcı adı veya e-posta ile ara..."
                                value={userSearch}
                                onChange={(e) => setUserSearch(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && fetchUsers(roleFilter, statusFilter, userSearch)}
                                className="w-full pl-10 pr-4 py-2 bg-retro-dark border border-purple-900/40 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                            />
                        </div>

                        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-between md:justify-end">
                            <select
                                value={roleFilter}
                                onChange={(e) => {
                                    const newRole = e.target.value;
                                    setRoleFilter(newRole);
                                    fetchUsers(newRole, statusFilter, userSearch);
                                }}
                                className="bg-retro-dark border border-purple-900/40 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                            >
                                <option value="ALL">Tüm Roller</option>
                                <option value="USER">USER</option>
                                <option value="ADMIN">ADMIN</option>
                            </select>

                            <select
                                value={statusFilter}
                                onChange={(e) => {
                                    const newStatus = e.target.value;
                                    setStatusFilter(newStatus);
                                    fetchUsers(roleFilter, newStatus, userSearch);
                                }}
                                className="bg-retro-dark border border-purple-900/40 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                            >
                                <option value="ALL">Tüm Durumlar</option>
                                <option value="ACTIVE">Aktif</option>
                                <option value="SUSPENDED">Askıda</option>
                            </select>

                            <button
                                onClick={() => fetchUsers(roleFilter, statusFilter, userSearch)}
                                className="p-2.5 bg-purple-950/60 text-purple-300 border border-purple-800/40 rounded-xl hover:bg-purple-900/60 transition-colors"
                                title="Yenile"
                            >
                                <RefreshCw size={16} />
                            </button>

                            {/* YENİ KULLANICI EKLE BUTONU */}
                            <button
                                onClick={() => setIsAddUserOpen(true)}
                                className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-black shadow-md transition-colors whitespace-nowrap"
                            >
                                <Plus size={16} />
                                <span>Yeni Kullanıcı Ekle</span>
                            </button>
                        </div>
                    </div>

                    {/* Kullanıcı Listesi Tablosu (Mevcut Tablon Kalacak) */}
                    <div className="bg-retro-card border border-purple-900/40 rounded-3xl overflow-hidden shadow-xl">
                        {/* Mevcut <table> kodların burada aynen devam ediyor... */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs text-gray-300">
                                <thead className="bg-retro-dark text-gray-400 uppercase text-[10px] tracking-wider border-b border-purple-900/40">
                                    <tr>
                                        <th className="py-3.5 px-4">Kullanıcı</th>
                                        <th className="py-3.5 px-4">Evcil Hayvan</th>
                                        <th className="py-3.5 px-4">Seans Sayısı</th>
                                        <th className="py-3.5 px-4">Bakiye</th>
                                        <th className="py-3.5 px-4">Rol</th>
                                        <th className="py-3.5 px-4">Durum</th>
                                        <th className="py-3.5 px-4 text-right">İşlemler</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-purple-900/20">
                                    {users.map((u) => {
                                        const isDog = u.pet?.type === 'dog';
                                        const isRabbit = u.pet?.type === 'rabbit';
                                        const petEmoji = isDog ? '🐶' : isRabbit ? '🐰' : '🐱';

                                        return (
                                            <tr key={u.id} className="hover:bg-purple-950/20 transition-colors">
                                                <td className="py-3.5 px-4 font-bold text-white">
                                                    <div>{u.username}</div>
                                                    <div className="text-[10px] text-gray-500 font-normal">{u.email}</div>
                                                </td>
                                                <td className="py-3.5 px-4">
                                                    <span className="flex items-center gap-1.5">
                                                        <span>{petEmoji}</span>
                                                        <span className="font-semibold text-gray-200">{u.pet?.name || '-'}</span>
                                                        <span className="text-[10px] text-gray-500">(Lvl {u.pet?.level || 1})</span>
                                                    </span>
                                                </td>
                                                <td className="py-3.5 px-4 font-mono font-bold text-purple-300">
                                                    {u._count?.sessions || 0} seans
                                                </td>
                                                <td className="py-3.5 px-4 font-mono font-bold text-yellow-400">
                                                    🪙 {u.coins}
                                                </td>
                                                <td className="py-3.5 px-4">
                                                    <select
                                                        value={u.role}
                                                        onChange={(e) => handleOpenRoleModal(u, e.target.value)}
                                                        className="bg-retro-dark border border-purple-900/40 text-[11px] font-bold rounded-lg px-2 py-1 text-white focus:outline-none focus:border-amber-500 cursor-pointer"
                                                    >
                                                        <option value="USER">USER</option>
                                                        <option value="ADMIN">ADMIN</option>
                                                    </select>
                                                </td>
                                                <td className="py-3.5 px-4">
                                                    {u.isActive ? (
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 text-[10px] font-bold border border-emerald-800/40">
                                                            <CheckCircle2 size={10} /> Aktif
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-950 text-rose-400 text-[10px] font-bold border border-rose-800/40">
                                                            <XCircle size={10} /> Askıda
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="py-3.5 px-4 text-right">
                                                    <button
                                                        onClick={() => handleOpenStatusModal(u)}
                                                        className={`px-3 py-1.5 rounded-xl text-[11px] font-black border transition-all ${u.isActive
                                                            ? 'bg-rose-950/40 text-rose-300 border-rose-800/40 hover:bg-rose-900/60 hover:border-rose-600 shadow-sm'
                                                            : 'bg-emerald-950/40 text-emerald-300 border-emerald-800/40 hover:bg-emerald-900/60 hover:border-emerald-600 shadow-sm'
                                                            }`}
                                                    >
                                                        {u.isActive ? 'Askıya Al' : 'Aktifleştir'}
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* YENİ KULLANICI EKLEME MODALI */}
                    {isAddUserOpen && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
                            <div className="bg-retro-card border-2 border-amber-500/50 p-6 rounded-3xl max-w-md w-full shadow-2xl relative">
                                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                    <Users size={20} className="text-amber-400" />
                                    <span>Yeni Kullanıcı Hesabı Tanımla</span>
                                </h3>

                                <form onSubmit={handleCreateUser} className="space-y-3">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-300 mb-1">Kullanıcı Adı</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="Örn: ahmet123"
                                            value={newUser.username}
                                            onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                                            className="w-full px-3 py-2 bg-retro-dark border border-purple-900/50 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-300 mb-1">E-posta Adresi</label>
                                        <input
                                            type="email"
                                            required
                                            placeholder="Örn: ahmet@mail.com"
                                            value={newUser.email}
                                            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                                            className="w-full px-3 py-2 bg-retro-dark border border-purple-900/50 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-300 mb-1">Şifre</label>
                                            <input
                                                type="password"
                                                required
                                                placeholder="En az 6 karakter"
                                                value={newUser.password}
                                                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                                                className="w-full px-3 py-2 bg-retro-dark border border-purple-900/50 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-gray-300 mb-1">Hesap Rolü</label>
                                            <select
                                                value={newUser.role}
                                                onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                                                className="w-full px-3 py-2 bg-retro-dark border border-purple-900/50 rounded-xl text-xs text-white focus:outline-none"
                                            >
                                                <option value="USER">USER</option>
                                                <option value="ADMIN">ADMIN</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="pt-2 border-t border-purple-900/30">
                                        <span className="text-[11px] font-bold text-purple-300 uppercase tracking-wider block mb-2">
                                            Evcil Hayvan Ayarları
                                        </span>

                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-xs font-bold text-gray-300 mb-1">Hayvan Adı</label>
                                                <input
                                                    type="text"
                                                    required
                                                    placeholder="Örn: Pamuk"
                                                    value={newUser.petName}
                                                    onChange={(e) => setNewUser({ ...newUser, petName: e.target.value })}
                                                    className="w-full px-3 py-2 bg-retro-dark border border-purple-900/50 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-xs font-bold text-gray-300 mb-1">Türü</label>
                                                <select
                                                    value={newUser.petType}
                                                    onChange={(e) => setNewUser({ ...newUser, petType: e.target.value })}
                                                    className="w-full px-3 py-2 bg-retro-dark border border-purple-900/50 rounded-xl text-xs text-white focus:outline-none"
                                                >
                                                    <option value="cat">🐱 Kedi</option>
                                                    <option value="dog">🐶 Köpek</option>
                                                    <option value="rabbit">🐰 Tavşan</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-2 pt-4">
                                        <button
                                            type="button"
                                            onClick={() => setIsAddUserOpen(false)}
                                            className="flex-1 py-2.5 rounded-xl bg-retro-dark border border-purple-900/40 text-gray-300 font-bold text-xs"
                                        >
                                            İptal
                                        </button>
                                        <button
                                            type="submit"
                                            className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-md"
                                        >
                                            Kullanıcıyı Kaydet
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* ================= 3. SEKME: MAĞAZA YÖNETİMİ ================= */}
            {activeTab === 'shop' && (
                <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-retro-card border border-purple-900/40 p-4 rounded-2xl gap-3">
                        <div>
                            <h3 className="text-sm font-bold text-white">Mağazadaki Eşyalar</h3>
                            <p className="text-xs text-gray-400">Yeni ürün ekleyin veya mevcut ürünleri pasife alın</p>
                        </div>

                        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                            {/* Sıralama Dropdown'ı */}
                            <select
                                value={shopSort}
                                onChange={(e) => setShopSort(e.target.value)}
                                className="bg-retro-dark border border-purple-900/40 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                            >
                                <option value="active_first">Önce Aktifler</option>
                                <option value="passive_first">Önce Pasifler</option>
                                <option value="price_asc">Fiyat: Düşükten Yükseğe</option>
                                <option value="price_desc">Fiyat: Yüksekten Düşüğe</option>
                            </select>

                            <button
                                onClick={() => setIsAddProductOpen(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-black shadow-md transition-colors whitespace-nowrap"
                            >
                                <Plus size={16} />
                                <span>Yeni Ürün Ekle</span>
                            </button>
                        </div>
                    </div>

                    {/* Ürün Listesi Grid (sortedShopItems üzerinden dönüyoruz) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {sortedShopItems.map((item) => (
                            <div
                                key={item.id}
                                className={`p-5 rounded-2xl border transition-all ${item.isActive
                                    ? 'bg-retro-card border-purple-900/40'
                                    : 'bg-retro-dark/40 border-gray-800 opacity-60'
                                    }`}
                            >
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <span className="text-xs font-bold text-white">{item.name}</span>
                                        <span className="block text-[10px] text-gray-400 uppercase tracking-wider font-semibold">
                                            {item.type}
                                        </span>
                                    </div>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.isActive ? 'bg-emerald-950 text-emerald-400' : 'bg-gray-800 text-gray-400'
                                        }`}>
                                        {item.isActive ? 'Aktif' : 'Pasif'}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between text-xs my-4 pt-3 border-t border-purple-900/20 font-mono">
                                    <span className="text-amber-400 font-bold">🪙 {item.price} Jeton</span>
                                    <span className="text-emerald-400 font-bold">+{item.effectValue} Açlık</span>
                                </div>

                                <button
                                    onClick={() => handleToggleShopItem(item.id)}
                                    className={`w-full py-2 rounded-xl text-xs font-bold border transition-colors ${item.isActive
                                        ? 'bg-rose-950/30 text-rose-300 border-rose-800/40 hover:bg-rose-900/50'
                                        : 'bg-emerald-950/30 text-emerald-300 border-emerald-800/40 hover:bg-emerald-900/50'
                                        }`}
                                >
                                    {item.isActive ? 'Satıştan Kaldır (Pasif)' : 'Yeniden Satışa Sun'}
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* Yeni Ürün Ekleme Modalı */}
                    {isAddProductOpen && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
                            <div className="bg-retro-card border-2 border-amber-500/50 p-6 rounded-3xl max-w-md w-full shadow-2xl relative">
                                <h3 className="text-lg font-bold text-white mb-4">Yeni Mağaza Ürünü Ekle</h3>
                                <form onSubmit={handleCreateProduct} className="space-y-3">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-300 mb-1">Ürün Adı</label>
                                        <input
                                            type="text"
                                            required
                                            value={newProduct.name}
                                            onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                                            placeholder="Örn: Çilekli Pasta"
                                            className="w-full px-3 py-2 bg-retro-dark border border-purple-900/50 rounded-xl text-xs text-white focus:outline-none"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-300 mb-1">Türü</label>
                                            <select
                                                value={newProduct.type}
                                                onChange={(e) => setNewProduct({ ...newProduct, type: e.target.value })}
                                                className="w-full px-3 py-2 bg-retro-dark border border-purple-900/50 rounded-xl text-xs text-white focus:outline-none"
                                            >
                                                <option value="food">Yiyecek</option>
                                                <option value="accessory">Aksesuar</option>
                                                <option value="decor">Dekor</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-gray-300 mb-1">Fiyat (Jeton)</label>
                                            <input
                                                type="number"
                                                min="1"
                                                required
                                                value={newProduct.price}
                                                onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                                                className="w-full px-3 py-2 bg-retro-dark border border-purple-900/50 rounded-xl text-xs text-white focus:outline-none"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-300 mb-1">Açlık Doyurma Puanı</label>
                                        <input
                                            type="number"
                                            min="0"
                                            max="100"
                                            required
                                            value={newProduct.effectValue}
                                            onChange={(e) => setNewProduct({ ...newProduct, effectValue: e.target.value })}
                                            className="w-full px-3 py-2 bg-retro-dark border border-purple-900/50 rounded-xl text-xs text-white focus:outline-none"
                                        />
                                    </div>

                                    <div className="flex gap-2 pt-4">
                                        <button
                                            type="button"
                                            onClick={() => setIsAddProductOpen(false)}
                                            className="flex-1 py-2.5 rounded-xl bg-retro-dark border border-purple-900/40 text-gray-300 font-bold text-xs"
                                        >
                                            İptal
                                        </button>
                                        <button
                                            type="submit"
                                            className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-md"
                                        >
                                            Kaydet & Yayınla
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* ================= 4. SEKME: DENETİM GÜNLÜĞÜ (AUDIT LOGS) ================= */}
            {activeTab === 'logs' && (
                <div className="bg-retro-card border border-purple-900/40 rounded-3xl p-6 shadow-xl space-y-4">
                    <div className="border-b border-purple-900/40 pb-4">
                        <h3 className="text-base font-bold text-white flex items-center gap-2">
                            <FileText size={18} className="text-amber-400" />
                            <span>Yönetici İşlem Kayıtları (Audit Trail)</span>
                        </h3>
                        <p className="text-xs text-gray-400">Kullanıcı askıya alma, rol değişimi ve ürün güncellemelerinin zaman damgalı dökümü</p>
                    </div>

                    <div className="space-y-2.5">
                        {logs.length === 0 ? (
                            <p className="text-xs text-gray-400 text-center py-8">Henüz kayıtlı bir denetim hareketi yok.</p>
                        ) : (
                            logs.map((log) => {
                                const dateStr = new Date(log.createdAt).toLocaleString('tr-TR');
                                return (
                                    <div key={log.id} className="p-3.5 bg-retro-dark/60 border border-purple-900/30 rounded-xl flex items-center justify-between text-xs">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-amber-400 font-mono text-[11px] px-2 py-0.5 bg-amber-950/60 border border-amber-800/40 rounded">
                                                    {log.action}
                                                </span>
                                                <span className="font-semibold text-white">{log.target}</span>
                                            </div>
                                            <p className="text-[11px] text-gray-400">{log.details}</p>
                                        </div>
                                        <div className="text-right text-[10px] text-gray-500 font-mono shrink-0">
                                            <div>{log.admin?.username || 'Yönetici'}</div>
                                            <div>{dateStr}</div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            )}

            {/* ================= RETRO KULLANICI İŞLEM ONAY MODALI ================= */}
            {confirmModalData.isOpen && confirmModalData.user && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-retro-card border-2 border-purple-500/50 p-6 md:p-8 rounded-3xl max-w-md w-full shadow-2xl relative flex flex-col items-center text-center">

                        {/* İkon Rozeti */}
                        <div className={`p-4 rounded-2xl mb-4 border ${confirmModalData.actionType === 'suspend'
                                ? 'bg-rose-950/70 border-rose-800/60 text-rose-400'
                                : confirmModalData.actionType === 'role_change'
                                    ? 'bg-amber-950/70 border-amber-800/60 text-amber-400'
                                    : 'bg-emerald-950/70 border-emerald-800/60 text-emerald-400'
                            }`}>
                            {confirmModalData.actionType === 'suspend' ? (
                                <AlertTriangle size={36} className="animate-pulse" />
                            ) : confirmModalData.actionType === 'role_change' ? (
                                <ShieldAlert size={36} />
                            ) : (
                                <CheckCircle2 size={36} />
                            )}
                        </div>

                        {/* Başlık */}
                        <h3 className="text-xl font-black text-white tracking-wide mb-2">
                            {confirmModalData.actionType === 'suspend'
                                ? 'Hesabı Askıya Al'
                                : confirmModalData.actionType === 'role_change'
                                    ? 'Kullanıcı Rolünü Değiştir'
                                    : 'Hesabı Yeniden Aktifleştir'}
                        </h3>

                        {/* Açıklama Metni */}
                        <p className="text-xs text-gray-300 leading-relaxed mb-4">
                            <span className="font-bold text-amber-400 font-mono">
                                @{confirmModalData.user.username}
                            </span>{' '}
                            adlı kullanıcının{' '}
                            {confirmModalData.actionType === 'role_change' ? (
                                <>
                                    rolünü{' '}
                                    <span className="text-purple-300 font-bold font-mono">[{confirmModalData.user.role}]</span>{' '}
                                    seviyesinden{' '}
                                    <span className="text-amber-400 font-bold font-mono">[{confirmModalData.newRole}]</span>{' '}
                                    seviyesine güncellemek üzeresiniz.
                                </>
                            ) : confirmModalData.actionType === 'suspend' ? (
                                <>hesabını <span className="text-rose-400 font-bold">askıya almak</span> üzeresiniz.</>
                            ) : (
                                <>hesabını <span className="text-emerald-400 font-bold">yeniden aktifleştirmek</span> üzeresiniz.</>
                            )}
                        </p>

                        {/* Rol Değişimi veya Askıya Alma Uyarı Kutusu */}
                        {confirmModalData.actionType === 'role_change' && confirmModalData.newRole === 'ADMIN' && (
                            <div className="w-full bg-retro-dark/80 border border-amber-500/30 p-3 rounded-xl mb-6 text-left space-y-1">
                                <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-400">
                                    <ShieldAlert size={13} />
                                    <span>Yönetici Yetkisi Uyarısı:</span>
                                </div>
                                <p className="text-[11px] text-gray-400">
                                    Bu kullanıcı tüm yönetim paneline, mağaza ürün düzenlemelerine ve kullanıcı denetimlerine tam erişim sağlayacaktır.
                                </p>
                            </div>
                        )}

                        {confirmModalData.actionType === 'suspend' && (
                            <div className="w-full bg-retro-dark/80 border border-purple-900/40 p-3 rounded-xl mb-6 text-left space-y-1">
                                <div className="flex items-center gap-1.5 text-[11px] font-bold text-rose-400">
                                    <XCircle size={13} />
                                    <span>Askıya Alma Sonuçları:</span>
                                </div>
                                <ul className="text-[11px] text-gray-400 list-disc list-inside space-y-0.5">
                                    <li>Kullanıcının aktif odaklanma seansı iptal edilir.</li>
                                    <li>Kullanıcı sisteme giriş yapamaz (403 alır).</li>
                                    <li>İşlem denetim günlüğüne (Audit Log) kaydedilir.</li>
                                </ul>
                            </div>
                        )}

                        {/* Butonlar */}
                        <div className="flex items-center gap-3 w-full">
                            <button
                                type="button"
                                onClick={() => {
                                    setConfirmModalData({ isOpen: false, user: null, actionType: 'suspend', newRole: null });
                                    fetchUsers(); // İptal edilirse select'i eski haline çekmek için
                                }}
                                className="flex-1 py-3 bg-retro-dark hover:bg-slate-900 text-gray-300 rounded-xl text-xs font-bold border border-purple-900/40 transition-colors"
                            >
                                Vazgeç
                            </button>

                            <button
                                type="button"
                                onClick={handleConfirmAction}
                                className={`flex-1 py-3 rounded-xl text-xs font-black shadow-lg transition-all ${confirmModalData.actionType === 'suspend'
                                        ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-950/40'
                                        : confirmModalData.actionType === 'role_change'
                                            ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-950/40'
                                            : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950/40'
                                    }`}
                            >
                                {confirmModalData.actionType === 'suspend'
                                    ? 'Evet, Askıya Al'
                                    : confirmModalData.actionType === 'role_change'
                                        ? 'Evet, Rolü Değiştir'
                                        : 'Evet, Aktifleştir'}
                            </button>
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
}