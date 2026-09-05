import axios from 'axios';

const api = axios.create({
<<<<<<< HEAD
  baseURL: 'http://10.0.2.2:5000/api',
=======
  baseURL: 'http://10.0.2.2:5000/api/v1',
>>>>>>> 93956b05108efbaa274c5028d04e7a442a535515
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;