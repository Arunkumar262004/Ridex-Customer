import api from './axios';

const getVehicleTypes = async () => {
  const response = await api.get('/vehicle-types');

  return response.data;
};

const getFareEstimate = async ({
  vehicleTypeId,
  pickup,
  destination,
}) => {
  const response = await api.post('/rides/estimate', {
    vehicleTypeId,

    pickup: {
      latitude: pickup.latitude,
      longitude: pickup.longitude,
    },

    destination: {
      latitude: destination.latitude,
      longitude: destination.longitude,
    },
  });

  return response.data;
};

const createRide = async ({
  vehicleTypeId,
  pickup,
  destination,
}) => {
  const response = await api.post('/rides', {
    vehicleTypeId,

    pickup: {
      latitude: pickup.latitude,
      longitude: pickup.longitude,
    },

    destination: {
      latitude: destination.latitude,
      longitude: destination.longitude,
    },
  });

  return response.data;
};

export {
  getVehicleTypes,
  getFareEstimate,
  createRide,
};