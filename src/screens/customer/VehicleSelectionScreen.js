import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Alert,
  SafeAreaView,
} from 'react-native';
import VehicleCard from '../../components/vehicle/VehicleCard';
import AppButton from '../../components/common/AppButton';
import colors from '../../constants/colors';
import { getVehicleTypes } from '../../services/api/rideApi';

const DEFAULT_VEHICLES = [
  { id: '1', name: 'Bike Taxi', description: 'Fastest & budget friendly', baseFare: 25, perKm: 10, type: 'bike' },
  { id: '2', name: 'Auto Express', description: 'Hassle-free auto ride', baseFare: 40, perKm: 15, type: 'auto' },
  { id: '3', name: 'Cab Comfort', description: 'Air-conditioned comfort', baseFare: 80, perKm: 22, type: 'cab' },
];

const VehicleSelectionScreen = ({ navigation, route }) => {
  const { pickup, destination } = route.params || {};

  const [vehicles, setVehicles] = useState(DEFAULT_VEHICLES);
  const [selectedVehicle, setSelectedVehicle] = useState(DEFAULT_VEHICLES[0]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadVehicles();
  }, []);

  const loadVehicles = async () => {
    try {
      setLoading(true);
      const response = await getVehicleTypes();
      if (response && response.data && response.data.length > 0) {
        setVehicles(response.data);
        setSelectedVehicle(response.data[0]);
      }
    } catch (error) {
      console.log('Using default vehicle list');
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    if (!selectedVehicle) {
      Alert.alert('Select vehicle', 'Please select a vehicle type.');
      return;
    }

    const estimatedFare = Math.round(selectedVehicle.baseFare + (selectedVehicle.perKm * 6.5));

    navigation.navigate('FareEstimate', {
      pickup,
      destination,
      vehicle: selectedVehicle,
      fareDetails: {
        vehicleName: selectedVehicle.name,
        baseFare: selectedVehicle.baseFare,
        distanceFare: selectedVehicle.perKm * 6.5,
        tax: 15,
        total: estimatedFare,
        estimatedTime: '3-5 mins away',
      },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Choose your ride</Text>
        <Text style={styles.subtitle}>Select the option that suits your travel</Text>
      </View>

      <FlatList
        data={vehicles}
        keyExtractor={item => item._id || item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <VehicleCard
            vehicle={item}
            selected={selectedVehicle && (selectedVehicle.id === item.id || selectedVehicle._id === item._id)}
            onPress={() => setSelectedVehicle(item)}
          />
        )}
      />

      <View style={styles.footer}>
        <AppButton
          title={`Confirm ${selectedVehicle ? selectedVehicle.name : 'Ride'}`}
          onPress={handleContinue}
          disabled={!selectedVehicle}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.white,
    padding: 20,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
  },
  subtitle: {
    marginTop: 4,
    fontSize: 13,
    color: colors.textSecondary,
  },
  list: {
    padding: 20,
  },
  footer: {
    padding: 20,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderColor: colors.border,
  },
});

export default VehicleSelectionScreen;