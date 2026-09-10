import React, { useEffect, useMemo, useRef } from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import {
  MapView,
  Camera,
  PointAnnotation,
  UserLocation,
  ShapeSource,
  LineLayer,
  requestAndroidLocationPermissions,
} from 'mappls-map-react-native';
import { MaterialDesignIcons } from '@react-native-vector-icons/material-design-icons';
import colors from '../../constants/colors';

const DEFAULT_COORDS = { latitude: 12.9716, longitude: 77.5946 };

const toCoords = point => {
  if (!point) {
    return null;
  }

  const latitude = point.latitude ?? point.lat;
  const longitude = point.longitude ?? point.lng;

  if (latitude == null || longitude == null) {
    return null;
  }

  return { latitude, longitude };
};

// Mappls (like Mapbox) expects coordinates as [longitude, latitude] arrays,
// the opposite order from react-native-maps' {latitude, longitude} objects.
const toLngLat = coords => (coords ? [coords.longitude, coords.latitude] : null);

const VEHICLE_ICON_BY_TYPE = {
  BIKE: 'motorbike',
  AUTO: 'rickshaw',
  CAB: 'car',
  PARCEL: 'package-variant-closed',
};

const RideMap = ({ location, destination, captainLocation, nearbyCaptains, showRecenterButton = true }) => {
  const cameraRef = useRef(null);
  // Every value below is memoized off the *primitive* lat/lng, not the raw
  // `location`/`destination` prop objects. Those objects get a brand new
  // reference on every parent re-render (a captain's live GPS ping, a list
  // re-render, a timer tick, anything), and the Camera below treats a new
  // `centerCoordinate` reference as "move the map here" - so without this,
  // the camera snaps back to pickup on almost every render, fighting any
  // panning the customer does. Memoizing on the numbers means the camera
  // only recenters when the coordinate actually changes value.
  const pickupCoords = useMemo(() => {
    const coords = toCoords(location);
    return coords || DEFAULT_COORDS;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location?.latitude, location?.longitude, location?.lat, location?.lng]);

  const dropoffCoords = useMemo(
    () => toCoords(destination),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [destination?.latitude, destination?.longitude, destination?.lat, destination?.lng],
  );

  const captainCoords = useMemo(
    () => toCoords(captainLocation),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [captainLocation?.latitude, captainLocation?.longitude, captainLocation?.lat, captainLocation?.lng],
  );

  const nearbyKey = (nearbyCaptains || [])
    .map(c => `${c?.id ?? ''}:${c?.latitude ?? c?.lat}:${c?.longitude ?? c?.lng}:${c?.icon ?? c?.vehicleType ?? ''}`)
    .join('|');
  const nearby = useMemo(
    () =>
      (nearbyCaptains || [])
        .map(c => ({ ...toCoords(c), id: c.id, vehicleType: c.vehicleType, icon: c.icon }))
        .filter(c => c.latitude != null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [nearbyKey],
  );

  const pickupCenter = useMemo(() => toLngLat(pickupCoords), [pickupCoords]);

  useEffect(() => {
    requestAndroidLocationPermissions().catch(() => {});
  }, []);

  // The camera no longer auto-follows pickup on every render (see above),
  // so give the customer an explicit way to snap back to it - the same
  // "locate me" affordance most ride-hailing map screens offer.
  const handleRecenter = () => {
    cameraRef.current?.moveTo(pickupCenter, 500);
  };

  const routeStart = captainCoords || pickupCoords;
  const routeLine =
    dropoffCoords && routeStart
      ? {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: [toLngLat(routeStart), toLngLat(dropoffCoords)],
          },
        }
      : null;

  return (
    <View style={styles.wrap}>
      <MapView style={styles.map}>
        <Camera ref={cameraRef} zoomLevel={13} centerCoordinate={pickupCenter} />

        <UserLocation visible />

        <PointAnnotation
          id="pickup"
          coordinate={pickupCenter}
          title="Pickup Location"
          snippet={location?.address || 'Pickup Point'}
        >
          <View style={[styles.pin, styles.pinPickup]} />
        </PointAnnotation>

        {captainCoords && (
          <PointAnnotation
            id="captain"
            coordinate={toLngLat(captainCoords)}
            title="Captain Live Location"
            snippet="Driver is en route"
          >
            <View style={[styles.vehicleMarker, styles.vehicleMarkerCaptain]}>
              <MaterialDesignIcons name="motorbike" size={16} color={colors.white} />
            </View>
          </PointAnnotation>
        )}

        {nearby.map((coords, index) => (
          <PointAnnotation
            key={coords.id ?? `nearby-${index}`}
            id={`nearby-${coords.id ?? index}`}
            coordinate={toLngLat(coords)}
            title="Nearby Captain"
          >
            <View style={[styles.vehicleMarker, styles.vehicleMarkerNearby]}>
              <MaterialDesignIcons
                name={coords.icon || VEHICLE_ICON_BY_TYPE[coords.vehicleType] || 'motorbike'}
                size={14}
                color={colors.white}
              />
            </View>
          </PointAnnotation>
        ))}

        {dropoffCoords && (
          <PointAnnotation
            id="dropoff"
            coordinate={toLngLat(dropoffCoords)}
            title="Destination"
            snippet={destination?.address || 'Destination'}
          >
            <View style={[styles.pin, styles.pinDropoff]} />
          </PointAnnotation>
        )}

        {routeLine && (
          <ShapeSource id="routeLineSource" shape={routeLine}>
            <LineLayer
              id="routeLineLayer"
              style={{ lineColor: '#FF6600', lineWidth: 4 }}
            />
          </ShapeSource>
        )}
      </MapView>

      {showRecenterButton && (
        <TouchableOpacity style={styles.recenterButton} onPress={handleRecenter} activeOpacity={0.8}>
          <MaterialDesignIcons name="crosshairs-gps" size={20} color={colors.navy} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  recenterButton: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  pin: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  pinPickup: {
    backgroundColor: '#16A34A',
  },
  pinDropoff: {
    backgroundColor: '#DC2626',
  },
  // Nearby/live captains render as small vehicle-icon badges (not bare
  // dots) so they read as actual partners on the map, matching how other
  // ride apps show clustered rider icons near the pickup point.
  vehicleMarker: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  vehicleMarkerCaptain: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.navy,
  },
  vehicleMarkerNearby: {
    backgroundColor: colors.primary,
  },
});

export default RideMap;
