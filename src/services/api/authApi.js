import api from './axios';

const loginUser = async ({email, password}) => {
  const response = await api.post('/auth/login', {
    email,
    password,
  });

  return response.data;
};

const registerUser = async ({
  name,
  email,
  phone,
  password,
}) => {
  const response = await api.post('/auth/register', {
    name,
    email,
    phone,
    password,
  });

  return response.data;
};

const getCurrentUser = async () => {
  const response = await api.get('/auth/me');

  return response.data;
};

const logoutUser = async () => {
  const response = await api.post('/auth/logout');

  return response.data;
};

export {
  loginUser,
  registerUser,
  getCurrentUser,
  logoutUser,
};