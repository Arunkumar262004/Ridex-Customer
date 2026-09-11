import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialDesignIcons } from '@react-native-vector-icons/material-design-icons';
import RideMap from '../../components/map/RideMap';
import colors from '../../constants/colors';
import { getCurrentLocation } from '../../services/location/locationService';
import { reverseGeocode } from '../../services/api/placesApi';
import { getVehicleTypes } from '../../services/api/rideApi';
import { getVehicleIcon } from '../../utils/vehicleIcon';

const DEFAULT_LOCATION = { latitude: 12.9716, longitude: 77.5946 };

// Only used if the live /vehicle-types call fails - mirrors the Admin
// panel's own seed defaults (server/src/utils/seedVehicleTypes.js), no
// admin photos available offline so these fall back to icons.
const FALLBACK_VEHICLE_TYPES = [
  { _id: 'bike', name: 'Bike' },
  { _id: 'auto', name: 'Auto' },
  { _id: 'cab-economy', name: 'Cab Economy' },
  { _id: 'cab-premium', name: 'Cab Premium' },
];

const MAX_EXPLORE_ITEMS = 4;

const CustomerHomeScreen = ({ navigation }) => {
  const [currentLocation, setCurrentLocation] = useState(DEFAULT_LOCATION);
  const [currentAddress, setCurrentAddress] = useState('Current Location');
  const [locating, setLocating] = useState(true);
  const [vehicleTypes, setVehicleTypes] = useState(FALLBACK_VEHICLE_TYPES);

  useEffect(() => {
    (async () => {
      try {
        const location = await getCurrentLocation();
        setCurrentLocation(location);

        const address = await reverseGeocode(location.latitude, location.longitude);
        if (address) {
          setCurrentAddress(address);
        }
      } catch (error) {
        // Keep the default map center + generic label when permission is
        // denied, location is unavailable, or reverse geocoding fails.
        console.log('Live location unavailable, using default map center:', error?.message || error);
      } finally {
        setLocating(false);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const response = await getVehicleTypes();
        const types = response.data || response;
        if (Array.isArray(types) && types.length > 0) {
          setVehicleTypes(types.slice(0, MAX_EXPLORE_ITEMS));
        }
      } catch (error) {
        console.log('Vehicle types fetch failed, using fallback list:', error?.response?.data || error.message);
      }
    })();
  }, []);

  const goToDropLocation = vehicleType => {
    navigation.navigate('DropLocation', {
      pickup: { address: currentAddress, ...currentLocation },
      preselectVehicleTypeId: vehicleType?._id,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.mapContainer}>
        <RideMap location={currentLocation} />

        {locating && (
          <View style={styles.locatingPill}>
            <Text style={styles.locatingText}>Fetching your location ...</Text>
          </View>
        )}
      </View>

      <View style={styles.sheet}>
        <TouchableOpacity
          style={styles.searchBar}
          onPress={() => goToDropLocation()}
          activeOpacity={0.8}
        >
          <MaterialDesignIcons name="magnify" size={18} color={colors.textSecondary} style={styles.searchIcon} />
          <Text style={styles.searchPlaceholder}>Where do you want to go?</Text>
        </TouchableOpacity>

        <View style={styles.exploreHeader}>
          <Text style={styles.exploreTitle}>Explore</Text>
          <TouchableOpacity>
            <Text style={styles.viewAll}>View All ›</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.exploreRow}>
          {vehicleTypes.map(item => (
            <TouchableOpacity
              key={item._id}
              style={styles.exploreItem}
              onPress={() => goToDropLocation(item)}
              activeOpacity={0.8}
            >
              <View style={styles.exploreIconBox}>
                {item.imageUrl ? (
                  <Image source={{ uri: item.imageUrl }} style={styles.exploreImage} resizeMode="cover" />
                ) : (
                  <MaterialDesignIcons name={getVehicleIcon(item.name)} size={26} color={colors.navy} />
                )}
              </View>
              <Text style={styles.exploreLabel} numberOfLines={2}>{item.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.brandFooter}>#goRidex</Text>
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
  locatingPill: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
    backgroundColor: colors.white,
    borderRadius: 24,
    paddingVertical: 10,
    paddingHorizontal: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  locatingText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  sheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.input,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 20,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchPlaceholder: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  exploreHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  exploreTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
  },
  viewAll: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  exploreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  exploreItem: {
    alignItems: 'center',
    width: '23%',
  },
  exploreIconBox: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: colors.input,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    overflow: 'hidden',
  },
  exploreImage: {
    width: '100%',
    height: '100%',
  },
  exploreLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
  },
  brandFooter: {
    textAlign: 'center',
    marginTop: 22,
    fontSize: 13,
    fontWeight: '700',
    color: colors.borderStrong,
  },
});

export default CustomerHomeScreen;
