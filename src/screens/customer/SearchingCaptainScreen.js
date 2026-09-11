import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
  Alert,
  ScrollView,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import io from 'socket.io-client';
import { MaterialDesignIcons } from '@react-native-vector-icons/material-design-icons';
import RideMap from '../../components/map/RideMap';
import colors from '../../constants/colors';
import { SOCKET_URL } from '../../constants/config';
import { createRide, cancelRide, boostFare } from '../../services/api/rideApi';
import { getVehicleIcon } from '../../utils/vehicleIcon';

// Screen phases:
//  requesting  -> POST /rides in flight
//  searching   -> ride is SEARCHING, waiting on a socket update
//  accepted    -> a captain accepted, about to hand off to ActiveRideScreen
//  exhausted   -> every eligible captain declined
//  failed      -> the create-ride call itself errored
const PHASE = {
  REQUESTING: 'requesting',
  SEARCHING: 'searching',
  ACCEPTED: 'accepted',
  EXHAUSTED: 'exhausted',
  FAILED: 'failed',
};

const BOOST_AMOUNTS = [10, 20, 30, 40];
const MAX_ALTERNATE_SERVICES = 3;

const toRideId = ride => ride?._id || ride?.id;

// A single ring softly pulsing outward from the pickup pin - the "still
// searching" cue that sits over the live map, echoing the pickup radius
// other ride apps show while dispatching nearby.
const RadiusPulse = () => {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(anim, {
        toValue: 1,
        duration: 2000,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    );
    loop.start();
    return () => loop.stop();
  }, [anim]);

  return (
    <View style={styles.pulseWrap} pointerEvents="none">
      <Animated.View
        style={[
          styles.pulseCircle,
          {
            opacity: anim.interpolate({ inputRange: [0, 1], outputRange: [0.35, 0] }),
            transform: [{ scale: anim.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1] }) }],
          },
        ]}
      />
    </View>
  );
};

const VehiclePhoto = ({ vehicle, size }) =>
  vehicle?.imageUrl ? (
    <Image source={{ uri: vehicle.imageUrl }} style={{ width: size, height: size }} resizeMode="contain" />
  ) : (
    <MaterialDesignIcons name={getVehicleIcon(vehicle?.name)} size={size * 0.55} color={colors.navy} />
  );

