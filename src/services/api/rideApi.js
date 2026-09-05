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

/**
 * Customer fetches fresh dynamic QR token payload
 */
const getDynamicQrToken = async (rideId) => {
  const response = await api.get(`/rides/${rideId}/qr-token`);
  return response.data; // { success: true, data: { qrData, expiresAt } }
};

export {
  getVehicleTypes,
  getFareEstimate,
  createRide,
  getDynamicQrToken,
};