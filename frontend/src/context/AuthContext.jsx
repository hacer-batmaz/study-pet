import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/client';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  //sayfa ilk yuklendiginde token varsa kullaniciyi cek
  const fetchUser = async () => {
    const token = localStorage.getItem('study_pet_token');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await api.get('/auth/me');
      setUser(response.data);
    } catch (error) {
      console.error('Kullanıcı bilgisi alınamadı:', error);
      localStorage.removeItem('study_pet_token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const login = (token, userData) => {
    localStorage.setItem('study_pet_token', token);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('study_pet_token');
    setUser(null);
  };

  //seans bitimi, alisveris veya besleme sonrasi kullanici/hayvan state'ini guncelleme
  const updateUserState = (updates) => {
    setUser((prev) => ({ ...prev, ...updates }));
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUserState, refreshUser: fetchUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);