import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import CustomerHomeScreen from '../../screens/customer/CustomerHomeScreen';
import VehicleSelectionScreen from '../../screens/customer/VehicleSelectionScreen';
import SearchingCaptainScreen from '../../screens/customer/SearchingCaptainScreen';
import QRCodeScreen from '../../screens/customer/QRCodeScreen';
import ActiveRideScreen from '../../screens/customer/ActiveRideScreen';
import RideHistoryScreen from '../../screens/customer/RideHistoryScreen';
import ProfileScreen from '../../screens/customer/ProfileScreen';

const Stack = createNativeStackNavigator();

const CustomerNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="CustomerHome" component={CustomerHomeScreen} />
      <Stack.Screen name="VehicleSelection" component={VehicleSelectionScreen} />
      <Stack.Screen name="SearchingCaptain" component={SearchingCaptainScreen} />
      <Stack.Screen
        name="QRCodeScreen"
        component={QRCodeScreen}
        options={{ presentation: 'modal' }}
      />
      <Stack.Screen name="ActiveRideScreen" component={ActiveRideScreen} />
      <Stack.Screen name="RideHistory" component={RideHistoryScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
    </Stack.Navigator>
  );
};

export default CustomerNavigator;
