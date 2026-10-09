import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import { LogIn, Mail, Lock, AlertCircle, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/auth/login', formData);
      login(response.data.token, response.data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Giriş yapılamadı. Bilgilerini kontrol et.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4 py-12">
      <div className="bg-retro-card border border-purple-900/40 p-8 rounded-2xl w-full max-w-md shadow-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-purple-950/60 rounded-2xl text-retro-purple mb-3">
            <LogIn size={28} />
          </div>
          <h2 className="text-2xl font-bold text-white">Tekrar Hoş Geldin!</h2>
          <p className="text-sm text-gray-400 mt-1">Dostun seni bekliyor, hemen giriş yap.</p>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 mb-6 bg-red-950/50 border border-red-500/40 rounded-xl text-red-300 text-sm">
            <AlertCircle size={18} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
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
                placeholder="ornek@ogrenci.edu.tr"
                className="w-full bg-retro-dark border border-purple-900/50 focus:border-retro-purple rounded-xl pl-11 pr-4 py-3 text-sm text-white focus:outline-none transition-colors"
              />
            </div>
          </div>

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
                placeholder="••••••••"
                className="w-full bg-retro-dark border border-purple-900/50 focus:border-retro-purple rounded-xl pl-11 pr-11 py-3 text-sm text-white focus:outline-none transition-colors"
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

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-retro-purple hover:bg-purple-600 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl transition-colors shadow-lg shadow-purple-500/20 mt-2"
          >
            {loading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-400 mt-6">
          Henüz hesabın yok mu?{' '}
          <Link to="/register" className="text-retro-accent hover:underline font-semibold">
            Kayıt Ol
          </Link>
        </p>
      </div>
    </div>
  );
}