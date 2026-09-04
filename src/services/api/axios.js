import axios from 'axios';

const api = axios.create({
  baseURL: 'http://10.0.2.2:5000/api/v1',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;