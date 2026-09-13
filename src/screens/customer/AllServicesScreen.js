import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import colors from '../../constants/colors';
import { getCurrentLocation } from '../../services/location/locationService';
import { reverseGeocode } from '../../services/api/placesApi';
import { getVehicleTypes } from '../../services/api/rideApi';
import { MaterialDesignIcons } from '@react-native-vector-icons/material-design-icons';

const DEFAULT_LOCATION = { latitude: 12.9716, longitude: 77.5946 };

// Fallback images matching backend Admin fleet categories if offline
const BACKEND_VEHICLE_DEFAULTS = [
  {
    _id: 'bike',
    name: 'Bike',
    imageUrl: 'https://img.icons8.com/3d-fluency/180/motorcycle.png',
  },
  {
    _id: 'auto',
    name: 'Auto',
    imageUrl: 'https://img.icons8.com/3d-fluency/180/tuk-tuk.png',
  },
  {
    _id: 'premium-auto',
    name: 'Premium Auto',
    imageUrl: 'https://img.icons8.com/3d-fluency/180/tuk-tuk.png',
  },
  {
    _id: 'cab-economy',
    name: 'Cab Economy',
    imageUrl: 'https://img.icons8.com/3d-fluency/180/taxi.png',
  },
  {
    _id: 'premium-car',
    name: 'Premium Car',
    imageUrl: 'https://img.icons8.com/3d-fluency/180/limousine.png',
  },
  {
    _id: 'parcel',
    name: 'Parcel on Bike',
    imageUrl: 'https://img.icons8.com/3d-fluency/180/box.png',
  },
];

const AllServicesScreen = ({ navigation }) => {
  const [vehicleTypes, setVehicleTypes] = useState(BACKEND_VEHICLE_DEFAULTS);
  const [currentLocation, setCurrentLocation] = useState(DEFAULT_LOCATION);
  const [currentAddress, setCurrentAddress] = useState('Current Location');

  useEffect(() => {
    (async () => {
      try {
        const location = await getCurrentLocation();
        setCurrentLocation(location);
        const address = await reverseGeocode(location.latitude, location.longitude);
        if (address) {
          setCurrentAddress(address);
        }
      } catch (err) {
        console.log('Location fetch error on AllServices:', err?.message || err);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const response = await getVehicleTypes();
        const types = response?.data || response || [];
        if (Array.isArray(types) && types.length > 0) {
          setVehicleTypes(types);
        }
      } catch (err) {
        console.log('Vehicle types fetch from backend failed, using defaults:', err?.message || err);
      }
    })();
  }, []);

  const handleSelectService = service => {
    navigation.navigate('DropLocation', {
      pickup: { address: currentAddress, ...currentLocation },
      preselectVehicleTypeId: service._id || service.id,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Title matching screenshot */}
        <Text style={styles.title}>All Services</Text>

        {/* 3-Column Grid of Backend Vehicles */}
        <View style={styles.grid}>
          {vehicleTypes.map(item => {
            // Match fallback image if backend imageUrl is missing
            const fallbackItem = BACKEND_VEHICLE_DEFAULTS.find(
              d => d.name.toLowerCase() === (item.name || '').toLowerCase()
            );
            const imageUri = item.imageUrl || fallbackItem?.imageUrl;

            return (
              <TouchableOpacity
                key={item._id || item.id || item.name}
                style={styles.gridCardItem}
                onPress={() => handleSelectService(item)}
                activeOpacity={0.8}
              >
                <View style={styles.imageCardBox}>
                  {imageUri ? (
                    <Image
                      source={{ uri: imageUri }}
                      style={styles.serviceImage}
                      resizeMode="contain"
                    />
                  ) : (
                    <MaterialDesignIcons name="car" size={32} color={colors.navy} />
                  )}
                </View>
                <Text style={styles.serviceLabel} numberOfLines={2}>
                  {item.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 24,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  gridCardItem: {
    width: '30%',
    marginRight: '3.3%',
    alignItems: 'center',
    marginBottom: 24,
  },
  imageCardBox: {
    width: '100%',
    height: 86,
    borderRadius: 18,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  serviceImage: {
    width: 60,
    height: 60,
  },
  serviceLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
  },
});

export default AllServicesScreen;
