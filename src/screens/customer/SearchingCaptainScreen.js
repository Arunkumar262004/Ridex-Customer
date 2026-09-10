import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import io from 'socket.io-client';
import { MaterialDesignIcons } from '@react-native-vector-icons/material-design-icons';
import colors from '../../constants/colors';
import { SOCKET_URL } from '../../constants/config';
import { createRide } from '../../services/api/rideApi';

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

const toRideId = ride => ride?._id || ride?.id;

// Three rings pulsing outward from the vehicle badge, staggered so the
// animation reads as a continuous radar sweep rather than three rings
// blinking in sync.
const RADAR_RINGS = [0, 550, 1100];

const RadarPulse = () => {
  const anims = useRef(RADAR_RINGS.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    const loops = anims.map((value, index) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(RADAR_RINGS[index]),
          Animated.timing(value, {
            toValue: 1,
            duration: 2200,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      ),
    );

    loops.forEach(loop => loop.start());
    return () => loops.forEach(loop => loop.stop());
  }, [anims]);

  return (
    <View style={styles.radarWrap}>
      {anims.map((value, index) => (
        <Animated.View
          key={index}
          style={[
            styles.radarRing,
            {
              opacity: value.interpolate({ inputRange: [0, 0.6, 1], outputRange: [0.5, 0.2, 0] }),
              transform: [
                { scale: value.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1] }) },
              ],
            },
          ]}
        />
      ))}
      <View style={styles.radarCore}>
        <MaterialDesignIcons name="car-search" size={30} color={colors.white} />
      </View>
    </View>
  );
};

const VEHICLE_ICON = {
  BIKE: 'motorbike',
  AUTO: 'rickshaw',
  CAB: 'car',
  PARCEL: 'package-variant-closed',
};

