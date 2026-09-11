import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MapView, Camera } from 'mappls-map-react-native';
import { MaterialDesignIcons } from '@react-native-vector-icons/material-design-icons';
import colors from '../../constants/colors';
import { reverseGeocode } from '../../services/api/placesApi';
import { addRecentSearch } from '../../utils/recentSearches';

const MapPickerScreen = ({ navigation, route }) => {
  // `mode` decides what a confirmed pin becomes: 'pickup' returns the
  // customer to DropLocation with a new pickup point, 'destination' (the
  // default, used by the original "select on map" entry point) goes
  // straight on to vehicle selection.
  const { initialCoords, pickup, preselectVehicleTypeId, mode = 'destination' } = route.params || {};
  const isPickupMode = mode === 'pickup';

  const [coords, setCoords] = useState({
    latitude: initialCoords?.latitude ?? 12.9716,
    longitude: initialCoords?.longitude ?? 77.5946,
  });
  // `defaultSettings` (unlike the reactive `centerCoordinate` prop) is
  // applied once on native mount and never re-sent to the map after that,
  // so it can't fight the user's own drag/pan on later re-renders.
  const [initialCamera] = useState({
    centerCoordinate: [initialCoords?.longitude ?? 77.5946, initialCoords?.latitude ?? 12.9716],
    zoomLevel: 16,
  });
  const [address, setAddress] = useState(
    isPickupMode ? pickup?.address || 'Move the map to select your pickup point' : 'Move the map to select a location',
  );
  const [resolving, setResolving] = useState(false);

  const handleRegionDidChange = async feature => {
    const [longitude, latitude] = feature.geometry.coordinates;
    const nextCoords = { latitude, longitude };
    setCoords(nextCoords);

    setResolving(true);
    const resolvedAddress = await reverseGeocode(nextCoords.latitude, nextCoords.longitude);
    setAddress(resolvedAddress || `${nextCoords.latitude.toFixed(5)}, ${nextCoords.longitude.toFixed(5)}`);
    setResolving(false);
  };

  const handleConfirm = async () => {
    const selected = { address, ...coords };

    if (isPickupMode) {
      // Hand the new pickup straight back to DropLocation - it's already
      // on the stack, so `navigate` re-focuses that instance (and its
      // in-progress destination text/search state) instead of pushing a
      // new copy of the screen.
      navigation.navigate('DropLocation', {
        pickup: selected,
        preselectVehicleTypeId,
      });
      return;
    }

    await addRecentSearch(selected);

    navigation.navigate('VehicleSelection', {
      pickup,
      destination: selected,
      preselectVehicleTypeId,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.mapContainer}>
        <MapView style={styles.map} onRegionDidChange={handleRegionDidChange}>
          <Camera defaultSettings={initialCamera} />
        </MapView>

        <View style={styles.centerPinContainer} pointerEvents="none">
          <View style={styles.pickupLabel}>
            <Text style={styles.pickupLabelText}>{isPickupMode ? 'Pickup Point' : 'Drop Point'}</Text>
          </View>
          <MaterialDesignIcons name="map-marker" size={40} color={colors.primary} />
          <View style={styles.pinShadow} />
        </View>

        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.sheet}>
        <Text style={styles.sheetTitle}>
          {isPickupMode ? 'Select your pickup point' : 'Drop pin on the map'}
        </Text>

        <View style={styles.addressBox}>
          <Text style={styles.addressText} numberOfLines={2}>
            {resolving ? 'Finding address...' : address}
          </Text>
        </View>

        <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
          <Text style={styles.confirmButtonText}>
            {isPickupMode ? 'Confirm pickup' : 'Confirm location'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  mapContainer: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  centerPinContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -20,
    marginTop: -68,
    alignItems: 'center',
  },
  pickupLabel: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginBottom: 4,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
  },
  pickupLabelText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '700',
  },
  // A small dark ellipse right under the pin's tip reads as its shadow on
  // the map surface, so the pin looks like it's pointing at a spot instead
  // of just floating over the map.
  pinShadow: {
    width: 8,
    height: 4,
    borderRadius: 4,
    backgroundColor: 'rgba(0,0,0,0.3)',
    marginTop: -2,
  },
  backButton: {
    position: 'absolute',
    top: 16,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
  },
  backIcon: {
    fontSize: 18,
    color: colors.text,
  },
  sheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    elevation: 10,
  },
  sheetTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 16,
  },
  addressBox: {
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
  },
  addressText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  confirmButton: {
    backgroundColor: colors.navy,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.white,
  },
});

export default MapPickerScreen;
