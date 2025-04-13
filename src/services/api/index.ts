import axios from 'axios';
import { setupInterceptors } from '@services/interceptors';

// Cria uma instância do axios com configurações personalizadas
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Configura os interceptors
setupInterceptors(api);

export default api;
