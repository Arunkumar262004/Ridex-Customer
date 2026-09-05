import React, {useEffect} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {View, ActivityIndicator, StyleSheet} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';

import AuthNavigator from './AuthNavigator';
import CustomerNavigator from './CustomerNavigator';
import {setAuth, setInitialized} from '../store/slices/authSlice';
import {getAuthData} from '../../utils/storage';
import colors from '../../constants/colors';

const RootNavigator = () => {
  const dispatch = useDispatch();

  const {isAuthenticated, initialized} = useSelector(state => state.auth);

  useEffect(() => {
    restoreAuthentication();
  }, []);

  const restoreAuthentication = async () => {
    try {
      const authData = await getAuthData();
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
      console.log('Authentication restore error:', error);
      dispatch(setInitialized());
    }
  };

  if (!initialized) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? <CustomerNavigator /> : <AuthNavigator />}
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