const SearchingCaptainScreen = ({ navigation, route }) => {
  const { pickup, destination, vehicle, fareDetails, allVehicles } = route.params || {};

  const [phase, setPhase] = useState(PHASE.REQUESTING);
  const [activeVehicle, setActiveVehicle] = useState(vehicle);
  const [baseFare, setBaseFare] = useState(fareDetails?.total ?? vehicle?.fare ?? 0);
  const [appliedBoost, setAppliedBoost] = useState(0);
  const [boostBusy, setBoostBusy] = useState(false);
  const [detailsExpanded, setDetailsExpanded] = useState(false);
  const [progress, setProgress] = useState({ rejectedCount: 0, totalCaptains: null });
  const [errorMessage, setErrorMessage] = useState('');

  const socketRef = useRef(null);
  const rideIdRef = useRef(null);

  const cleanupSocket = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
  }, []);

  const requestRide = useCallback(async (vehicleOverride, fareOverride) => {
    const rideVehicle = vehicleOverride || activeVehicle;
    const rideFare = fareOverride ?? baseFare;

    setPhase(PHASE.REQUESTING);
    setErrorMessage('');
    setProgress({ rejectedCount: 0, totalCaptains: null });
    setAppliedBoost(0);
    setDetailsExpanded(false);
    cleanupSocket();

    try {
      const response = await createRide({
        pickupLocation: {
          address: pickup?.address,
          lat: pickup?.latitude,
          lng: pickup?.longitude,
        },
        dropoffLocation: {
          address: destination?.address,
          lat: destination?.latitude,
          lng: destination?.longitude,
        },
        vehicleType: rideVehicle?.name || 'Ride',
        fare: rideFare,
      });

      const createdRide = response.data || response;
      rideIdRef.current = toRideId(createdRide);

      setProgress({
        rejectedCount: 0,
        totalCaptains: typeof createdRide.totalCaptains === 'number' ? createdRide.totalCaptains : null,
      });
      setPhase(PHASE.SEARCHING);

      const socket = io(SOCKET_URL);
      socketRef.current = socket;
      socket.emit('join_ride_room', rideIdRef.current);

      socket.on('ride_status_updated', updatedRide => {
        if (updatedRide?.status === 'ACCEPTED') {
          setPhase(PHASE.ACCEPTED);
          cleanupSocket();
          navigation.replace('ActiveRideScreen', { ride: updatedRide });
        }
      });

      socket.on('captain_declined', payload => {
        setProgress({ rejectedCount: payload.rejectedCount, totalCaptains: payload.totalCaptains });
      });

      socket.on('no_captains_found', payload => {
        setProgress({ rejectedCount: payload.rejectedCount, totalCaptains: payload.totalCaptains });
        setPhase(PHASE.EXHAUSTED);
        cleanupSocket();
      });
    } catch (error) {
      console.log('Create ride failed:', error?.response?.data || error.message);
      setErrorMessage(
        error?.response?.data?.message || 'Could not reach Ridex right now. Please try again.',
      );
      setPhase(PHASE.FAILED);
    }
  }, [pickup, destination, activeVehicle, baseFare, navigation, cleanupSocket]);

  useEffect(() => {
    requestRide(vehicle, fareDetails?.total ?? vehicle?.fare ?? 0);
    return () => cleanupSocket();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const goHome = () => navigation.navigate('MainTabs', { screen: 'Ride' });

  const handleCancel = () => {
    Alert.alert('Cancel Booking', 'Are you sure you want to cancel this ride request?', [
      { text: 'No, keep searching', style: 'cancel' },
      {
        text: 'Yes, cancel',
        style: 'destructive',
        onPress: () => {
          cleanupSocket();
          if (rideIdRef.current) {
            cancelRide(rideIdRef.current).catch(() => {});
          }
          goHome();
        },
      },
    ]);
  };

  const handleBoost = async amount => {
    if (boostBusy || phase !== PHASE.SEARCHING || !rideIdRef.current) {
      return;
    }

    // Tapping the already-applied amount removes it; tapping another
    // amount replaces it - only the delta between the two needs to reach
    // the server, since boostFare adds/subtracts on top of the ride's
    // current fare.
    const nextAmount = amount === appliedBoost ? 0 : amount;
    const delta = nextAmount - appliedBoost;

    setBoostBusy(true);
    try {
      await boostFare(rideIdRef.current, delta);
      setAppliedBoost(nextAmount);
    } catch (error) {
      console.log('Boost fare failed:', error?.response?.data || error.message);
      Alert.alert('Could not update fare', 'Please try again in a moment.');
    } finally {
      setBoostBusy(false);
    }
  };

  const handleSwitchVehicle = altVehicle => {
    Alert.alert(
      `Switch to ${altVehicle.name}?`,
      `This will cancel your current ${activeVehicle?.name || 'ride'} search and look for a ${altVehicle.name} instead.`,
      [
        { text: 'Stay', style: 'cancel' },
        {
          text: 'Switch',
          onPress: () => {
            cleanupSocket();
            if (rideIdRef.current) {
              cancelRide(rideIdRef.current).catch(() => {});
            }
            setActiveVehicle(altVehicle);
            setBaseFare(altVehicle.fare);
            requestRide(altVehicle, altVehicle.fare);
          },
        },
      ],
    );
  };

  const isActive = phase === PHASE.REQUESTING || phase === PHASE.SEARCHING;
  const hasDeclines = progress.rejectedCount > 0;
  const contactedRatio =
    progress.totalCaptains > 0 ? Math.min(progress.rejectedCount / progress.totalCaptains, 1) : 0;
  const displayedFare = baseFare + appliedBoost;
  const alternateVehicles = (allVehicles || [])
    .filter(v => v._id !== activeVehicle?._id)
    .slice(0, MAX_ALTERNATE_SERVICES);

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.mapSection}>
        <RideMap location={pickup} showRecenterButton={false} />
        {isActive && <RadiusPulse />}
      </View>

      <ScrollView style={styles.sheet} contentContainerStyle={styles.sheetContent}>
        {phase === PHASE.EXHAUSTED ? (
          <>
            <Text style={styles.title}>No Captains Available</Text>
            <Text style={styles.subtitle}>
              {progress.totalCaptains
                ? `All ${progress.totalCaptains} nearby captains are busy right now.`
                : 'All nearby captains are busy right now.'}{' '}
              Please try again in a moment.
            </Text>
          </>
        ) : phase === PHASE.FAILED ? (
          <>
            <Text style={styles.title}>Something Went Wrong</Text>
            <Text style={styles.subtitle}>{errorMessage}</Text>
          </>
        ) : (
          <>
            <Text style={styles.title}>
              {phase === PHASE.REQUESTING
                ? 'Sending your request...'
                : hasDeclines
                  ? 'Few captains nearby, try other services'
                  : 'Finding your Captain...'}
            </Text>

            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${Math.max(contactedRatio * 100, phase === PHASE.SEARCHING ? 8 : 0)}%` },
                ]}
              />
            </View>
          </>
        )}

        {isActive && (
          <>
            <View style={styles.fareRow}>
              <View style={styles.vehiclePhotoBox}>
                <VehiclePhoto vehicle={activeVehicle} size={40} />
              </View>
              <View style={styles.fareTexts}>
                <Text style={styles.fareLabel}>Total Fare</Text>
                <Text style={styles.fareValue}>₹{displayedFare}</Text>
              </View>
              <TouchableOpacity
                style={styles.detailsToggle}
                onPress={() => setDetailsExpanded(v => !v)}
                activeOpacity={0.8}
              >
                <Text style={styles.detailsToggleText}>Trip Details</Text>
                <MaterialDesignIcons
                  name={detailsExpanded ? 'chevron-up' : 'chevron-down'}
                  size={16}
                  color={colors.navy}
                />
              </TouchableOpacity>
            </View>

            {detailsExpanded && (
              <View style={styles.detailsPanel}>
                <View style={styles.locationRow}>
                  <View style={styles.locationRail}>
                    <View style={[styles.dot, styles.greenDot]} />
                    <View style={styles.connector} />
                    <View style={[styles.dot, styles.redDot]} />
                  </View>
                  <View style={styles.locationTexts}>
                    <Text style={styles.locationText} numberOfLines={2}>{pickup?.address || 'Pickup Point'}</Text>
                    <View style={styles.locationGap} />
                    <Text style={styles.locationText} numberOfLines={2}>{destination?.address || 'Destination'}</Text>
                  </View>
                </View>

                <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel}>
                  <Text style={styles.cancelText}>Cancel Booking</Text>
                </TouchableOpacity>
              </View>
            )}

            {phase === PHASE.SEARCHING && (
              <View style={styles.boostBanner}>
                <View style={styles.boostHeaderRow}>
                  <MaterialDesignIcons name="rocket-launch-outline" size={20} color={colors.primary} />
                  <Text style={styles.boostText}>Increase your chances by adding extra</Text>
                </View>
                <View style={styles.boostPillRow}>
                  {BOOST_AMOUNTS.map(amount => {
                    const isSelected = appliedBoost === amount;
                    return (
                      <TouchableOpacity
                        key={amount}
                        style={[styles.boostPill, isSelected && styles.boostPillActive]}
                        onPress={() => handleBoost(amount)}
                        disabled={boostBusy}
                        activeOpacity={0.8}
                      >
                        <Text style={[styles.boostPillText, isSelected && styles.boostPillTextActive]}>
                          +₹{amount}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            )}

            {phase === PHASE.SEARCHING && alternateVehicles.length > 0 && (
              <View style={styles.servicesSection}>
                <Text style={styles.servicesTitle}>Add services to get a ride faster</Text>
                {alternateVehicles.map(item => (
                  <View key={item._id} style={styles.serviceRow}>
                    <View style={styles.serviceIconBox}>
                      <VehiclePhoto vehicle={item} size={34} />
                    </View>
                    <View style={styles.serviceTexts}>
                      <Text style={styles.serviceName}>{item.name}</Text>
                      <Text style={styles.servicePrice}>₹{item.fare}</Text>
                    </View>
                    <TouchableOpacity
                      style={styles.addBtn}
                      onPress={() => handleSwitchVehicle(item)}
                      activeOpacity={0.8}
                    >
                      <MaterialDesignIcons name="plus" size={14} color={colors.navy} />
                      <Text style={styles.addBtnText}>ADD</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </>
        )}
      </ScrollView>

      {(phase === PHASE.EXHAUSTED || phase === PHASE.FAILED) && (
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.secondaryBtn} onPress={goHome}>
            <Text style={styles.secondaryBtnText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.primaryBtn} onPress={() => requestRide()}>
            <Text style={styles.primaryBtnText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  mapSection: {
    height: '32%',
  },
  pulseWrap: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pulseCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: colors.navy,
  },
  sheet: {
    flex: 1,
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -20,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  sheetContent: {
    padding: 20,
    paddingBottom: 32,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.navy,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 6,
    lineHeight: 20,
  },
  progressTrack: {
    width: '100%',
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.input,
    marginTop: 14,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: colors.navy,
  },
  fareRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    padding: 12,
    marginTop: 20,
  },
  vehiclePhotoBox: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: colors.input,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  fareTexts: {
    flex: 1,
  },
  fareLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  fareValue: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.text,
    marginTop: 2,
  },
  detailsToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 7,
    gap: 2,
  },
  detailsToggleText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.navy,
  },
  detailsPanel: {
    borderWidth: 1,
    borderColor: colors.border,
    borderTopWidth: 0,
    borderBottomLeftRadius: 14,
    borderBottomRightRadius: 14,
    padding: 14,
    marginTop: -1,
  },
  locationRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  locationRail: {
    alignItems: 'center',
    marginRight: 12,
    paddingTop: 4,
  },
  dot: {
    width: 9,
    height: 9,
    borderRadius: 5,
  },
  greenDot: {
    backgroundColor: colors.success,
  },
  redDot: {
    backgroundColor: colors.danger,
  },
  connector: {
    width: 2,
    flex: 1,
    minHeight: 22,
    backgroundColor: colors.border,
    marginVertical: 4,
  },
  locationTexts: {
    flex: 1,
  },
  locationText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  locationGap: {
    height: 18,
  },
  cancelBtn: {
    width: '100%',
    backgroundColor: colors.input,
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelText: {
    color: colors.danger,
    fontWeight: '700',
    fontSize: 14,
  },
  boostBanner: {
    backgroundColor: '#FFF4EC',
    borderRadius: 16,
    padding: 14,
    marginTop: 16,
  },
  boostHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  boostText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
  },
  boostPillRow: {
    flexDirection: 'row',
    gap: 8,
  },
  boostPill: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 20,
    paddingVertical: 9,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  boostPillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  boostPillText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
  },
  boostPillTextActive: {
    color: colors.white,
  },
  servicesSection: {
    marginTop: 20,
  },
  servicesTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 12,
  },
  serviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  serviceIconBox: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: colors.input,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  serviceTexts: {
    flex: 1,
  },
  serviceName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  servicePrice: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.navy,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 7,
    gap: 2,
  },
  addBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.navy,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    paddingTop: 12,
    backgroundColor: colors.white,
  },
  secondaryBtn: {
    flex: 1,
    backgroundColor: colors.input,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  secondaryBtnText: {
    color: colors.text,
    fontWeight: '700',
    fontSize: 15,
  },
  primaryBtn: {
    flex: 1.4,
    backgroundColor: colors.navy,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  primaryBtnText: {
    color: colors.white,
    fontWeight: '800',
    fontSize: 15,
  },
});

export default SearchingCaptainScreen;
