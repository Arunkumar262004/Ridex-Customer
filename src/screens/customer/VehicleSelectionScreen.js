import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialDesignIcons } from '@react-native-vector-icons/material-design-icons';
import RideMap from '../../components/map/RideMap';
import colors from '../../constants/colors';
import { estimateRide, getVehicleTypes } from '../../services/api/rideApi';
import { getNearbyCaptains } from '../../services/api/userApi';
import { getDistanceInMeters } from '../../services/location/locationService';
import { getVehicleIcon } from '../../utils/vehicleIcon';

const NEARBY_CAPTAINS_RADIUS_METERS = 5000;
const NEARBY_CAPTAINS_POLL_MS = 10000;

// Mirrors server/src/utils/seedVehicleTypes.js (the master VehicleType
// collection the Admin pricing panel manages) — used only as a fallback if
// the live fare-estimate call fails, priced off straight-line distance
// instead of Google's real road distance.
const DEFAULT_RIDE_OPTIONS = [
  { _id: 'bike', name: 'Bike', baseFare: 25, ratePerKm: 12, ratePerMin: 1.5, minFare: 30, capacity: 1 },
  { _id: 'auto', name: 'Auto', baseFare: 35, ratePerKm: 15, ratePerMin: 2.0, minFare: 45, capacity: 3 },
  { _id: 'cab-economy', name: 'Cab Economy', baseFare: 60, ratePerKm: 20, ratePerMin: 2.5, minFare: 80, capacity: 4 },
  { _id: 'cab-premium', name: 'Cab Premium', baseFare: 100, ratePerKm: 28, ratePerMin: 3.5, minFare: 120, capacity: 4 },
  { _id: 'premium-auto', name: 'Premium Auto', baseFare: 55, ratePerKm: 20, ratePerMin: 2.5, minFare: 70, capacity: 3 },
  { _id: 'premium-car', name: 'Premium Car', baseFare: 150, ratePerKm: 35, ratePerMin: 4.5, minFare: 170, capacity: 4 },
];

// Master pricing has no "captain dispatch ETA" concept (that's live
// dispatch/logistics, not fare config) — a flat display default stands in.
const DISPATCH_ETA_MINUTES = 3;

const buildFallbackVehicles = (pickup, destination) => {
  const distanceKm = pickup && destination ? getDistanceInMeters(pickup, destination) / 1000 : 3;
  const tripDurationMinutes = Math.max(3, Math.round(distanceKm * 3));

  return DEFAULT_RIDE_OPTIONS.map(vehicle => {
    const rawFare = vehicle.baseFare + vehicle.ratePerKm * distanceKm + vehicle.ratePerMin * tripDurationMinutes;

    return {
      ...vehicle,
      fare: Math.max(vehicle.minFare, Math.round(rawFare)),
      tripDurationMinutes,
    };
  });
};

const formatDropTime = totalMinutesFromNow => {
  const dropTime = new Date(Date.now() + totalMinutesFromNow * 60 * 1000);
  return dropTime.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
};

