import Geolocation from '@react-native-community/geolocation';
import {PermissionsAndroid, Platform} from 'react-native';

const requestLocationPermission = async () => {
  if (Platform.OS !== 'android') {
    return true;
  }

  const granted = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    {
      title: 'Ridex Location Permission',
      message:
        'Ridex needs your location to find your pickup location and nearby captains.',
      buttonPositive: 'Allow',
      buttonNegative: 'Deny',
    },
  );

  return granted === PermissionsAndroid.RESULTS.GRANTED;
};

const getCurrentLocation = async () => {
  const hasPermission = await requestLocationPermission();

  if (!hasPermission) {
    throw new Error('Location permission denied');
  }

  return new Promise((resolve, reject) => {
    Geolocation.getCurrentPosition(
      position => {
        const {latitude, longitude} = position.coords;

        resolve({
          latitude,
          longitude,
        });
      },
      error => {
        reject(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 10000,
      },
    );
  });
};

export {
  requestLocationPermission,
  getCurrentLocation,
};