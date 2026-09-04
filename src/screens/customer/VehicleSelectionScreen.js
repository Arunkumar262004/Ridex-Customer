import React, {useEffect, useState} from 'react';

import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Alert,
} from 'react-native';

import VehicleCard from '../../components/vehicle/VehicleCard';
import AppButton from '../../components/common/AppButton';

import colors from '../../constants/colors';

import {
  getVehicleTypes,
} from '../../services/api/rideApi';

const VehicleSelectionScreen = ({navigation, route}) => {
  const {pickupLocation} = route.params;

  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] =
    useState(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadVehicles();
  }, []);

  const loadVehicles = async () => {
    try {
      const response = await getVehicleTypes();

      setVehicles(response.data || response);
    } catch (error) {
      console.log('Vehicle API error:', error);

      Alert.alert(
        'Error',
        'Unable to load vehicle types.',
      );
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    if (!selectedVehicle) {
      Alert.alert(
        'Select vehicle',
        'Please select a vehicle type.',
      );

      return;
    }

    navigation.navigate('FareEstimate', {
      pickupLocation,
      vehicleType: selectedVehicle,
    });
  };

  return (
    <View style={styles.container}>

      <View style={styles.header}>
        <Text style={styles.title}>
          Choose your ride
        </Text>

        <Text style={styles.subtitle}>
          Select the vehicle that suits you
        </Text>
      </View>

      <FlatList
        data={vehicles}
        keyExtractor={item => item._id || item.id}
        contentContainerStyle={styles.list}
        renderItem={({item}) => (
          <VehicleCard
            vehicle={item}
            selected={
              selectedVehicle &&
              (selectedVehicle._id === item._id ||
                selectedVehicle.id === item.id)
            }
            onPress={() =>
              setSelectedVehicle(item)
            }
          />
        )}
        ListEmptyComponent={
          !loading ? (
            <Text style={styles.empty}>
              No vehicles available.
            </Text>
          ) : null
        }
      />

      <View style={styles.footer}>
        <AppButton
          title="Continue"
          onPress={handleContinue}
          disabled={!selectedVehicle}
        />
      </View>

    </View>
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
  },

  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
  },

  subtitle: {
    marginTop: 5,
    fontSize: 13,
    color: colors.textSecondary,
  },

  list: {
    padding: 20,
  },

  empty: {
    textAlign: 'center',
    marginTop: 40,
    color: colors.textSecondary,
  },

  footer: {
    padding: 20,
    backgroundColor: colors.white,
  },
});

export default VehicleSelectionScreen;