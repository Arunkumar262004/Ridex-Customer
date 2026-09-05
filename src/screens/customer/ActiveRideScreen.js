import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

const CustomerActiveRideScreen = ({ route, navigation }) => {
  const { ride } = route.params || {};

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Your Ride</Text>
      
      <View style={styles.card}>
        <Text style={styles.statusText}>
          Status: <Text style={styles.statusValue}>{ride?.status || 'ARRIVED'}</Text>
        </Text>
        <Text style={styles.detailText}>Vehicle: {ride?.vehicleType || 'Bike'}</Text>
        <Text style={styles.detailText}>Fare: ₹{ride?.fare || 150}</Text>
      </View>

      {ride?.status !== 'ONGOING' ? (
        <TouchableOpacity
          style={styles.qrButton}
          onPress={() => navigation.navigate('QRCodeScreen', { rideId: ride?._id || ride?.id })}
        >
          <Text style={styles.qrButtonText}>Show Dynamic QR Code</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.ongoingBadge}>
          <Text style={styles.ongoingText}>Ride in Progress 🏍️</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC', padding: 20, justifyContent: 'center' },
  header: { fontSize: 24, fontWeight: 'bold', color: '#0F172A', marginBottom: 20 },
  card: { backgroundColor: '#FFFFFF', padding: 20, borderRadius: 16, marginBottom: 20, elevation: 2 },
  statusText: { fontSize: 16, color: '#475569', marginBottom: 8 },
  statusValue: { fontWeight: 'bold', color: '#2563EB' },
  detailText: { fontSize: 14, color: '#64748B', marginBottom: 4 },
  qrButton: { backgroundColor: '#FFC107', padding: 16, borderRadius: 12, alignItems: 'center' },
  qrButtonText: { color: '#000000', fontWeight: 'bold', fontSize: 16 },
  ongoingBadge: { backgroundColor: '#DCFCE7', padding: 16, borderRadius: 12, alignItems: 'center' },
  ongoingText: { color: '#166534', fontWeight: 'bold', fontSize: 16 },
});

export default CustomerActiveRideScreen;
