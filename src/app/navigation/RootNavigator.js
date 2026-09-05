import React, {useEffect} from 'react';
<<<<<<< HEAD
import {NavigationContainer} from '@react-navigation/native';
import {View, ActivityIndicator, StyleSheet} from 'react-native';
=======

import {
  NavigationContainer,
} from '@react-navigation/native';

import {
  View,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';

>>>>>>> 93956b05108efbaa274c5028d04e7a442a535515
import {useDispatch, useSelector} from 'react-redux';

import AuthNavigator from './AuthNavigator';
import CustomerNavigator from './CustomerNavigator';
<<<<<<< HEAD
import {setAuth, setInitialized} from '../store/slices/authSlice';
import {getAuthData} from '../../utils/storage';
=======
import CaptainNavigator from './CaptainNavigator';
import AdminNavigator from './AdminNavigator';

import {
  setAuth,
  setInitialized,
} from '../store/slices/authSlice';

import {
  getAuthData,
} from '../../utils/storage';

>>>>>>> 93956b05108efbaa274c5028d04e7a442a535515
import colors from '../../constants/colors';

const RootNavigator = () => {
  const dispatch = useDispatch();

<<<<<<< HEAD
  const {isAuthenticated, initialized} = useSelector(state => state.auth);
=======
  const {
    user,
    isAuthenticated,
    initialized,
  } = useSelector(state => state.auth);
>>>>>>> 93956b05108efbaa274c5028d04e7a442a535515

  useEffect(() => {
    restoreAuthentication();
  }, []);

  const restoreAuthentication = async () => {
    try {
      const authData = await getAuthData();
<<<<<<< HEAD
=======

>>>>>>> 93956b05108efbaa274c5028d04e7a442a535515
      if (authData?.token && authData?.user) {
        dispatch(
          setAuth({
            token: authData.token,
            user: authData.user,
          }),
        );
      } else {
        dispatch(setInitialized());
      }
    } catch (error) {
<<<<<<< HEAD
      console.log('Authentication restore error:', error);
=======
      console.log(
        'Authentication restore error:',
        error,
      );

>>>>>>> 93956b05108efbaa274c5028d04e7a442a535515
      dispatch(setInitialized());
    }
  };

  if (!initialized) {
    return (
      <View style={styles.loading}>
<<<<<<< HEAD
        <ActivityIndicator size="large" color={colors.primary} />
=======
        <ActivityIndicator
          size="large"
          color={colors.primary}
        />
>>>>>>> 93956b05108efbaa274c5028d04e7a442a535515
      </View>
    );
  }

<<<<<<< HEAD
  return (
    <NavigationContainer>
      {isAuthenticated ? <CustomerNavigator /> : <AuthNavigator />}
=======
  const renderNavigator = () => {
    if (!isAuthenticated) {
      return <AuthNavigator />;
    }

    switch (user?.role) {
      case 'CUSTOMER':
        return <CustomerNavigator />;

      case 'CAPTAIN':
        return <CaptainNavigator />;

      case 'ADMIN':
        return <AdminNavigator />;

      default:
        return <AuthNavigator />;
    }
  };

  return (
    <NavigationContainer>
      {renderNavigator()}
>>>>>>> 93956b05108efbaa274c5028d04e7a442a535515
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.white,
  },
});

export default RootNavigator;