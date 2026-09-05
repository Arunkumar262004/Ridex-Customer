import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import colors from '../../constants/colors';

const SearchingCaptainScreen = ({ navigation, route }) => {
  const { pickup, destination, vehicle, fareDetails } = route.params || {};

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.spinnerContainer}>
          <ActivityIndicator size="large" color={colors.customer} />
        </View>

        <Text style={styles.title}>Connecting with Captain...</Text>
        <Text style={styles.subtitle}>Finding nearby driver for your {vehicle?.name || 'Ride'}</Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Ride Summary</Text>
          <Text style={styles.locationText}>Pickup: {pickup?.address || 'Pickup Point'}</Text>
          <Text style={styles.locationText}>Dropoff: {destination?.address || 'Destination'}</Text>
          <Text style={styles.fareText}>Estimated Fare: ₹{fareDetails?.total || 0}</Text>
        </View>

        <TouchableOpacity
          style={styles.cancelBtn}
          onPress={() => navigation.navigate('CustomerHome')}
        >
          <Text style={styles.cancelText}>Cancel Booking</Text>
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
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  spinnerContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.input,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
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
    marginBottom: 30,
  },
  card: {
    width: '100%',
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 18,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSecondary,
    marginBottom: 10,
  },
  locationText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 6,
  },
  fareText: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.customer,
    marginTop: 8,
  },
  cancelBtn: {
    width: '100%',
    backgroundColor: colors.input,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelText: {
    color: colors.danger,
    fontWeight: '700',
    fontSize: 15,
  },
});

export default SearchingCaptainScreen;
