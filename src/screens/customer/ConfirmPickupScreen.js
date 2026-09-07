import React, { useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { WebView } from 'react-native-webview';
import colors from '../../constants/colors';
import { getDistanceInMeters } from '../../services/location/locationService';

// Free, no-API-key map: Leaflet.js + OpenStreetMap tiles, with the pin fixed
// at screen center (drawn by RN below) while the map itself is dragged
// underneath — the classic "confirm pickup" pattern, without needing a
// billed Google Maps key.
const buildLeafletHtml = (latitude, longitude) => `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <style>
    html, body, #map { height: 100%; margin: 0; padding: 0; background: #eef1f4; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <script>
    var map = L.map('map', { zoomControl: false, attributionControl: false }).setView([${latitude}, ${longitude}], 17);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map);

    function post(center) {
      var message = JSON.stringify({ latitude: center.lat, longitude: center.lng });
      if (window.ReactNativeWebView) { window.ReactNativeWebView.postMessage(message); }
    }
    map.on('moveend', function () { post(map.getCenter()); });
  </script>
</body>
</html>`;

const ConfirmPickupScreen = ({ navigation, route }) => {
  const { pickup, destination, vehicle, fareDetails } = route.params || {};

  const originalPickup = useRef(pickup);
  const [pickupCoords, setPickupCoords] = useState({
    latitude: pickup?.latitude,
    longitude: pickup?.longitude,
  });
  const [distanceMeters, setDistanceMeters] = useState(0);

  const html = useMemo(
    () => buildLeafletHtml(pickup?.latitude, pickup?.longitude),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const handleMapMessage = event => {
    const nextCoords = JSON.parse(event.nativeEvent.data);
    setPickupCoords(nextCoords);
    setDistanceMeters(getDistanceInMeters(originalPickup.current, nextCoords));
  };

  const handleConfirmPickup = () => {
    navigation.navigate('SearchingCaptain', {
      pickup: { ...pickup, ...pickupCoords },
      destination,
      vehicle,
      fareDetails,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.mapContainer}>
        <WebView
          style={styles.map}
          originWhitelist={['*']}
          source={{ html }}
          onMessage={handleMapMessage}
          javaScriptEnabled
          domStorageEnabled
        />

        <View style={styles.centerPinContainer} pointerEvents="none">
          <View style={styles.pickupLabel}>
            <Text style={styles.pickupLabelText}>Pickup Point</Text>
          </View>
          <Text style={styles.pinIcon}>📍</Text>
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
            {pickup?.address || 'Selected pickup point'}
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
    marginTop: -56,
    alignItems: 'center',
  },
  pickupLabel: {
    backgroundColor: colors.success,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginBottom: 4,
  },
  pickupLabelText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '700',
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
    borderColor: colors.success,
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
    backgroundColor: colors.primary,
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
