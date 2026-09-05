import React, {useState} from 'react';

import {
  View,
  Text,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from 'react-native';

import {useDispatch, useSelector} from 'react-redux';

import AppInput from '../../components/common/AppInput';
import AppButton from '../../components/common/AppButton';

import colors from '../../constants/colors';

import {
  loginUser,
} from '../../services/api/authApi';

import {
  loginStart,
  loginSuccess,
  loginFailure,
} from '../../app/store/slices/authSlice';

import {
  saveAuthData,
} from '../../utils/storage';

const LoginScreen = ({navigation}) => {
  const dispatch = useDispatch();

  const {loading} = useSelector(
    state => state.auth,
  );

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!email.trim()) {
      Alert.alert('Validation', 'Please enter your email.');
      return;
    }

    if (!password) {
      Alert.alert(
        'Validation',
        'Please enter your password.',
      );
      return;
    }

    try {
      dispatch(loginStart());

      const response = await loginUser({
        email: email.trim().toLowerCase(),
        password,
      });

      /*
       Expected backend response:

       {
         success: true,
         data: {
           token: "...",
           user: {
             id: "...",
             name: "...",
             email: "...",
             role: "CUSTOMER"
           }
         }
       }
      */

      const authData = response.data || response;

      const token = authData.token;
      const user = authData.user;

      if (!token || !user) {
        throw new Error(
          'Invalid login response from server.',
        );
      }

      await saveAuthData({
        token,
        user,
      });

      dispatch(
        loginSuccess({
          token,
          user,
        }),
      );
    } catch (error) {
      console.log(
        'Login error:',
        error?.response?.data || error,
      );

      dispatch(loginFailure());

      const message =
        error?.response?.data?.message ||
        'Unable to login. Please check your credentials.';

      Alert.alert('Login Failed', message);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={
        Platform.OS === 'ios'
          ? 'padding'
          : undefined
      }
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.logoContainer}>
          <Text style={styles.logo}>RIDEX</Text>

          <Text style={styles.tagline}>
            Your ride. Your way.
          </Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.heading}>
            Welcome back
          </Text>

          <Text style={styles.description}>
            Login to continue booking your ride.
          </Text>

          <AppInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="Enter your email"
            keyboardType="email-address"
          />

          <AppInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder="Enter your password"
            secureTextEntry
          />

          <AppButton
            title="Login"
            onPress={handleLogin}
            loading={loading}
          />

          <View style={styles.registerRow}>
            <Text style={styles.accountText}>
              Don't have an account?
            </Text>

            <TouchableOpacity
              onPress={() =>
                navigation.navigate('Register')
              }
            >
              <Text style={styles.registerText}>
                Create account
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },

  content: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },

  logoContainer: {
    alignItems: 'center',
    marginBottom: 50,
  },

  logo: {
    fontSize: 38,
    fontWeight: '900',
    letterSpacing: 3,
    color: colors.primary,
  },

  tagline: {
    marginTop: 8,
    fontSize: 14,
    color: colors.textSecondary,
  },

  form: {
    width: '100%',
  },

  heading: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.text,
  },

  description: {
    marginTop: 6,
    marginBottom: 25,
    fontSize: 14,
    color: colors.textSecondary,
  },

  registerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 25,
  },

  accountText: {
    color: colors.textSecondary,
    fontSize: 14,
  },

  registerText: {
    marginLeft: 5,
    color: colors.customer,
    fontWeight: '700',
    fontSize: 14,
  },
});

export default LoginScreen;