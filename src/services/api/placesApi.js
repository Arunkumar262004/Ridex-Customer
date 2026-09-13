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

const getMapplsRoute = async (origin, destination) => {
  if (!origin || !destination) return null;

  const originLat = origin.latitude ?? origin.lat;
  const originLng = origin.longitude ?? origin.lng;
  const destLat = destination.latitude ?? destination.lat;
  const destLng = destination.longitude ?? destination.lng;

  if (originLat == null || originLng == null || destLat == null || destLng == null) {
    return null;
  }

  try {
    const response = await RestApi.direction({
      origin: `${originLat},${originLng}`,
      destination: `${destLat},${destLng}`,
      profile: RestApi.DirectionsCriteria?.PROFILE_DRIVING || 'driving',
      overview: RestApi.DirectionsCriteria?.OVERVIEW_FULL || 'full',
      geometries: RestApi.DirectionsCriteria?.GEOMETRY_COORDINATES || 'polyline',
    });

    const route = response?.routes?.[0];
    if (route) {
      if (Array.isArray(route.geometry?.coordinates) && route.geometry.coordinates.length > 0) {
        return route.geometry.coordinates;
      }
    }
  } catch (err) {
    console.log('Mappls RestApi.direction error:', err?.message || err);
  }

  try {
    const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${originLng},${originLat};${destLng},${destLat}?overview=full&geometries=geojson`;
    const res = await fetch(osrmUrl);
    const json = await res.json();
    const coords = json?.routes?.[0]?.geometry?.coordinates;
    if (Array.isArray(coords) && coords.length > 0) {
      return coords;
    }
  } catch (osrmErr) {
    console.log('OSRM fallback route error:', osrmErr?.message || osrmErr);
  }

  return [
    [originLng, originLat],
    [destLng, destLat],
  ];
};

export { searchPlaces, getPlaceDetails, reverseGeocode, getMapplsRoute };
