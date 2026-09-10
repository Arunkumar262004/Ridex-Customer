import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MapView, Camera } from 'mappls-map-react-native';
import colors from '../../constants/colors';
import { reverseGeocode } from '../../services/api/placesApi';
import { addRecentSearch } from '../../utils/recentSearches';

const MapPickerScreen = ({ navigation, route }) => {
  const { initialCoords, pickup, serviceType } = route.params || {};

  const [coords, setCoords] = useState({
    latitude: initialCoords?.latitude ?? 12.9716,
    longitude: initialCoords?.longitude ?? 77.5946,
  });
  // Captured once so the Camera only sets the map's starting position and
  // never fights the user's own panning on subsequent renders.
  const [initialCenter] = useState([
    initialCoords?.longitude ?? 77.5946,
    initialCoords?.latitude ?? 12.9716,
  ]);
  const [address, setAddress] = useState('Move the map to select a location');
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
    const destination = { address, ...coords };

    await addRecentSearch(destination);

    navigation.navigate('VehicleSelection', {
      pickup,
      destination,
      serviceType,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.mapContainer}>
        <MapView style={styles.map} onRegionDidChange={handleRegionDidChange}>
          <Camera zoomLevel={16} centerCoordinate={initialCenter} />
        </MapView>

        <View style={styles.centerPinContainer} pointerEvents="none">
          <Text style={styles.pinIcon}>📍</Text>
        </View>

        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.sheet}>
        <Text style={styles.sheetTitle}>Drop pin on the map</Text>

        <View style={styles.addressBox}>
          <Text style={styles.addressText} numberOfLines={2}>
            {resolving ? 'Finding address...' : address}
          </Text>
        </View>

        <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
          <Text style={styles.confirmButtonText}>Confirm location</Text>
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
    marginLeft: -16,
    marginTop: -32,
  },
  pinIcon: {
    fontSize: 32,
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
    borderColor: colors.danger,
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