const SearchingCaptainScreen = ({ navigation, route }) => {
  const { pickup, destination, vehicle, fareDetails } = route.params || {};

  const [phase, setPhase] = useState(PHASE.REQUESTING);
  const [progress, setProgress] = useState({ rejectedCount: 0, totalCaptains: null });
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');

  const socketRef = useRef(null);
  const timerRef = useRef(null);

  const cleanupSocket = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
  }, []);

  const requestRide = useCallback(async () => {
    setPhase(PHASE.REQUESTING);
    setErrorMessage('');
    setProgress({ rejectedCount: 0, totalCaptains: null });
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
        vehicleType: vehicle?.name || 'Ride',
        fare: fareDetails?.total ?? vehicle?.fare ?? 0,
      });

      const createdRide = response.data || response;
      setProgress({
        rejectedCount: 0,
        totalCaptains: typeof createdRide.totalCaptains === 'number' ? createdRide.totalCaptains : null,
      });
      setPhase(PHASE.SEARCHING);

      const rideId = toRideId(createdRide);
      const socket = io(SOCKET_URL);
      socketRef.current = socket;
      socket.emit('join_ride_room', rideId);

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
  }, [pickup, destination, vehicle, fareDetails, navigation, cleanupSocket]);

  useEffect(() => {
    requestRide();
    return () => cleanupSocket();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (phase !== PHASE.SEARCHING) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    setElapsedSeconds(0);
    timerRef.current = setInterval(() => setElapsedSeconds(s => s + 1), 1000);
    return () => clearInterval(timerRef.current);
  }, [phase]);

  const formattedElapsed = `${String(Math.floor(elapsedSeconds / 60)).padStart(2, '0')}:${String(
    elapsedSeconds % 60,
  ).padStart(2, '0')}`;

  const contactedRatio =
    progress.totalCaptains > 0 ? Math.min(progress.rejectedCount / progress.totalCaptains, 1) : 0;

  const goHome = () => navigation.navigate('MainTabs', { screen: 'Ride' });

  const handleCancel = () => {
    Alert.alert('Cancel Booking', 'Are you sure you want to cancel this ride request?', [
      { text: 'No, keep searching', style: 'cancel' },
      { text: 'Yes, cancel', style: 'destructive', onPress: () => { cleanupSocket(); goHome(); } },
    ]);
  };

  const vehicleIcon = VEHICLE_ICON[vehicle?.serviceType] || 'car';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {phase === PHASE.EXHAUSTED ? (
          <>
            <View style={[styles.radarCore, styles.staticBadge, styles.badgeMuted]}>
              <MaterialDesignIcons name="car-off" size={30} color={colors.textSecondary} />
            </View>
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
            <View style={[styles.radarCore, styles.staticBadge, styles.badgeDanger]}>
              <MaterialDesignIcons name="close-circle-outline" size={30} color={colors.white} />
            </View>
            <Text style={styles.title}>Something Went Wrong</Text>
            <Text style={styles.subtitle}>{errorMessage}</Text>
          </>
        ) : (
          <>
            <RadarPulse />
            <Text style={styles.title}>
              {phase === PHASE.REQUESTING ? 'Sending your request...' : 'Finding your Captain...'}
            </Text>
            <Text style={styles.subtitle}>
              Looking for a nearby {vehicle?.name || 'ride'} for you
            </Text>

            {phase === PHASE.SEARCHING && (
              <View style={styles.metaRow}>
                <View style={styles.timePill}>
                  <MaterialDesignIcons name="timer-sand" size={13} color={colors.textSecondary} />
                  <Text style={styles.timePillText}>{formattedElapsed}</Text>
                </View>

                {progress.totalCaptains > 0 && (
                  <View style={styles.progressPill}>
                    <MaterialDesignIcons name="account-search" size={13} color={colors.textSecondary} />
                    <Text style={styles.timePillText}>
                      {progress.rejectedCount} of {progress.totalCaptains} captains contacted
                    </Text>
                  </View>
                )}
              </View>
            )}

            {progress.totalCaptains > 0 && phase === PHASE.SEARCHING && (
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${contactedRatio * 100}%` }]} />
              </View>
            )}
          </>
        )}

        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.vehicleBadge}>
              <MaterialDesignIcons name={vehicleIcon} size={18} color={colors.navy} />
            </View>
            <Text style={styles.cardTitle}>Ride Summary</Text>
          </View>

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

          <View style={styles.divider} />

          <View style={styles.fareRow}>
            <Text style={styles.fareLabel}>Estimated Fare</Text>
            <Text style={styles.fareText}>₹{fareDetails?.total ?? vehicle?.fare ?? 0}</Text>
          </View>
        </View>

        {phase === PHASE.EXHAUSTED || phase === PHASE.FAILED ? (
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.secondaryBtn} onPress={goHome}>
              <Text style={styles.secondaryBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.primaryBtn} onPress={requestRide}>
              <Text style={styles.primaryBtnText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel}>
            <Text style={styles.cancelText}>Cancel Booking</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

const RADAR_SIZE = 120;
const RING_SIZE = 96;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  radarWrap: {
    width: RADAR_SIZE,
    height: RADAR_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 22,
  },
  radarRing: {
    position: 'absolute',
    width: RING_SIZE,
    height: RING_SIZE,
    borderRadius: RING_SIZE / 2,
    backgroundColor: colors.navy,
  },
  radarCore: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.navy,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: colors.navy,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  staticBadge: {
    marginBottom: 22,
  },
  badgeMuted: {
    backgroundColor: colors.input,
  },
  badgeDanger: {
    backgroundColor: colors.danger,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 20,
    paddingHorizontal: 8,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginTop: 16,
  },
  timePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.input,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 6,
  },
  progressPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.input,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 6,
  },
  timePillText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
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
    backgroundColor: colors.primary,
  },
  card: {
    width: '100%',
    backgroundColor: colors.white,
    borderRadius: 18,
    padding: 18,
    marginTop: 26,
    marginBottom: 22,
    borderWidth: 1,
    borderColor: colors.border,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  vehicleBadge: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: colors.input,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  locationRow: {
    flexDirection: 'row',
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
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 14,
  },
  fareRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fareLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  fareText: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.navy,
  },
  cancelBtn: {
    width: '100%',
    backgroundColor: colors.input,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  cancelText: {
    color: colors.danger,
    fontWeight: '700',
    fontSize: 15,
  },
  buttonRow: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
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
