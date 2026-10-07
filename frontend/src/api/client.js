import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

//her istege localStorage'daki token i ekle
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('study_pet_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

//oturum suresi dolmussa temizle
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('study_pet_token');
    }
    return Promise.reject(error);
  }
);

export default api;