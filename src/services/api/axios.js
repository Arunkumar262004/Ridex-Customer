import axios from 'axios';
import {API_BASE_URL} from '../../constants/config';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

let authToken = null;

const setAuthToken = token => {
  authToken = token;
};

api.interceptors.request.use(config => {
  if (authToken) {
    config.headers.Authorization = `Bearer ${authToken}`;
  }

  return config;
});

export {setAuthToken};
export default api;