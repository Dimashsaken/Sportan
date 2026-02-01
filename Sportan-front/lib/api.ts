import axios from 'axios';
import { config } from './config';
import { useAuthStore } from '@/store/authStore';
import { LOG } from '@/lib/logger';

export const api = axios.create({
  baseURL: config.apiUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  async (requestConfig) => {
    LOG.debug(`Request: ${requestConfig.method?.toUpperCase()} ${requestConfig.url}`, requestConfig.data);
    
    const token = useAuthStore.getState().token;
    
    if (token) {
      requestConfig.headers.Authorization = `Bearer ${token}`;
    }
    
    return requestConfig;
  },
  (error) => {
    LOG.error('Request Error:', error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    LOG.debug(`Response: ${response.status} ${response.config.url}`, response.data);
    return response;
  },
  async (error) => {
    LOG.error(`Response Error: ${error.response?.status} ${error.config?.url}`, error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      const detail = error.response.data?.detail || '';
      const msg = typeof detail === 'string' ? detail.toLowerCase() : '';
      
      // Only logout for actual authentication failures (expired/invalid token)
      // Supabase/FastAPI typically returns "Could not validate credentials" or "Signature has expired"
      if (
        msg.includes('expired') || 
        msg.includes('invalid') || 
        msg.includes('credentials') ||
        msg.includes('signature')
      ) {
        await useAuthStore.getState().logout();
      }
    }
    return Promise.reject(error);
  }
);
