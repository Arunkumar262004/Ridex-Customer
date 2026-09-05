import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import RideMap from '../../components/map/RideMap';
import colors from '../../constants/colors';

const CustomerHomeScreen = ({ navigation }) => {
  const [pickup, setPickup] = useState('');
  const [destination, setDestination] = useState('');

  const sampleLocation = { latitude: 12.9716, longitude: 77.5946 };
  const sampleDestination = destination ? { latitude: 12.9352, longitude: 77.6245 } : null;

  const handleSearchRide = () => {
    navigation.navigate('VehicleSelection', {
      pickup: { address: pickup || 'Current Location', ...sampleLocation },
      destination: { address: destination || 'Destination', ...sampleDestination },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.mapContainer}>
        <RideMap location={sampleLocation} destination={sampleDestination} />
      </View>

      <View style={styles.searchCard}>
        <Text style={styles.greeting}>Where to today?</Text>

        <View style={styles.inputBox}>
          <View style={[styles.dot, styles.greenDot]} />
          <TextInput
            style={styles.input}
            value={pickup}
            onChangeText={setPickup}
            placeholder="Pickup Location"
            placeholderTextColor={colors.textSecondary}
          />
        </View>

        <View style={styles.inputBox}>
          <View style={[styles.dot, styles.redDot]} />
          <TextInput
            style={styles.input}
            value={destination}
            onChangeText={setDestination}
            placeholder="Enter Destination"
            placeholderTextColor={colors.textSecondary}
          />
        </View>

        <TouchableOpacity style={styles.searchBtn} onPress={handleSearchRide}>
          <Text style={styles.searchBtnText}>Find Rides</Text>
        </TouchableOpacity>

        <View style={styles.quickNavRow}>
          <TouchableOpacity style={styles.quickBtn} onPress={() => navigation.navigate('RideHistory')}>
            <Text style={styles.quickBtnText}>Ride History</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickBtn} onPress={() => navigation.navigate('Profile')}>
            <Text style={styles.quickBtnText}>Profile</Text>
          </TouchableOpacity>
        </View>
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
  searchCard: {
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
  greeting: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 16,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.input,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 10,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 12,
  },
  greenDot: {
    backgroundColor: '#16A34A',
  },
  redDot: {
    backgroundColor: '#DC2626',
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: colors.text,
    fontWeight: '600',
  },
  searchBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  searchBtnText: {
    color: colors.white,
    fontWeight: '800',
    fontSize: 16,
  },
  quickNavRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 14,
  },
  quickBtn: {
    flex: 1,
    backgroundColor: colors.input,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  quickBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
  },
});

export default CustomerHomeScreen;