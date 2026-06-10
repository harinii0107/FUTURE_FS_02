import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL + '/api',
});

// Add this line so we can debug
console.log('API URL:', import.meta.env.VITE_API_URL);

export default api;