import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialDesignIcons } from '@react-native-vector-icons/material-design-icons';
import colors from '../../constants/colors';
import { sendOtp } from '../../services/api/authApi';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const MobileNumberScreen = ({ navigation }) => {
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

      navigation.navigate('Otp', { phone, devOtp: otp });
    } catch (error) {
      const message =
        error?.response?.data?.message || 'Unable to send OTP. Please try again.';
      Alert.alert('Failed', message);
    } finally {
      setLoading(false);
    }
  };

  const handleHelp = () => {
    Alert.alert('Need Help?', 'Contact Ridex Support helpline at 1800-123-4567 for login assistance.');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} bounces={false}>
          {/* Top Banner Section with Padding to show full logo and bike */}
          <View style={styles.fullWidthBannerContainer}>
            {/* Floating Help Button */}
            <TouchableOpacity style={styles.floatingHelpBtn} onPress={handleHelp}>
              <MaterialDesignIcons name="help-circle-outline" size={18} color={colors.white} />
              <Text style={styles.floatingHelpText}>Help</Text>
            </TouchableOpacity>

            <Image
              source={require('../../assets/login-card/login-card.png')}
              style={styles.edgeToEdgeBanner}
              resizeMode="cover"
            />
          </View>

          {/* White Bottom Sheet Card */}
          <View style={styles.bottomSheetCard}>
            <Text style={styles.sheetTitle}>What's your number?</Text>

            {/* Mobile Input Container */}
            <View style={styles.inputContainer}>
              <Text style={styles.countryCodeText}>+91</Text>
              <View style={styles.verticalDivider} />
              <TextInput
                style={styles.mobileInput}
                value={phone}
                onChangeText={text => setPhone(text.replace(/[^0-9]/g, '').slice(0, 10))}
                placeholder="0000000000"
                placeholderTextColor="#94A3B8"
                keyboardType="number-pad"
                maxLength={10}
                autoFocus
              />
            </View>

            {/* Terms and Privacy Policy note */}
            <Text style={styles.termsText}>
              By continuing, you agree to the{' '}
              <Text style={styles.termsLink} onPress={() => Alert.alert('Terms & Conditions', 'Ridex Terms of Service.')}>
                T&C
              </Text>{' '}
              and{' '}
              <Text style={styles.termsLink} onPress={() => Alert.alert('Privacy Policy', 'Ridex Privacy Policy.')}>
                Privacy Policy
              </Text>
            </Text>

            {/* Action Button */}
            <TouchableOpacity
              style={[
                styles.nextButton,
                isValidPhone ? styles.nextButtonActive : styles.nextButtonDisabled,
              ]}
              onPress={handleContinue}
              disabled={!isValidPhone || loading}
              activeOpacity={0.85}
            >
              <Text style={styles.nextButtonText}>
                {loading ? 'Sending OTP...' : 'Next'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#06489F',
  },
  container: {
    flex: 1,
    backgroundColor: '#06489F',
  },
  scrollContent: {
    flexGrow: 1,
  },
  fullWidthBannerContainer: {
    width: SCREEN_WIDTH,
    height: 220,
    position: 'relative',
    backgroundColor: '#06489F',
    paddingHorizontal: 0,
    paddingTop: 0,
    marginHorizontal: 0,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  floatingHelpBtn: {
    position: 'absolute',
    top: 14,
    right: 16,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  floatingHelpText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.white,
    marginLeft: 6,
  },
  edgeToEdgeBanner: {
    width: '100%',
    height: '100%',
    resizeMode: 'stretch',
  },
  bottomSheetCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 30,
    justifyContent: 'space-between',
    marginTop: -8,
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderRadius: 14,
    paddingHorizontal: 16,
    height: 56,
    marginBottom: 20,
  },
  countryCodeText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginRight: 12,
  },
  verticalDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#CBD5E1',
    marginRight: 12,
  },
  mobileInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: 1,
  },
  termsText: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 24,
  },
  termsLink: {
    color: '#06489F',
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  nextButton: {
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 'auto',
  },
  nextButtonActive: {
    backgroundColor: '#06489F',
    elevation: 3,
    shadowColor: '#06489F',
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

export default MobileNumberScreen;
