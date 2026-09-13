import React from 'react';
import { StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialDesignIcons } from '@react-native-vector-icons/material-design-icons';

import CustomerHomeScreen from '../../screens/customer/CustomerHomeScreen';
import AllServicesScreen from '../../screens/customer/AllServicesScreen';
import ProfileScreen from '../../screens/customer/ProfileScreen';
import colors from '../../constants/colors';

const TAB_ICON_NAMES = {
  Ride: 'home-outline',
  AllServices: 'view-grid-outline',
  Profile: 'account-outline',
};

const Tab = createBottomTabNavigator();

const renderTabIcon = (routeName, color, focused) => {
  let iconName = TAB_ICON_NAMES[routeName] || 'circle';
  if (focused) {
    if (routeName === 'Ride') iconName = 'home';
    if (routeName === 'AllServices') iconName = 'view-grid';
    if (routeName === 'Profile') iconName = 'account';
  }
  return <MaterialDesignIcons name={iconName} size={24} color={color} />;
};

const CustomerTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarIcon: ({ color, focused }) => renderTabIcon(route.name, color, focused),
      })}
    >
      <Tab.Screen name="Ride" component={CustomerHomeScreen} />
      <Tab.Screen
        name="AllServices"
        component={AllServicesScreen}
        options={{ title: 'All Services' }}
      />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({});

export default CustomerTabs;
