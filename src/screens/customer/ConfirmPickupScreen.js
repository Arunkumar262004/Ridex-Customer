import React, { useRef, useState } from 'react';
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
import { getDistanceInMeters } from '../../services/location/locationService';
import { reverseGeocode } from '../../services/api/placesApi';

const ConfirmPickupScreen = ({ navigation, route }) => {
  const { pickup, destination, vehicle, fareDetails, allVehicles } = route.params || {};

  const originalPickup = useRef(pickup);
  const [pickupCoords, setPickupCoords] = useState({
    latitude: pickup?.latitude ?? 12.9716,
    longitude: pickup?.longitude ?? 77.5946,
  });
  // `defaultSettings` (unlike the reactive `centerCoordinate` prop) is
  // applied once on native mount and is never re-sent to the map after
  // that - so it can't fight the user's own drag/pan, however many times
  // this component re-renders while they're dragging the pin.
  const [initialCamera] = useState({
    centerCoordinate: [pickup?.longitude ?? 77.5946, pickup?.latitude ?? 12.9716],
    zoomLevel: 16,
  });
  const [pickupAddress, setPickupAddress] = useState(pickup?.address || 'Selected pickup point');
  const [distanceMeters, setDistanceMeters] = useState(0);

  const handleRegionDidChange = async feature => {
    const [longitude, latitude] = feature.geometry.coordinates;
    const nextCoords = { latitude, longitude };
    setPickupCoords(nextCoords);
    setDistanceMeters(getDistanceInMeters(originalPickup.current, nextCoords));

    const resolvedAddress = await reverseGeocode(nextCoords.latitude, nextCoords.longitude);
    if (resolvedAddress) {
      setPickupAddress(resolvedAddress);
    }
  };

  const handleConfirmPickup = () => {
    navigation.navigate('SearchingCaptain', {
      pickup: { ...pickup, ...pickupCoords, address: pickupAddress },
      destination,
      vehicle,
      fareDetails,
      allVehicles,
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
            <Text style={styles.pickupLabelText}>Pickup Point</Text>
          </View>
          <MaterialDesignIcons name="map-marker" size={40} color={colors.primary} />
          <View style={styles.pinShadow} />
        </View>

        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>

        {distanceMeters > 0 && (
          <View style={styles.distanceBanner}>
            <Text style={styles.distanceIcon}>ⓘ</Text>
            <Text style={styles.distanceText}>
              You are {distanceMeters} m away from your pickup
            </Text>
          </View>
        )}
      </View>

      <View style={styles.sheet}>
        <Text style={styles.sheetTitle}>Select a pickup point</Text>
        <Text style={styles.sheetSubtitle}>Drag map or select from below</Text>

        <View style={styles.addressBox}>
          <Text style={styles.addressText} numberOfLines={2}>
            {pickupAddress}
          </Text>
        </View>

        <TouchableOpacity style={styles.confirmButton} onPress={handleConfirmPickup}>
          <Text style={styles.confirmButtonText}>Confirm pickup</Text>
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
  // the map surface, which is what makes a pin icon look like it's really
  // pointing at a spot instead of just floating over the map.
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
  distanceBanner: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF7E0',
    borderColor: colors.warning,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  distanceIcon: {
    color: colors.warning,
    marginRight: 8,
  },
  distanceText: {
    fontSize: 13,
    fontWeight: '600',
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
  },
  sheetSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 4,
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

export default ConfirmPickupScreen;
