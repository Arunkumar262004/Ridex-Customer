import React from 'react';
import {StyleSheet, View} from 'react-native';
import MapView, {Marker} from 'react-native-maps';

import colors from '../../constants/colors';

const RideMap = ({
  location,
  destination,
}) => {
  if (!location) {
    return (
      <View style={styles.empty}>
      </View>
    );
  }

  return (
    <MapView
      style={styles.map}
      initialRegion={{
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }}
      showsUserLocation
      showsMyLocationButton
    >
      <Marker
        coordinate={location}
        title="Pickup"
        description="Your current location"
      />

      {destination && (
        <Marker
          coordinate={destination}
          title="Destination"
        />
      )}
    </MapView>
  );
};

const styles = StyleSheet.create({
  map: {
    flex: 1,
  },

  empty: {
    flex: 1,
    backgroundColor: colors.input,
  },
});

export default RideMap;