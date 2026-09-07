import api from './axios';

const sendOtp = async phone => {
  const response = await api.post('/auth/send-otp', {phone});
  return response.data;
};

const verifyOtp = async ({phone, otp}) => {
  const response = await api.post('/auth/verify-otp', {phone, otp});
  return response.data;
};

const completeProfile = async payload => {
  const response = await api.post('/auth/complete-profile', payload);
  return response.data;
};

export {
  sendOtp,
  verifyOtp,
  completeProfile,
};
