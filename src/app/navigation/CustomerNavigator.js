import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSelector } from 'react-redux';

import CustomerTabs from './CustomerTabs';
import ProfileSetupScreen from '../../screens/auth/ProfileSetupScreen';
import DropLocationScreen from '../../screens/customer/DropLocationScreen';
import MapPickerScreen from '../../screens/customer/MapPickerScreen';
import VehicleSelectionScreen from '../../screens/customer/VehicleSelectionScreen';
import ConfirmPickupScreen from '../../screens/customer/ConfirmPickupScreen';
import SearchingCaptainScreen from '../../screens/customer/SearchingCaptainScreen';
import QRCodeScreen from '../../screens/customer/QRCodeScreen';
import ActiveRideScreen from '../../screens/customer/ActiveRideScreen';
import RideHistoryScreen from '../../screens/customer/RideHistoryScreen';
import WalletScreen from '../../screens/customer/WalletScreen';
import HelpScreen from '../../screens/customer/HelpScreen';
import SafetyScreen from '../../screens/customer/SafetyScreen';
import ReferralScreen from '../../screens/customer/ReferralScreen';
import NotificationsScreen from '../../screens/customer/NotificationsScreen';
import SettingsScreen from '../../screens/customer/SettingsScreen';

const Stack = createNativeStackNavigator();

const CustomerNavigator = () => {
  const user = useSelector(state => state.auth.user);
  const needsProfileSetup = !user?.name;

  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false }}
      initialRouteName={needsProfileSetup ? 'ProfileSetup' : 'MainTabs'}
    >
      <Stack.Screen name="ProfileSetup" component={ProfileSetupScreen} />
      <Stack.Screen name="MainTabs" component={CustomerTabs} />
      <Stack.Screen name="DropLocation" component={DropLocationScreen} />
      <Stack.Screen name="MapPicker" component={MapPickerScreen} />
      <Stack.Screen name="VehicleSelection" component={VehicleSelectionScreen} />
      <Stack.Screen name="ConfirmPickup" component={ConfirmPickupScreen} />
      <Stack.Screen name="SearchingCaptain" component={SearchingCaptainScreen} />
      <Stack.Screen
        name="QRCodeScreen"
        component={QRCodeScreen}
        options={{ presentation: 'modal' }}
      />
      <Stack.Screen name="ActiveRideScreen" component={ActiveRideScreen} />
      <Stack.Screen name="RideHistory" component={RideHistoryScreen} />
      <Stack.Screen name="Wallet" component={WalletScreen} />
      <Stack.Screen name="Help" component={HelpScreen} />
      <Stack.Screen name="Safety" component={SafetyScreen} />
      <Stack.Screen name="Referral" component={ReferralScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
    </Stack.Navigator>
  );
};

export default CustomerNavigator;
