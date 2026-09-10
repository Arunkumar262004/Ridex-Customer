  import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  AppState,
  Alert,
  Linking,
  Platform,
} from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import { MaterialDesignIcons } from '@react-native-vector-icons/material-design-icons';
import colors from '../../constants/colors';
import { requestLocationPermission } from '../../services/location/locationService';

// Gate that blocks the app until the device has location permission AND the
// device's location (GPS) service is actually turned on. Ridex cannot find a
// pickup point or nearby captains without it, so we don't let the customer
// past this screen until location is available.
const STATUS = {
  CHECKING: 'checking',
  OK: 'ok',
  PERMISSION_BLOCKED: 'permission_blocked',
  SERVICES_DISABLED: 'services_disabled',
};

const openDeviceLocationSettings = () => {
  if (Platform.OS === 'android') {
    try {
      Linking.sendIntent('android.settings.LOCATION_SOURCE_SETTINGS');
    } catch (error) {
      Linking.openSettings();
    }
  } else {
    // iOS does not allow deep-linking straight into the Location Services
    // toggle; send the user to the app's own settings page instead.
    Linking.openSettings();
  }
};

const LocationGate = ({ children }) => {
  const [status, setStatus] = useState(STATUS.CHECKING);
  const lastAlertedStatus = useRef(null);

  const checkLocation = useCallback(async () => {
    const hasPermission = await requestLocationPermission();

    if (!hasPermission) {
      setStatus(STATUS.PERMISSION_BLOCKED);
      return;
    }

    Geolocation.getCurrentPosition(
      () => setStatus(STATUS.OK),
      error => {
        // code 2 (POSITION_UNAVAILABLE) means no location provider is
        // available, i.e. the device's location service is switched off.
        if (error?.code === 2) {
          setStatus(STATUS.SERVICES_DISABLED);
        } else {
          // Transient errors (e.g. a one-off timeout) shouldn't hard-block
          // access to the app.
          setStatus(STATUS.OK);
        }
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 0 },
    );
  }, []);

  useEffect(() => {
    checkLocation();

    const subscription = AppState.addEventListener('change', nextState => {
      // Re-check whenever the app comes back to the foreground, e.g. after
      // the customer turns location on from Settings and returns.
      if (nextState === 'active') {
        checkLocation();
      }
    });

    return () => subscription.remove();
  }, [checkLocation]);

  useEffect(() => {
    if (status !== STATUS.SERVICES_DISABLED && status !== STATUS.PERMISSION_BLOCKED) {
      lastAlertedStatus.current = null;
      return;
    }

    // Only pop the alert once per new blocked status, not on every render,
    // so retapping "Try Again" on the screen behind it doesn't stack alerts.
    if (lastAlertedStatus.current === status) {
      return;
    }
    lastAlertedStatus.current = status;

    if (status === STATUS.SERVICES_DISABLED) {
      Alert.alert(
        'Turn On Location',
        'Ridex needs your device location turned on to find your pickup point and nearby captains. Please turn it on to continue.',
        [
          { text: 'Try Again', onPress: checkLocation },
          { text: 'Turn On Location', onPress: openDeviceLocationSettings },
        ],
        { cancelable: false },
      );
    } else if (status === STATUS.PERMISSION_BLOCKED) {
      Alert.alert(
        'Location Permission Required',
        'Ridex needs location access to work. Please allow location permission from app settings to continue.',
        [
          { text: 'Try Again', onPress: checkLocation },
          { text: 'Open Settings', onPress: () => Linking.openSettings() },
        ],
        { cancelable: false },
      );
    }
  }, [status, checkLocation]);

  if (status === STATUS.OK) {
    return children;
  }

  if (status === STATUS.CHECKING) {
    return <View style={styles.container} />;
  }

  const isServicesDisabled = status === STATUS.SERVICES_DISABLED;

  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <MaterialDesignIcons
          name="map-marker-off-outline"
          size={40}
          color={colors.navy}
        />
      </View>
      <Text style={styles.title}>
        {isServicesDisabled ? 'Location is Turned Off' : 'Location Permission Needed'}
      </Text>
      <Text style={styles.message}>
        {isServicesDisabled
          ? 'Turn on your device location to continue using Ridex. We need it to find your pickup point and nearby captains.'
          : 'Ridex needs location access to work. Please allow location permission to continue.'}
      </Text>
      <TouchableOpacity
        style={styles.primaryButton}
        onPress={isServicesDisabled ? openDeviceLocationSettings : () => Linking.openSettings()}
        activeOpacity={0.85}
      >
        <Text style={styles.primaryButtonText}>
          {isServicesDisabled ? 'Turn On Location' : 'Open Settings'}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.retryButton} onPress={checkLocation} activeOpacity={0.7}>
        <Text style={styles.retryText}>Try Again</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  iconCircle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: colors.input,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 10,
  },
  message: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 28,
  },
  primaryButton: {
    backgroundColor: colors.navy,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 32,
    width: '100%',
    alignItems: 'center',
    marginBottom: 14,
  },
  primaryButtonText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '700',
  },
  retryButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  retryText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '700',
  },
});

export default LocationGate;
