import React, {useEffect, useRef, useState} from 'react';

import {
  View,
  Text,
  StyleSheet,
  Alert,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';

import {useDispatch} from 'react-redux';

import colors from '../../constants/colors';

import {sendOtp, verifyOtp} from '../../services/api/authApi';
import {loginSuccess} from '../../app/store/slices/authSlice';
import {saveAuthData} from '../../utils/storage';
import {setAuthToken} from '../../services/api/axios';

const OTP_LENGTH = 4;
const AUTOFILL_DELAY_MS = 3500;
const RESEND_SECONDS = 30;

const OtpScreen = ({navigation, route}) => {
  const dispatch = useDispatch();

  const {phone, devOtp} = route.params || {};

  const [digits, setDigits] = useState(Array(OTP_LENGTH).fill(''));
  const [verifying, setVerifying] = useState(false);
  const [resendSeconds, setResendSeconds] = useState(RESEND_SECONDS);
  const [resending, setResending] = useState(false);
  const [currentOtp, setCurrentOtp] = useState(devOtp);

  const inputRefs = useRef([]);
  const hasAutoSubmitted = useRef(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setResendSeconds(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    hasAutoSubmitted.current = false;

    const autofillTimer = setTimeout(() => {
      autofillOtp(currentOtp);
    }, AUTOFILL_DELAY_MS);

    return () => clearTimeout(autofillTimer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentOtp]);

  const autofillOtp = otpValue => {
    if (!otpValue || hasAutoSubmitted.current) {
      return;
    }

    const otpDigits = otpValue.split('').slice(0, OTP_LENGTH);
    setDigits(otpDigits);
    handleVerify(otpDigits.join(''));
  };

  const handleChangeDigit = (text, index) => {
    const value = text.replace(/[^0-9]/g, '');

    const nextDigits = [...digits];
    nextDigits[index] = value.slice(-1);
    setDigits(nextDigits);

    if (value && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    const joined = nextDigits.join('');
    if (joined.length === OTP_LENGTH) {
      handleVerify(joined);
    }
  };

  const handleKeyPress = (event, index) => {
    if (event.nativeEvent.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async otpValue => {
    if (hasAutoSubmitted.current || verifying) {
      return;
    }

    hasAutoSubmitted.current = true;

    try {
      setVerifying(true);

      const response = await verifyOtp({phone, otp: otpValue});
      const {user, token} = response.data || response;

      setAuthToken(token);
      await saveAuthData({token, user});
      dispatch(loginSuccess({token, user}));
    } catch (error) {
      hasAutoSubmitted.current = false;

      const message =
        error?.response?.data?.message || 'Invalid OTP. Please try again.';

      Alert.alert('Verification Failed', message);
      setDigits(Array(OTP_LENGTH).fill(''));
      inputRefs.current[0]?.focus();
    } finally {
      setVerifying(false);
    }
  };

  const handleResend = async () => {
    try {
      setResending(true);

      const response = await sendOtp(phone);
      const otp = (response.data || response).otp;

      setCurrentOtp(otp);
      setDigits(Array(OTP_LENGTH).fill(''));
      setResendSeconds(RESEND_SECONDS);
      hasAutoSubmitted.current = false;
    } catch (error) {
      Alert.alert('Failed', 'Unable to resend OTP. Please try again.');
    } finally {
      setResending(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Verify your number</Text>

      <Text style={styles.description}>
        Enter the 4-digit code sent to{' '}
        <Text style={styles.phoneText}>+91 {phone}</Text>
      </Text>

      <View style={styles.otpRow}>
        {digits.map((digit, index) => (
          <TextInput
            key={index}
            ref={ref => (inputRefs.current[index] = ref)}
            style={[styles.otpBox, digit && styles.otpBoxFilled]}
            value={digit}
            onChangeText={text => handleChangeDigit(text, index)}
            onKeyPress={event => handleKeyPress(event, index)}
            keyboardType="number-pad"
            maxLength={1}
            editable={!verifying}
          />
        ))}
      </View>

      {verifying && (
        <View style={styles.verifyingRow}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={styles.verifyingText}>Verifying...</Text>
        </View>
      )}

      {!!currentOtp && (
        <Text style={styles.devHint}>Test OTP: {currentOtp}</Text>
      )}

      <View style={styles.resendRow}>
        {resendSeconds > 0 ? (
          <Text style={styles.resendMuted}>Resend OTP in {resendSeconds}s</Text>
        ) : (
          <TouchableOpacity onPress={handleResend} disabled={resending}>
            <Text style={styles.resendActive}>
              {resending ? 'Sending...' : 'Resend OTP'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
    padding: 24,
    paddingTop: 80,
  },

  heading: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
  },

  description: {
    marginTop: 8,
    marginBottom: 32,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textSecondary,
  },

  phoneText: {
    fontWeight: '700',
    color: colors.text,
  },

  otpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },

  otpBox: {
    width: 60,
    height: 60,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: colors.input,
    textAlign: 'center',
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
  },

  otpBoxFilled: {
    borderColor: colors.primary,
    backgroundColor: colors.surface,
  },

  verifyingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },

  verifyingText: {
    marginLeft: 8,
    fontSize: 13,
    color: colors.textSecondary,
  },

  devHint: {
    textAlign: 'center',
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 20,
  },

  resendRow: {
    alignItems: 'center',
  },

  resendMuted: {
    fontSize: 14,
    color: colors.textSecondary,
  },

  resendActive: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
});

export default OtpScreen;
