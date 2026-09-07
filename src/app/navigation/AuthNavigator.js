import React from 'react';

import {
  createNativeStackNavigator,
} from '@react-navigation/native-stack';

import MobileNumberScreen from '../../screens/auth/MobileNumberScreen';
import OtpScreen from '../../screens/auth/OtpScreen';

const Stack = createNativeStackNavigator();

const AuthNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="MobileNumber"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="MobileNumber"
        component={MobileNumberScreen}
      />

      <Stack.Screen
        name="Otp"
        component={OtpScreen}
      />
    </Stack.Navigator>
  );
};

export default AuthNavigator;
