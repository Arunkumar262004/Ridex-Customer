import api from './axios';

/**
 * Master list of active vehicle types (with any admin-uploaded photo) -
 * the same collection the Admin pricing panel manages. Used to render the
 * home screen's Explore row from real data instead of hardcoded entries.
 */
const getVehicleTypes = async () => {
  const response = await api.get('/vehicle-types');
  return response.data;
};

const estimateRide = async ({ pickup, destination }) => {
  const response = await api.post('/rides/estimate', {
    pickup: { latitude: pickup.latitude, longitude: pickup.longitude },
    destination: { latitude: destination.latitude, longitude: destination.longitude },
  });
  return response.data;
};

const createRide = async (rideData) => {
  const response = await api.post('/rides', rideData);
  return response.data;
};

const cancelRide = async (rideId) => {
  const response = await api.post(`/rides/${rideId}/cancel`);
  return response.data;
};

/**
 * Offers extra on top of the fare while searching, to attract a captain
 * faster. `extraAmount` is a delta on top of whatever's currently offered,
 * not the new total - callers track how much boost is already applied.
 */
const boostFare = async (rideId, extraAmount) => {
  const response = await api.post(`/rides/${rideId}/boost-fare`, { extraAmount });
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
  estimateRide,
  createRide,
  cancelRide,
  boostFare,
  getDynamicQrToken,
};