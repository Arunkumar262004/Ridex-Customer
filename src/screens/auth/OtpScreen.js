import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch } from 'react-redux';
import { MaterialDesignIcons } from '@react-native-vector-icons/material-design-icons';

import colors from '../../constants/colors';
import { sendOtp, verifyOtp } from '../../services/api/authApi';
import { loginSuccess } from '../../app/store/slices/authSlice';
import { saveAuthData } from '../../utils/storage';
import { setAuthToken } from '../../services/api/axios';

const AUTOFILL_DELAY_MS = 2500;
const RESEND_SECONDS = 30;

const OtpScreen = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const { phone, devOtp } = route.params || {};

  const otpLength = devOtp ? String(devOtp).length : 4;
  const [digits, setDigits] = useState(Array(otpLength).fill(''));
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
      if (currentOtp) {
        autofillOtp(String(currentOtp));
      }
    }, AUTOFILL_DELAY_MS);

    return () => clearTimeout(autofillTimer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentOtp]);

  const autofillOtp = otpValue => {
    if (!otpValue || hasAutoSubmitted.current) return;
    const otpDigits = otpValue.split('').slice(0, otpLength);
    setDigits(otpDigits);
    handleVerify(otpDigits.join(''));
  };

  const handleChangeDigit = (text, index) => {
    const value = text.replace(/[^0-9]/g, '');
    const nextDigits = [...digits];
    nextDigits[index] = value.slice(-1);
    setDigits(nextDigits);

    if (value && index < otpLength - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    const joined = nextDigits.join('');
    if (joined.length === otpLength) {
      handleVerify(joined);
    }
  };

  const handleKeyPress = (event, index) => {
    if (event.nativeEvent.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async otpValue => {
    if (hasAutoSubmitted.current || verifying) return;
    hasAutoSubmitted.current = true;

    try {
      setVerifying(true);
      const response = await verifyOtp({ phone, otp: otpValue });
      const { user, token } = response.data || response;

      setAuthToken(token);
      await saveAuthData({ token, user });
      dispatch(loginSuccess({ token, user }));
    } catch (error) {
      hasAutoSubmitted.current = false;
      const message =
        error?.response?.data?.message || 'Invalid OTP. Please try again.';
      Alert.alert('Verification Failed', message);
      setDigits(Array(otpLength).fill(''));
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
      setDigits(Array(otpLength).fill(''));
      setResendSeconds(RESEND_SECONDS);
      hasAutoSubmitted.current = false;
    } catch (error) {
      Alert.alert('Failed', 'Unable to resend OTP. Please try again.');
    } finally {
      setResending(false);
    }
  };

  const handleWhatsAppOtp = () => {
    Alert.alert(
      'WhatsApp OTP',
      `OTP sent via WhatsApp to +91 ${phone}. Test OTP code is ${currentOtp || '1234'}.`,
    );
  };

  const isComplete = digits.join('').length === otpLength;

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Top Header matching Screenshot 5 */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <MaterialDesignIcons name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Verify OTP</Text>

        <TouchableOpacity
          style={styles.helpHeaderBtn}
          onPress={() => Alert.alert('Help', 'Having trouble receiving OTP? Call 1800-123-4567')}
        >
          <MaterialDesignIcons name="help-circle-outline" size={18} color={colors.navy} />
          <Text style={styles.helpHeaderBtnText}>Help</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Title & Subtitle */}
        <Text style={styles.title}>Enter verification code</Text>
        <Text style={styles.subtitle}>
          Sent to <Text style={styles.phoneHighlight}>+91 {phone}</Text>
        </Text>

        {/* OTP Input Boxes Grid */}
        <View style={styles.otpGrid}>
          {digits.map((digit, index) => (
            <TextInput
              key={index}
              ref={ref => (inputRefs.current[index] = ref)}
              style={[
                styles.otpBox,
                digit ? styles.otpBoxFilled : null,
                inputRefs.current[index]?.isFocused() ? styles.otpBoxFocused : null,
              ]}
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
            <ActivityIndicator size="small" color="#0259CD" />
            <Text style={styles.verifyingText}>Verifying code...</Text>
          </View>
        )}

        {!!currentOtp && (
          <View style={styles.devHintBadge}>
            <Text style={styles.devHintText}>Auto-fill Test OTP: {currentOtp}</Text>
          </View>
        )}

        {/* Resend & WhatsApp Action Buttons matching Screenshot 5 */}
        <View style={styles.actionSection}>
          <TouchableOpacity
            style={styles.resendBtn}
            onPress={handleResend}
            disabled={resendSeconds > 0 || resending}
          >
            <MaterialDesignIcons name="message-text-outline" size={20} color={resendSeconds > 0 ? colors.textSecondary : '#0259CD'} />
            <Text style={[styles.resendBtnText, resendSeconds > 0 ? styles.mutedText : styles.activeText]}>
              {resending ? 'Sending...' : resendSeconds > 0 ? `Resend in ${resendSeconds}s` : 'Resend OTP'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.whatsAppBtn} onPress={handleWhatsAppOtp}>
            <MaterialDesignIcons name="whatsapp" size={20} color="#16A34A" />
            <Text style={styles.whatsAppBtnText}>Send via WhatsApp</Text>
          </TouchableOpacity>
        </View>

        {/* WhatsApp Disclaimer Text matching Screenshot 5 */}
        <Text style={styles.disclaimerText}>
          By tapping on "Send via Whatsapp", you agree to receive important communications such as OTP and payment details, over Whatsapp
        </Text>

        {/* Next Button at Bottom */}
        <TouchableOpacity
          style={[
            styles.nextButton,
            isComplete ? styles.nextButtonActive : styles.nextButtonDisabled,
          ]}
          onPress={() => handleVerify(digits.join(''))}
          disabled={!isComplete || verifying}
          activeOpacity={0.85}
        >
          <Text style={styles.nextButtonText}>Next</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderColor: '#F1F5F9',
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
  },
  helpHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  helpHeaderBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.navy,
    marginLeft: 4,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 30,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 28,
  },
  phoneHighlight: {
    fontWeight: '700',
    color: colors.text,
  },
  otpGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  otpBox: {
    flex: 1,
    height: 54,
    marginHorizontal: 4,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    textAlign: 'center',
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
  },
  otpBoxFilled: {
    backgroundColor: '#FFFFFF',
    borderColor: '#0259CD',
  },
  otpBoxFocused: {
    borderColor: '#0259CD',
    backgroundColor: '#EFF6FF',
  },
  verifyingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  verifyingText: {
    marginLeft: 8,
    fontSize: 14,
    color: colors.textSecondary,
  },
  devHintBadge: {
    backgroundColor: '#FEF3C7',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    alignSelf: 'center',
    marginBottom: 20,
  },
  devHintText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#D97706',
  },
  actionSection: {
    marginVertical: 12,
  },
  resendBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  resendBtnText: {
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 10,
  },
  mutedText: {
    color: colors.textSecondary,
  },
  activeText: {
    color: '#0259CD',
  },
  whatsAppBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    borderWidth: 1,
    borderColor: '#86EFAC',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 14,
  },
  whatsAppBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#15803D',
    marginLeft: 10,
  },
  disclaimerText: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 30,
    paddingHorizontal: 10,
  },
  nextButton: {
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 'auto',
  },
  nextButtonActive: {
    backgroundColor: '#0259CD',
    elevation: 3,
    shadowColor: '#0259CD',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  nextButtonDisabled: {
    backgroundColor: '#94A3B8',
  },
  nextButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '800',
  },
});

export default OtpScreen;
