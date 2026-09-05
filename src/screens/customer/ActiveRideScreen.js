import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import colors from '../../constants/colors';

const CustomerActiveRideScreen = ({ route, navigation }) => {
  const { ride } = route.params || {};

  const isOngoing = ride?.status === 'ONGOING';

  if (!ride) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>No Active Ride Found</Text>
          <TouchableOpacity
            style={styles.homeButton}
            onPress={() => navigation.navigate('CustomerHome')}
          >
            <Text style={styles.homeButtonText}>Back to Home</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Your Ride</Text>
        <Text style={styles.subtitle}>
          {isOngoing ? 'Ride in progress' : 'Captain has arrived at pickup'}
        </Text>
      </View>

      <View style={styles.card}>
        <View style={styles.captainRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{ride.captainName ? ride.captainName.charAt(0) : 'C'}</Text>
          </View>
          <View style={styles.captainInfo}>
            <Text style={styles.captainName}>{ride.captainName || 'Captain'}</Text>
            <Text style={styles.vehicleDetails}>{ride.vehicleType || 'Vehicle'} • {ride.vehicleNumber || 'Plate'}</Text>
          </View>
          <Text style={styles.fare}>₹{ride.fare || 0}</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.locationContainer}>
          <View style={[styles.dot, styles.greenDot]} />
          <Text style={styles.locationText}>Pickup: {ride.pickupLocation?.address || 'Pickup Point'}</Text>
        </View>

        <View style={styles.locationContainer}>
          <View style={[styles.dot, styles.redDot]} />
          <Text style={styles.locationText}>Dropoff: {ride.dropoffLocation?.address || 'Destination'}</Text>
        </View>

        <View style={styles.statusBadgeRow}>
          <Text style={styles.statusLabel}>Ride Status:</Text>
          <Text style={[styles.statusBadge, isOngoing ? styles.statusGreen : styles.statusBlue]}>
            {ride?.status || 'ARRIVED'}
          </Text>
        </View>
      </View>

      {!isOngoing ? (
        <TouchableOpacity
          style={styles.qrButton}
          onPress={() => navigation.navigate('QRCodeScreen', { rideId: ride?._id || ride?.id })}
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
        onPress={() => navigation.navigate('CustomerHome')}
      >
        <Text style={styles.homeButtonText}>Back to Home</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 20,
    justifyContent: 'center',
  },
  emptyContainer: {
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
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  card: {
    backgroundColor: colors.white,
    padding: 20,
    borderRadius: 18,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  captainRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.customer,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: colors.white,
    fontWeight: '800',
    fontSize: 20,
  },
  captainInfo: {
    flex: 1,
    marginLeft: 12,
  },
  captainName: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
  },
  vehicleDetails: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  fare: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.customer,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 14,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  greenDot: {
    backgroundColor: '#16A34A',
  },
  redDot: {
    backgroundColor: '#DC2626',
  },
  locationText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  statusBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  statusLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    marginRight: 8,
  },
  statusBadge: {
    fontSize: 12,
    fontWeight: '800',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusBlue: {
    backgroundColor: '#DBEAFE',
    color: '#2563EB',
  },
  statusGreen: {
    backgroundColor: '#DCFCE7',
    color: '#16A34A',
  },
  qrButton: {
    backgroundColor: colors.customer,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  qrButtonText: {
    color: colors.white,
    fontWeight: '800',
    fontSize: 16,
  },
  ongoingBadge: {
    backgroundColor: '#DCFCE7',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  ongoingText: {
    color: '#166534',
    fontWeight: '800',
    fontSize: 15,
  },
  homeButton: {
    backgroundColor: colors.input,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  homeButtonText: {
    color: colors.text,
    fontWeight: '700',
    fontSize: 14,
  },
});

export default CustomerActiveRideScreen;
