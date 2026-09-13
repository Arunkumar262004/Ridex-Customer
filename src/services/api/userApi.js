import api from './axios';

/**
 * Real online captains near a point - only captains who currently have
 * their "online" toggle on and have pinged a location recently come back
 * here, never placeholder/demo markers.
 */
const getNearbyCaptains = async ({ latitude, longitude, radiusMeters }) => {
  const response = await api.get('/users/nearby-captains', {
    params: { lat: latitude, lng: longitude, radius: radiusMeters },
  });
  return response.data;
};

const deleteAccount = async () => {
  const response = await api.delete('/users/profile');
  return response.data;
};

export { getNearbyCaptains, deleteAccount };
