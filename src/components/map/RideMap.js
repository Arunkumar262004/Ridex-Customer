import React from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';

const RideMap = ({ location, destination, captainLocation }) => {
  const pickupCoords = location ? {
    latitude: location.latitude || location.lat || 12.9716,
    longitude: location.longitude || location.lng || 77.5946,
  } : { latitude: 12.9716, longitude: 77.5946 };

  const dropoffCoords = destination ? {
    latitude: destination.latitude || destination.lat || 12.9352,
    longitude: destination.longitude || destination.lng || 77.6245,
  } : null;

  const captainCoords = captainLocation ? {
    latitude: captainLocation.latitude || captainLocation.lat,
    longitude: captainLocation.longitude || captainLocation.lng,
  } : null;

  return (
    <MapView
      style={styles.map}
      initialRegion={{
        latitude: pickupCoords.latitude,
        longitude: pickupCoords.longitude,
        latitudeDelta: 0.04,
        longitudeDelta: 0.04,
      }}
      showsUserLocation
      showsMyLocationButton
    >
      {/* Pickup Marker (Green) */}
      <Marker
        coordinate={pickupCoords}
        title="Pickup Location"
        description={location?.address || 'Pickup Point'}
        pinColor="#16A34A"
      />

      {/* Live Moving Captain Marker (Yellow/Blue Pin) */}
      {captainCoords && (
        <Marker
          coordinate={captainCoords}
          title="Captain Live Location"
          description="Driver is en route"
          pinColor="#EAB308"
        />
      )}

      {/* Dropoff Marker (Red) */}
      {dropoffCoords && (
        <Marker
          coordinate={dropoffCoords}
          title="Destination"
          description={destination?.address || 'Destination'}
          pinColor="#DC2626"
        />
      )}

      {/* Route Polyline Line */}
      {dropoffCoords && (
        <Polyline
          coordinates={[
            captainCoords || pickupCoords,
            dropoffCoords,
          ]}
          strokeColor="#2563EB"
          strokeWidth={4}
        />
      )}
    </MapView>
  );
};

const styles = StyleSheet.create({
  map: {
    flex: 1,
  },
});

export default RideMap;