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
  registerUser,
} from '../../services/api/authApi';

import {
  loginSuccess,
} from '../../app/store/slices/authSlice';

import {
  saveAuthData,
} from '../../utils/storage';

const RegisterScreen = ({navigation}) => {
  const dispatch = useDispatch();

  const {loading} = useSelector(
    state => state.auth,
  );

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] =
    useState('');

  const handleRegister = async () => {
    if (!name.trim()) {
      Alert.alert('Validation', 'Please enter your name.');
      return;
    }

    if (!phone.trim()) {
      Alert.alert(
        'Validation',
        'Please enter your mobile number.',
      );
      return;
    }

    if (!email.trim()) {
      Alert.alert(
        'Validation',
        'Please enter your email.',
      );
      return;
    }

    if (password.length < 6) {
      Alert.alert(
        'Validation',
        'Password must contain at least 6 characters.',
      );
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert(
        'Validation',
        'Passwords do not match.',
      );
      return;
    }

    try {
      const response = await registerUser({
        name: name.trim(),
        phone: phone.trim(),
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
             phone: "...",
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
          'Invalid registration response.',
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
        'Registration error:',
        error?.response?.data || error,
      );

      const message =
        error?.response?.data?.message ||
        'Unable to create account.';

      Alert.alert(
        'Registration Failed',
        message,
      );
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
        <Text style={styles.title}>
          Create your Ridex account
        </Text>

        <Text style={styles.subtitle}>
          Register as a customer and start booking rides.
        </Text>

        <View style={styles.form}>
          <AppInput
            label="Full Name"
            value={name}
            onChangeText={setName}
            placeholder="Enter your name"
          />

          <AppInput
            label="Mobile Number"
            value={phone}
            onChangeText={setPhone}
            placeholder="Enter mobile number"
            keyboardType="phone-pad"
          />

          <AppInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="Enter email"
            keyboardType="email-address"
          />

          <AppInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder="Create password"
            secureTextEntry
          />

          <AppInput
            label="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Confirm password"
            secureTextEntry
          />

          <AppButton
            title="Create Account"
            onPress={handleRegister}
            loading={loading}
          />

          <View style={styles.loginRow}>
            <Text style={styles.loginLabel}>
              Already have an account?
            </Text>

            <TouchableOpacity
              onPress={() =>
                navigation.navigate('Login')
              }
            >
              <Text style={styles.loginText}>
                Login
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
    padding: 24,
    justifyContent: 'center',
  },

  title: {
    fontSize: 27,
    fontWeight: '800',
    color: colors.text,
  },

  subtitle: {
    marginTop: 8,
    marginBottom: 30,
    fontSize: 14,
    lineHeight: 21,
    color: colors.textSecondary,
  },

  form: {
    width: '100%',
  },

  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 25,
  },

  loginLabel: {
    color: colors.textSecondary,
    fontSize: 14,
  },

  loginText: {
    marginLeft: 5,
    color: colors.customer,
    fontWeight: '700',
    fontSize: 14,
  },
});

export default RegisterScreen;