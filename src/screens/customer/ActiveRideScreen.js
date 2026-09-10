import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import io from 'socket.io-client';
import RideMap from '../../components/map/RideMap';
import colors from '../../constants/colors';
import {SOCKET_URL} from '../../constants/config';

const CustomerActiveRideScreen = ({ route, navigation }) => {
  const { ride } = route.params || {};

  const [currentRide, setCurrentRide] = useState(ride);
  const [captainLocation, setCaptainLocation] = useState(ride?.captainLocation || null);

  const isOngoing = currentRide?.status === 'ONGOING';

  useEffect(() => {
    if (!ride?._id && !ride?.id) return;

    const rideId = ride._id || ride.id;

    // Connect to WebSocket server for real-time live location & status updates
    let socket;
    try {
      socket = io(SOCKET_URL);
      socket.emit('join_ride_room', rideId);

      // Listen for live captain GPS movement
      socket.on('live_captain_location', (location) => {
        console.log('Received live captain location:', location);
        setCaptainLocation(location);
      });

      // Listen for ride start or status updates
      socket.on('ride_started', (updatedRide) => {
        setCurrentRide(updatedRide);
      });
    } catch (e) {
      console.log('Socket connection error');
    }

    return () => {
      if (socket) socket.disconnect();
    };
  }, [ride]);

  if (!currentRide) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>No Active Ride Found</Text>
          <TouchableOpacity
            style={styles.homeButton}
            onPress={() => navigation.navigate('MainTabs', { screen: 'Ride' })}
          >
            <Text style={styles.homeButtonText}>Back to Home</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Active Route Map with Live Captain Movement */}
      <View style={styles.mapContainer}>
        <RideMap
          location={currentRide.pickupLocation}
          destination={currentRide.dropoffLocation}
          captainLocation={captainLocation}
        />
      </View>

      {/* Ride Info Panel */}
      <View style={styles.infoPanel}>
        <View style={styles.header}>
          <Text style={styles.title}>Your Active Ride</Text>
          <Text style={styles.subtitle}>
            {isOngoing ? 'Ride in progress' : captainLocation ? 'Captain is moving towards pickup location' : 'Captain assigned'}
          </Text>
        </View>

        <View style={styles.card}>
          <View style={styles.captainRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{currentRide.captainName ? currentRide.captainName.charAt(0) : 'C'}</Text>
            </View>
            <View style={styles.captainInfo}>
              <Text style={styles.captainName}>{currentRide.captainName || 'Captain'}</Text>
              <Text style={styles.vehicleDetails}>{currentRide.vehicleType || 'Vehicle'} • {currentRide.vehicleNumber || 'Plate'}</Text>
            </View>
            <Text style={styles.fare}>₹{currentRide.fare || 0}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.locationContainer}>
            <View style={[styles.dot, styles.greenDot]} />
            <Text style={styles.locationText} numberOfLines={1}>Pickup: {currentRide.pickupLocation?.address || 'Pickup Point'}</Text>
          </View>

          <View style={styles.locationContainer}>
            <View style={[styles.dot, styles.redDot]} />
            <Text style={styles.locationText} numberOfLines={1}>Dropoff: {currentRide.dropoffLocation?.address || 'Destination'}</Text>
          </View>

          <View style={styles.statusBadgeRow}>
            <Text style={styles.statusLabel}>Status:</Text>
            <Text style={[styles.statusBadge, isOngoing ? styles.statusGreen : styles.statusBlue]}>
              {currentRide?.status || 'ACCEPTED'}
            </Text>
          </View>
        </View>

        {!isOngoing ? (
          <TouchableOpacity
            style={styles.qrButton}
            onPress={() => navigation.navigate('QRCodeScreen', { rideId: currentRide?._id || currentRide?.id })}
          >
            <Text style={styles.qrButtonText}>Show Dynamic QR Code to Captain</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.ongoingBadge}>
            <Text style={styles.ongoingText}>Ride in Progress - Have a safe journey</Text>
          </View>
        )}

        <TouchableOpacity
          style={styles.homeButton}
          onPress={() => navigation.navigate('MainTabs', { screen: 'Ride' })}
        >
          <Text style={styles.homeButtonText}>Back to Home</Text>
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
  infoPanel: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyTitle: {
    fontSize: 18,
    color: colors.text,
    fontWeight: '700',
    marginBottom: 20,
  },
  header: {
    marginBottom: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
  },
  subtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  card: {
    backgroundColor: colors.input,
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
  },
  captainRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.customer,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: colors.white,
    fontWeight: '800',
    fontSize: 18,
  },
  captainInfo: {
    flex: 1,
    marginLeft: 12,
  },
  captainName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  vehicleDetails: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  fare: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.customer,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 10,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 10,
  },
  greenDot: {
    backgroundColor: '#16A34A',
  },
  redDot: {
    backgroundColor: '#DC2626',
  },
  locationText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
  },
  statusBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  statusLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginRight: 6,
  },
  statusBadge: {
    fontSize: 11,
    fontWeight: '800',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusBlue: {
    backgroundColor: '#FFE4CC',
    color: colors.primary,
  },
  statusGreen: {
    backgroundColor: '#DCFCE7',
    color: '#16A34A',
  },
  qrButton: {
    backgroundColor: colors.navy,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 10,
  },
  qrButtonText: {
    color: colors.white,
    fontWeight: '800',
    fontSize: 15,
  },
  ongoingBadge: {
    backgroundColor: '#DCFCE7',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 10,
  },
  ongoingText: {
    color: '#166534',
    fontWeight: '800',
    fontSize: 14,
  },
  homeButton: {
    backgroundColor: colors.input,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  homeButtonText: {
    color: colors.text,
    fontWeight: '700',
    fontSize: 13,
  },
});

export default CustomerActiveRideScreen;
