import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import CustomerHomeScreen from '../../screens/customer/CustomerHomeScreen';
import AllServicesScreen from '../../screens/customer/AllServicesScreen';
import ProfileScreen from '../../screens/customer/ProfileScreen';
import colors from '../../constants/colors';

const TAB_ICONS = {
  Ride: '🏠',
  AllServices: '➤',
  Profile: '👤',
};

const Tab = createBottomTabNavigator();

const renderTabIcon = (routeName, color) => (
  <Text style={[styles.tabIcon, { color }]}>{TAB_ICONS[routeName]}</Text>
);

const CustomerTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarIcon: ({ color }) => renderTabIcon(route.name, color),
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

const styles = StyleSheet.create({
  tabIcon: {
    fontSize: 20,
  },
});

export default CustomerTabs;
