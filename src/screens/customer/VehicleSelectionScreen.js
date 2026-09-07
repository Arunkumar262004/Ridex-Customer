import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import RideMap from '../../components/map/RideMap';
import colors from '../../constants/colors';
import { getVehicleTypes } from '../../services/api/rideApi';

const DEFAULT_RIDE_OPTIONS = [
  { id: 'bike', name: 'Bike', description: 'Quick Bike rides', emoji: '🏍️', baseFare: 26, etaMinutes: 4 },
  { id: 'auto', name: 'Auto', description: 'Auto rides', emoji: '🛺', baseFare: 40, etaMinutes: 2, tag: 'FASTEST' },
  { id: 'auto-priority', name: 'Auto Priority', description: 'Priority pickup, no waiting', emoji: '⚡', baseFare: 60, etaMinutes: 2 },
  { id: 'cab-economy', name: 'Cab Economy', description: 'Affordable AC cabs', emoji: '🚗', baseFare: 90, etaMinutes: 2 },
  { id: 'scooty', name: 'Scooty', description: 'Self-ride scooters', emoji: '🛵', baseFare: 31, etaMinutes: 4 },
];

const buildNearbyCaptains = pickup => {
  if (!pickup) {
    return [];
  }

  const offsets = [
    [-0.012, -0.006], [-0.006, -0.014], [0.004, -0.01],
    [0.014, 0.006], [0.018, 0.012], [0.02, 0.016],
  ];

  return offsets.map(([latOffset, lngOffset], index) => ({
    id: `captain-${index}`,
    latitude: pickup.latitude + latOffset,
    longitude: pickup.longitude + lngOffset,
  }));
};

const formatDropTime = etaMinutes => {
  const dropTime = new Date(Date.now() + etaMinutes * 60 * 1000);
  return dropTime.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
};

const VehicleSelectionScreen = ({ navigation, route }) => {
  const { pickup, destination } = route.params || {};

  const [rideOptions, setRideOptions] = useState(DEFAULT_RIDE_OPTIONS);
  const [selectedOption, setSelectedOption] = useState(DEFAULT_RIDE_OPTIONS[0]);

  const nearbyCaptains = useMemo(() => buildNearbyCaptains(pickup), [pickup]);

  useEffect(() => {
    (async () => {
      try {
        const response = await getVehicleTypes();
        const apiVehicles = response?.data;

        if (apiVehicles?.length) {
          const merged = apiVehicles.map((vehicle, index) => ({
            ...DEFAULT_RIDE_OPTIONS[index % DEFAULT_RIDE_OPTIONS.length],
            ...vehicle,
            id: vehicle._id || vehicle.id,
          }));

          setRideOptions(merged);
          setSelectedOption(merged[0]);
        }
      } catch (error) {
        // Keep the default ride options when the vehicle-types API is unavailable.
      }
    })();
  }, []);

  const handleBook = () => {
    if (!selectedOption) {
      return;
    }

    navigation.navigate('ConfirmPickup', {
      pickup,
      destination,
      vehicle: selectedOption,
      fareDetails: {
        vehicleName: selectedOption.name,
        total: selectedOption.baseFare,
        estimatedTime: `${selectedOption.etaMinutes} mins away`,
      },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.mapContainer}>
        <RideMap
          location={pickup}
          destination={destination}
          nearbyCaptains={nearbyCaptains}
        />

        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>

        <View style={styles.addressOverlay}>
          <View style={styles.addressPill}>
            <Text style={styles.addressText} numberOfLines={1}>
              {pickup?.address || 'Pickup location'}
            </Text>
            <Text style={styles.editIcon}>✏️</Text>
          </View>
          <View style={styles.addressPill}>
            <Text style={styles.addressText} numberOfLines={1}>
              {destination?.address || 'Drop location'}
            </Text>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={styles.editIcon}>✏️</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View style={styles.sheet}>
        <FlatList
          data={rideOptions}
          keyExtractor={item => item.id}
          renderItem={({ item }) => {
            const isSelected = selectedOption?.id === item.id;

            return (
              <TouchableOpacity
                style={[styles.rideRow, isSelected && styles.rideRowSelected]}
                onPress={() => setSelectedOption(item)}
                activeOpacity={0.8}
              >
                <Text style={styles.rideEmoji}>{item.emoji}</Text>

                <View style={styles.rideDetails}>
                  <View style={styles.rideNameRow}>
                    <Text style={styles.rideName}>{item.name}</Text>
                    {item.tag && (
                      <View style={styles.tagPill}>
                        <Text style={styles.tagText}>{item.tag}</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.rideSubtitle}>
                    {item.etaMinutes} mins • Drop {formatDropTime(item.etaMinutes)}
                  </Text>
                </View>

                <Text style={styles.ridePrice}>₹{item.baseFare}</Text>
              </TouchableOpacity>
            );
          }}
        />

        <View style={styles.paymentRow}>
          <TouchableOpacity style={styles.paymentItem}>
            <Text style={styles.paymentText}>💵 Cash ›</Text>
          </TouchableOpacity>
          <View style={styles.paymentDivider} />
          <TouchableOpacity style={styles.paymentItem}>
            <Text style={styles.paymentText}>% Offers ›</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.bookButton} onPress={handleBook}>
          <Text style={styles.bookButtonText}>
            Book {selectedOption ? selectedOption.name : 'Ride'}
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
  addressOverlay: {
    position: 'absolute',
    top: 16,
    left: 66,
    right: 16,
  },
  addressPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginBottom: 8,
    elevation: 3,
  },
  addressText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '700',
    color: colors.text,
    marginRight: 8,
  },
  editIcon: {
    fontSize: 12,
  },
  sheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    elevation: 10,
    maxHeight: '58%',
  },
  rideRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  rideRowSelected: {
    borderColor: colors.primary,
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 8,
    marginBottom: 4,
  },
  rideEmoji: {
    fontSize: 28,
    width: 44,
  },
  rideDetails: {
    flex: 1,
    marginLeft: 8,
  },
  rideNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rideName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  tagPill: {
    backgroundColor: colors.surface,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 8,
  },
  tagText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.primary,
  },
  rideSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 3,
  },
  ridePrice: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.text,
  },
  paymentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  paymentItem: {
    flex: 1,
    alignItems: 'center',
  },
  paymentDivider: {
    width: 1,
    height: 20,
    backgroundColor: colors.border,
  },
  paymentText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
  },
  bookButton: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  bookButtonText: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.white,
  },
});

export default VehicleSelectionScreen;
