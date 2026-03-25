import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ⚠️ IMPORTANT: Mobile apps MUST connect to the BACKEND API URL,
// not the FRONTEND website URL.
// 👇 LOCAL TESTING: Use your machine's LAN IP so Expo/emulator can reach the backend
export const BASE_URL = 'http://192.168.1.11:5000';
// export const BASE_URL = 'https://demand-based-crop-planning-system-2.onrender.com'; // Production

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
});

// Interceptor to attach the JWT token to every request
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('jwtToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add a response interceptor to handle 401 errors globally
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token and user on 401
      await AsyncStorage.removeItem('jwtToken');
      await AsyncStorage.removeItem('user');
      console.error('Session expired (401). Cleared local storage.');
    }
    return Promise.reject(error);
  }
);

export default api;
