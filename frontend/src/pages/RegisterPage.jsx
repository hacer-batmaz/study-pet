import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import { UserPlus, Mail, Lock, User, AlertCircle, Heart, Eye, EyeOff } from 'lucide-react';

const PET_OPTIONS = [
  { type: 'cat', name: 'Kedi', emoji: '🐱', desc: 'Meraklı ve sakin çalışma arkadaşı' },
  { type: 'dog', name: 'Köpek', emoji: '🐶', desc: 'Sadık ve yüksek enerjili odak dostu' },
  { type: 'rabbit', name: 'Tavşan', emoji: '🐰', desc: 'Hızlı ve dikkatli zaman takipçisi' }
];

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    petType: 'cat',
    petName: ''
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSelectPet = (type) => {
    setFormData({ ...formData, petType: type });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. Şifre eşleşme ve uzunluk kontrolleri
    if (formData.password.length < 6) {
      setError('Şifre en az 6 karakter olmalıdır.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Girdiğiniz şifreler birbiriyle eşleşmiyor!');
      return;
    }

    // 2. Hayvan adı kontrolü
    if (!formData.petName.trim()) {
      setError('Lütfen sevimli dostuna bir isim ver!');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Backend confirmPassword beklemediği için onu ayırarak gönderiyoruz
      const { confirmPassword, ...registerPayload } = formData;
      const response = await api.post('/auth/register', registerPayload);
      login(response.data.token, response.data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Kayıt başarısız oldu. Lütfen tekrar dene.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4 py-12">
      <div className="bg-retro-card border border-purple-900/40 p-8 rounded-2xl w-full max-w-xl shadow-2xl">
        <div className="text-center mb-6">
          <div className="inline-flex p-3 bg-pink-950/60 rounded-2xl text-retro-pink mb-3">
            <UserPlus size={28} />
          </div>
          <h2 className="text-2xl font-bold text-white">StudyPet Ailesine Katıl</h2>
          <p className="text-sm text-gray-400 mt-1">Hesabını oluştur ve ilk sanal hayvanını sahiplen!</p>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 mb-6 bg-red-950/50 border border-red-500/40 rounded-xl text-red-300 text-sm">
            <AlertCircle size={18} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Kullanıcı Adı & E-Posta */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">Kullanıcı Adı</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input
                  type="text"
                  name="username"
                  required
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="caliskan_ogrenci"
                  className="w-full bg-retro-dark border border-purple-900/50 focus:border-retro-purple rounded-xl pl-11 pr-4 py-2.5 text-sm text-white focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">E-Posta</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="ornek@posta.com"
                  className="w-full bg-retro-dark border border-purple-900/50 focus:border-retro-purple rounded-xl pl-11 pr-4 py-2.5 text-sm text-white focus:outline-none transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Şifre ve Şifre Tekrarı Alanları */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">Şifre</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="En az 6 karakter"
                  className="w-full bg-retro-dark border border-purple-900/50 focus:border-retro-purple rounded-xl pl-11 pr-11 py-2.5 text-sm text-white focus:outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">Şifre Tekrarı</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Şifreyi tekrar yazın"
                  className="w-full bg-retro-dark border border-purple-900/50 focus:border-retro-purple rounded-xl pl-11 pr-11 py-2.5 text-sm text-white focus:outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          </div>

          {/* Hayvan Seçimi */}
          <div className="pt-2 border-t border-white/5">
            <label className="block text-xs font-semibold text-retro-accent uppercase tracking-wider mb-3">
              1. Dostunu Seç:
            </label>
            <div className="grid grid-cols-3 gap-3 mb-4">
              {PET_OPTIONS.map((pet) => {
                const isSelected = formData.petType === pet.type;
                return (
                  <button
                    key={pet.type}
                    type="button"
                    onClick={() => handleSelectPet(pet.type)}
                    className={`p-3 rounded-xl border flex flex-col items-center text-center transition-all ${
                      isSelected
                        ? 'border-retro-pink bg-pink-950/30 scale-102 ring-2 ring-retro-pink/40'
                        : 'border-purple-900/40 bg-retro-dark/50 hover:border-purple-600/50'
                    }`}
                  >
                    <span className="text-3xl mb-1">{pet.emoji}</span>
                    <span className="font-bold text-sm text-white">{pet.name}</span>
                    <span className="text-[10px] text-gray-400 mt-1 leading-tight">{pet.desc}</span>
                  </button>
                );
              })}
            </div>

            <label className="block text-xs font-semibold text-retro-accent uppercase tracking-wider mb-2">
              2. Dostuna İsim Ver:
            </label>
            <div className="relative">
              <Heart className="absolute left-3.5 top-1/2 -translate-y-1/2 text-retro-pink" size={18} />
              <input
                type="text"
                name="petName"
                required
                value={formData.petName}
                onChange={handleChange}
                placeholder="Örn: Pamuk, Boncuk, Gece..."
                className="w-full bg-retro-dark border border-purple-900/50 focus:border-retro-pink rounded-xl pl-11 pr-4 py-2.5 text-sm text-white focus:outline-none transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-retro-purple to-pink-600 hover:from-purple-600 hover:to-pink-500 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-purple-500/20 mt-2"
          >
            {loading ? 'Kayıt Yapılıyor...' : 'Sahiplen ve Başla'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-400 mt-5">
          Zaten bir hesabın var mı?{' '}
          <Link to="/login" className="text-retro-accent hover:underline font-semibold">
            Giriş Yap
          </Link>
        </p>
      </div>
    </div>
  );
}