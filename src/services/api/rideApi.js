import api from './axios';

const getVehicleTypes = async () => {
  const response = await api.get('/vehicle-types');
  return response.data;
};

const getFareEstimate = async ({ vehicleTypeId, pickup, destination }) => {
  const response = await api.post('/rides/estimate', {
    vehicleTypeId,
    pickup: { latitude: pickup.latitude, longitude: pickup.longitude },
    destination: { latitude: destination.latitude, longitude: destination.longitude },
  });
  return response.data;
};

const createRide = async (rideData) => {
  const response = await api.post('/rides', rideData);
  return response.data;
};

const acceptRide = async (rideId) => {
  const response = await api.post(`/rides/${rideId}/accept`);
  return response.data;
};

const captainArrived = async (rideId) => {
  const response = await api.post(`/rides/${rideId}/arrived`);
  return response.data;
};

/**
 * Customer fetches fresh dynamic QR token payload
 */
const getDynamicQrToken = async (rideId) => {
  const response = await api.get(`/rides/${rideId}/qr-token`);
  return response.data; // { success: true, data: { qrData, expiresAt } }
};

/**
 * Captain sends scanned QR data to verify and start ride
 */
const verifyQrAndStartRide = async (rideId, scannedQrData) => {
  const response = await api.post(`/rides/${rideId}/verify-qr-start`, {
    scannedQrData,
  });
  return response.data;
};

const completeRide = async (rideId) => {
  const response = await api.post(`/rides/${rideId}/complete`);
  return response.data;
};

export {
  getVehicleTypes,
  getFareEstimate,
  createRide,
  acceptRide,
  captainArrived,
  getDynamicQrToken,
  verifyQrAndStartRide,
  completeRide,
};