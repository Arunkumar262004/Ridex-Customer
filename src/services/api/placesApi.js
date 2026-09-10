import { RestApi } from 'mappls-map-react-native';

// Place search, place details, and reverse geocoding now go through the
// Mappls native RestApi bridge (mappls-map-react-native), which is
// authenticated using the same `.a.conf`/`.a.olf` license files already
// bundled in android/app — no separate REST API key needed in JS.

const searchPlaces = async (query, { latitude, longitude } = {}) => {
  if (!query || query.trim().length < 3) {
    return [];
  }

  try {
    const params = { query };

    if (latitude != null && longitude != null) {
      params.location = { latitude, longitude };
    }

    const response = await RestApi.autoSuggest(params);
    const locations = response?.suggestedLocations || [];

    return locations
      .filter(place => place.mapplsPin)
      .map(place => ({
        placeId: place.mapplsPin,
        description:
          place.placeName && place.placeAddress
            ? `${place.placeName}, ${place.placeAddress}`
            : place.placeAddress || place.placeName,
      }));
  } catch (error) {
    console.log('Mappls autoSuggest error:', error?.message || error);
    return [];
  }
};

const getPlaceDetails = async placeId => {
  const response = await RestApi.placeDetail({ mapplsPin: placeId });

  if (!response || response.latitude == null || response.longitude == null) {
    throw new Error('Unable to fetch place details.');
  }

  return {
    address: response.address,
    latitude: response.latitude,
    longitude: response.longitude,
  };
};

const reverseGeocode = async (latitude, longitude) => {
  try {
    const response = await RestApi.reverseGeocode({ latitude, longitude });
    const place = response?.results?.[0];

    return place?.formatted_address || null;
  } catch (error) {
    return null;
  }
};

export { searchPlaces, getPlaceDetails, reverseGeocode };
