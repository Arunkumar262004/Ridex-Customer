import React, {useState} from 'react';

import {
  View,
  Text,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TextInput,
} from 'react-native';

import AppButton from '../../components/common/AppButton';
import SketchBackdrop from '../../components/common/SketchBackdrop';
import colors from '../../constants/colors';

import {sendOtp} from '../../services/api/authApi';

const MobileNumberScreen = ({navigation}) => {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const isValidPhone = phone.length === 10;

  const handleContinue = async () => {
    if (!isValidPhone) {
      Alert.alert('Validation', 'Please enter a valid 10-digit mobile number.');
      return;
    }

    try {
      setLoading(true);

      const response = await sendOtp(phone);
      const otp = (response.data || response).otp;

      navigation.navigate('Otp', {phone, devOtp: otp});
    } catch (error) {
      const message =
        error?.response?.data?.message || 'Unable to send OTP. Please try again.';

      Alert.alert('Failed', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <SketchBackdrop />

      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Text style={styles.logo}>RIDEX</Text>
          <Text style={styles.tagline}>Your ride. Your way.</Text>
        </View>

        <Text style={styles.heading}>Enter your mobile number</Text>
        <Text style={styles.description}>
          We'll send you a one-time password to verify it's you.
        </Text>

        <View style={styles.inputRow}>
          <View style={styles.codeBox}>
            <Text style={styles.codeText}>+91</Text>
          </View>

          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={text => setPhone(text.replace(/[^0-9]/g, '').slice(0, 10))}
            placeholder="Mobile number"
            placeholderTextColor={colors.textSecondary}
            keyboardType="number-pad"
            maxLength={10}
            autoFocus
          />
        </View>

        <AppButton
          title="Continue"
          onPress={handleContinue}
          loading={loading}
          disabled={!isValidPhone}
        />
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },

  logoContainer: {
    alignItems: 'center',
    marginBottom: 60,
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

  heading: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
  },

  description: {
    marginTop: 6,
    marginBottom: 28,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textSecondary,
  },

  inputRow: {
    flexDirection: 'row',
    marginBottom: 28,
  },

  codeBox: {
    width: 60,
    height: 52,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.input,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },

  codeText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },

  input: {
    flex: 1,
    height: 52,
    backgroundColor: colors.input,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
});

export default MobileNumberScreen;
