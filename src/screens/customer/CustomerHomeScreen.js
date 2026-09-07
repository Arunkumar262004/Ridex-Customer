import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import RideMap from '../../components/map/RideMap';
import colors from '../../constants/colors';
import { getCurrentLocation } from '../../services/location/locationService';

const DEFAULT_LOCATION = { latitude: 12.9716, longitude: 77.5946 };

const EXPLORE_ITEMS = [
  { id: 'parcel', label: 'Parcel on\nBike', emoji: '📦', serviceType: 'PARCEL' },
  { id: 'auto', label: 'Auto', emoji: '🛺', serviceType: 'AUTO' },
  { id: 'cab', label: 'Cab\nEconomy', emoji: '🚗', serviceType: 'CAB' },
  { id: 'bike', label: 'Bike', emoji: '🏍️', serviceType: 'BIKE' },
];

const CustomerHomeScreen = ({ navigation }) => {
  const [currentLocation, setCurrentLocation] = useState(DEFAULT_LOCATION);
  const [locating, setLocating] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const location = await getCurrentLocation();
        setCurrentLocation(location);
      } catch (error) {
        // Keep the default map center when permission is denied or unavailable.
      } finally {
        setLocating(false);
      }
    })();
  }, []);

  const goToDropLocation = serviceType => {
    navigation.navigate('DropLocation', {
      pickup: { address: 'Current Location', ...currentLocation },
      serviceType,
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
          <Text style={styles.searchIcon}>🔍</Text>
          <Text style={styles.searchPlaceholder}>Where do you want to go?</Text>
        </TouchableOpacity>

        <View style={styles.exploreHeader}>
          <Text style={styles.exploreTitle}>Explore</Text>
          <TouchableOpacity>
            <Text style={styles.viewAll}>View All ›</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.exploreRow}>
          {EXPLORE_ITEMS.map(item => (
            <TouchableOpacity
              key={item.id}
              style={styles.exploreItem}
              onPress={() => goToDropLocation(item.serviceType)}
              activeOpacity={0.8}
            >
              <View style={styles.exploreIconBox}>
                <Text style={styles.exploreEmoji}>{item.emoji}</Text>
              </View>
              <Text style={styles.exploreLabel}>{item.label}</Text>
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
    fontSize: 16,
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
  },
  exploreEmoji: {
    fontSize: 24,
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
