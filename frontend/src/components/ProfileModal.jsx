import { useState, useEffect } from 'react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { User, X, Check, AlertCircle, Save, KeyRound } from 'lucide-react';

export default function ProfileModal({ isOpen, onClose }) {
    const { user, updateUserState } = useAuth();
    const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'password'

    // Profil Form State'leri
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [petName, setPetName] = useState('');

    // Şifre Form State'leri
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [loading, setLoading] = useState(false);
    const [statusMessage, setStatusMessage] = useState(null);

    // Modal her açıldığında formu ve mesajları sıfırla
    useEffect(() => {
        if (isOpen) {
            setActiveTab('profile');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            setStatusMessage(null);
        }
    }, [isOpen]);

    // Kullanıcı bilgisi değişince sadece profil alanlarını senkronla (mesaja dokunma)
    useEffect(() => {
        if (isOpen && user) {
            setUsername(user.username || '');
            setEmail(user.email || '');
            setPetName(user.pet?.name || '');
        }
    }, [isOpen, user]);

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setLoading(true);
        setStatusMessage(null);

        try {
            const res = await api.put('/auth/profile', {
                username,
                email,
                petName
            });

            // Context üzerindeki kullanıcı ve hayvan bilgilerini güncelle
            updateUserState({
                username: res.data.user.username,
                email: res.data.user.email,
                pet: {
                    ...user?.pet,
                    ...(res.data.user.pet && { name: res.data.user.pet.name })
                }
            });

            // Backend'den dönen detaylı bildirim mesajı (örn: x'ten y'ye değiştirildi)
            setStatusMessage({ type: 'success', text: res.data.message });
        } catch (err) {
            setStatusMessage({
                type: 'error',
                text: err.response?.data?.error || 'Profil güncellenirken bir hata oluştu.'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();

        // 1. Yeni şifre mevcut şifre ile aynı mı kontrolü
        if (currentPassword === newPassword) {
            setStatusMessage({ type: 'error', text: 'Yeni şifre mevcut şifre ile aynı olamaz.' });
            return;
        }

        // 2. Yeni şifre onay kontrolü
        if (newPassword !== confirmPassword) {
            setStatusMessage({ type: 'error', text: 'Yeni şifreler birbiriyle uyuşmuyor!' });
            return;
        }

        // 3. Minimum karakter kontrolü
        if (newPassword.length < 6) {
            setStatusMessage({ type: 'error', text: 'Yeni şifre en az 6 karakter olmalıdır.' });
            return;
        }

        setLoading(true);
        setStatusMessage(null);

        try {
            const res = await api.put('/auth/change-password', {
                currentPassword,
                newPassword
            });

            setStatusMessage({ type: 'success', text: res.data.message || 'Şifre başarıyla güncellendi!' });
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err) {
            setStatusMessage({
                type: 'error',
                text: err.response?.data?.error || 'Şifre değiştirilemedi.'
            });
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
            <div className="bg-retro-card border-2 border-purple-500/40 p-6 md:p-8 rounded-3xl max-w-lg w-full shadow-2xl relative flex flex-col">
                {/* Kapat Butonu */}
                <button
                    onClick={onClose}
                    aria-label="Kapat"
                    className="absolute right-5 top-5 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl p-2 transition-colors"
                >
                    <X size={20} />
                </button>

                {/* Üst Başlık & Sekmeler */}
                <div className="flex items-center justify-between border-b border-purple-900/40 pb-5 mb-5 pr-10">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-purple-950/60 text-retro-purple rounded-2xl flex items-center justify-center shrink-0">
                            <User size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white tracking-wide">Profil Ayarları</h3>
                            <p className="text-xs text-gray-400">Hesabını ve dostunu özelleştir</p>
                        </div>
                    </div>

                    <div className="flex bg-retro-dark p-1 rounded-xl border border-purple-900/40 shrink-0">
                        <button
                            type="button"
                            onClick={() => { setActiveTab('profile'); setStatusMessage(null); }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'profile'
                                    ? 'bg-retro-purple text-white shadow-sm'
                                    : 'text-gray-400 hover:text-white'
                                }`}
                        >
                            Profil
                        </button>
                        <button
                            type="button"
                            onClick={() => { setActiveTab('password'); setStatusMessage(null); }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'password'
                                    ? 'bg-retro-purple text-white shadow-sm'
                                    : 'text-gray-400 hover:text-white'
                                }`}
                        >
                            Güvenlik
                        </button>
                    </div>
                </div>

                {/* Durum Bildirimi */}
                {statusMessage && (
                    <div
                        className={`p-3.5 rounded-xl text-xs font-semibold mb-4 flex items-center gap-2 animate-fadeIn ${statusMessage.type === 'success'
                                ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/40'
                                : 'bg-red-950/80 text-red-300 border border-red-800/40'
                            }`}
                    >
                        {statusMessage.type === 'success' ? <Check size={16} className="shrink-0" /> : <AlertCircle size={16} className="shrink-0" />}
                        <span>{statusMessage.text}</span>
                    </div>
                )}

                {/* Profil Sekmesi */}
                {activeTab === 'profile' ? (
                    <form onSubmit={handleUpdateProfile} className="space-y-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                                Kullanıcı Adı
                            </label>
                            <input
                                type="text"
                                required
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full h-11 bg-retro-dark border border-purple-900/50 focus:border-retro-purple rounded-xl px-4 text-sm text-white focus:outline-none transition-colors"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                                E-Posta Adresi
                            </label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full h-11 bg-retro-dark border border-purple-900/50 focus:border-retro-purple rounded-xl px-4 text-sm text-white focus:outline-none transition-colors"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                                Sanal Dostunun İsmi
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={petName}
                                    onChange={(e) => setPetName(e.target.value)}
                                    placeholder="Dostunun adı..."
                                    className="w-full h-11 bg-retro-dark border border-purple-900/50 focus:border-retro-purple rounded-xl px-4 text-sm text-white focus:outline-none transition-colors"
                                />
                                <span className="absolute right-3.5 top-3 text-xs select-none">🐾</span>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full mt-2 h-11 flex items-center justify-center gap-2 bg-retro-purple hover:bg-purple-600 text-white rounded-xl text-sm font-bold shadow-lg transition-all disabled:opacity-50"
                        >
                            <Save size={16} />
                            <span>{loading ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}</span>
                        </button>
                    </form>
                ) : (
                    /* Şifre Sekmesi */
                    <form onSubmit={handleChangePassword} className="space-y-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                                Mevcut Şifre
                            </label>
                            <input
                                type="password"
                                required
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full h-11 bg-retro-dark border border-purple-900/50 focus:border-retro-purple rounded-xl px-4 text-sm text-white focus:outline-none transition-colors"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                                Yeni Şifre
                            </label>
                            <input
                                type="password"
                                required
                                minLength={6}
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="En az 6 karakter"
                                className="w-full h-11 bg-retro-dark border border-purple-900/50 focus:border-retro-purple rounded-xl px-4 text-sm text-white focus:outline-none transition-colors"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                                Yeni Şifre (Tekrar)
                            </label>
                            <input
                                type="password"
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full h-11 bg-retro-dark border border-purple-900/50 focus:border-retro-purple rounded-xl px-4 text-sm text-white focus:outline-none transition-colors"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full mt-2 h-11 flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-sm font-bold shadow-lg transition-all disabled:opacity-50"
                        >
                            <KeyRound size={16} />
                            <span>{loading ? 'Güncelleniyor...' : 'Şifreyi Güncelle'}</span>
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}