const VehicleSelectionScreen = ({ navigation, route }) => {
  const { pickup, destination, preselectVehicleTypeId } = route.params || {};

  const [rideOptions, setRideOptions] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);
  const [loading, setLoading] = useState(true);
  const [liveCaptains, setLiveCaptains] = useState([]);
  // Admin-uploaded vehicle photos, keyed by name, fetched from the same
  // reliable /vehicle-types endpoint the home screen uses. Kept separate
  // from the fare estimate so a photo still shows even when live fare
  // estimation (which depends on the Google Directions API) falls back to
  // the offline distance-based pricing below - that fallback list never
  // carries imageUrl, but the real photo should still appear.
  const [vehiclePhotos, setVehiclePhotos] = useState({});

  const selectedIcon = getVehicleIcon(selectedOption?.name);
  // Every marker is real - id/position comes straight from the
  // nearby-captains API, never a fabricated offset. The icon is the only
  // thing derived locally, so the badges match whichever ride row the
  // customer currently has selected.
  const nearbyCaptains = useMemo(
    () => liveCaptains.map(captain => ({ ...captain, icon: selectedIcon })),
    [liveCaptains, selectedIcon],
  );

  useEffect(() => {
    if (!pickup?.latitude || !pickup?.longitude) {
      return undefined;
    }

    let cancelled = false;

    const fetchNearbyCaptains = async () => {
      try {
        const response = await getNearbyCaptains({
          latitude: pickup.latitude,
          longitude: pickup.longitude,
          radiusMeters: NEARBY_CAPTAINS_RADIUS_METERS,
        });
        const captains = response.data || response || [];
        if (!cancelled) {
          setLiveCaptains(captains);
        }
      } catch (error) {
        // No live captains to show beats showing fake ones - just leave
        // the map without nearby markers if the call fails.
        console.log('Nearby captains fetch failed:', error?.response?.data || error.message);
      }
    };

    fetchNearbyCaptains();
    const pollId = setInterval(fetchNearbyCaptains, NEARBY_CAPTAINS_POLL_MS);

    return () => {
      cancelled = true;
      clearInterval(pollId);
    };
  }, [pickup?.latitude, pickup?.longitude]);

  useEffect(() => {
    (async () => {
      try {
        const response = await getVehicleTypes();
        const types = response.data || response || [];
        const photos = {};
        types.forEach(type => {
          if (type.imageUrl) {
            photos[type.name] = type.imageUrl;
          }
        });
        setVehiclePhotos(photos);
      } catch (error) {
        console.log('Vehicle photos fetch failed:', error?.response?.data || error.message);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const response = await estimateRide({ pickup, destination });
        const vehicles = (response.data || response).vehicles;

        setRideOptions(vehicles);
        setSelectedOption(
          vehicles.find(v => v._id === preselectVehicleTypeId) || vehicles[0],
        );
      } catch (error) {
        console.log('Live fare estimate failed, using distance-based fallback:', error?.response?.data || error.message);

        const fallback = buildFallbackVehicles(pickup, destination);
        setRideOptions(fallback);
        setSelectedOption(
          fallback.find(v => v._id === preselectVehicleTypeId) || fallback[0],
        );
      } finally {
        setLoading(false);
      }
    })();
    // preselectVehicleTypeId is only read to pick the initial selection -
    // it's fixed for this screen instance and shouldn't re-trigger a fresh
    // fare estimate on its own.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pickup, destination]);

  // Merges in the admin photo looked up separately (see vehiclePhotos
  // above) so it travels forward through booking/searching instead of
  // getting dropped whenever a vehicle's own record has no imageUrl (the
  // offline fallback list never does).
  const withPhoto = v => ({ ...v, imageUrl: v.imageUrl || vehiclePhotos[v.name] });

  const handleBook = () => {
    if (!selectedOption) {
      return;
    }

    navigation.navigate('ConfirmPickup', {
      pickup,
      destination,
      vehicle: withPhoto(selectedOption),
      fareDetails: {
        vehicleName: selectedOption.name,
        total: selectedOption.fare,
        estimatedTime: `${DISPATCH_ETA_MINUTES} mins away`,
      },
      // The rest of the priced vehicles for this same trip, so the
      // searching screen can offer "switch to this instead" without
      // re-running the fare estimate.
      allVehicles: rideOptions.map(withPhoto),
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
          <MaterialDesignIcons name="arrow-left" size={20} color={colors.text} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.addStopPill}
          onPress={() => Alert.alert('Add Stop', 'Multi-stop rides are coming soon.')}
          activeOpacity={0.85}
        >
          <MaterialDesignIcons name="plus" size={14} color={colors.white} />
          <Text style={styles.addStopText}>Add stop</Text>
        </TouchableOpacity>

        <View style={styles.addressOverlay}>
          <View style={styles.addressPill}>
            <Text style={styles.addressText} numberOfLines={1}>
              {pickup?.address || 'Pickup location'}
            </Text>
            <MaterialDesignIcons name="pencil" size={14} color={colors.textSecondary} />
          </View>
          <View style={styles.addressPill}>
            <Text style={styles.addressText} numberOfLines={1}>
              {destination?.address || 'Drop location'}
            </Text>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <MaterialDesignIcons name="pencil" size={14} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View style={styles.sheet}>
        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator color={colors.primary} />
            <Text style={styles.loadingText}>Fetching live fares for this route...</Text>
          </View>
        ) : (
          <FlatList
            data={rideOptions}
            keyExtractor={item => item._id}
            renderItem={({ item }) => {
              const isSelected = selectedOption?._id === item._id;
              const dropEtaMinutes = DISPATCH_ETA_MINUTES + item.tripDurationMinutes;
              const photoUrl = item.imageUrl || vehiclePhotos[item.name];

              return (
                <TouchableOpacity
                  style={[styles.rideRow, isSelected && styles.rideRowSelected]}
                  onPress={() => setSelectedOption(item)}
                  activeOpacity={0.8}
                >
                  <View style={styles.rideIconBox}>
                    {photoUrl ? (
                      <Image source={{ uri: photoUrl }} style={styles.rideImage} resizeMode="cover" />
                    ) : (
                      <MaterialDesignIcons name={getVehicleIcon(item.name)} size={26} color={colors.navy} />
                    )}
                  </View>

                  <View style={styles.rideDetails}>
                    <Text style={styles.rideName}>{item.name}</Text>
                    <Text style={styles.rideSubtitle}>
                      {DISPATCH_ETA_MINUTES} mins • Drop {formatDropTime(dropEtaMinutes)} • {item.capacity} seats
                    </Text>
                  </View>

                  <Text style={styles.ridePrice}>₹{item.fare}</Text>
                </TouchableOpacity>
              );
            }}
          />
        )}

        <View style={styles.paymentRow}>
          <TouchableOpacity style={styles.paymentItem}>
            <MaterialDesignIcons name="cash" size={16} color={colors.text} />
            <Text style={styles.paymentText}>Cash</Text>
            <MaterialDesignIcons name="chevron-right" size={16} color={colors.textSecondary} />
          </TouchableOpacity>
          <View style={styles.paymentDivider} />
          <TouchableOpacity style={styles.paymentItem}>
            <MaterialDesignIcons name="sale" size={16} color={colors.text} />
            <Text style={styles.paymentText}>Offers</Text>
            <MaterialDesignIcons name="chevron-right" size={16} color={colors.textSecondary} />
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
  addressOverlay: {
    position: 'absolute',
    top: 16,
    left: 66,
    right: 16,
  },
  addStopPill: {
    position: 'absolute',
    right: 16,
    bottom: 70,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.navy,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 6,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  addStopText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '700',
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
  loadingBox: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 13,
    color: colors.textSecondary,
  },
  rideRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  rideRowSelected: {
    backgroundColor: '#FFF4EC',
    borderColor: colors.primary,
    borderWidth: 1.5,
    borderRadius: 14,
    borderBottomWidth: 1.5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: 6,
  },
  rideIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.input,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  rideImage: {
    width: '100%',
    height: '100%',
  },
  rideDetails: {
    flex: 1,
    marginLeft: 8,
  },
  rideName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
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
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
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
    backgroundColor: colors.navy,
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
