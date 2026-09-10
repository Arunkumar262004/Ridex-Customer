import React, {useState} from 'react';

import {
  View,
  Text,
  StyleSheet,
  Alert,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';

import {useDispatch, useSelector} from 'react-redux';

import AppButton from '../../components/common/AppButton';
import colors from '../../constants/colors';

import {completeProfile} from '../../services/api/authApi';
import {loginSuccess} from '../../app/store/slices/authSlice';
import {saveAuthData} from '../../utils/storage';

const GENDERS = ['MALE', 'FEMALE', 'OTHER'];
const GENDER_LABELS = {MALE: 'Male', FEMALE: 'Female', OTHER: 'Other'};

const ProfileSetupScreen = ({navigation}) => {
  const dispatch = useDispatch();
  const token = useSelector(state => state.auth.token);

  const [name, setName] = useState('');
  const [gender, setGender] = useState(null);
  const [whatsappOptIn, setWhatsappOptIn] = useState(false);
  const [hasReferral, setHasReferral] = useState(false);
  const [referralCode, setReferralCode] = useState('');
  const [saving, setSaving] = useState(false);

  const canContinue = name.trim().length > 0;

  const handleNext = async () => {
    if (!canContinue) {
      return;
    }

    try {
      setSaving(true);

      const response = await completeProfile({
        name: name.trim(),
        gender,
        whatsappOptIn,
        referralCode: hasReferral ? referralCode.trim() : '',
      });

      const {user} = response.data || response;

      await saveAuthData({token, user});
      dispatch(loginSuccess({token, user}));
      navigation.replace('MainTabs');
    } catch (error) {
      const message =
        error?.response?.data?.message || 'Unable to save your details. Please try again.';

      Alert.alert('Failed', message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.heading}>One last step</Text>

        <Text style={styles.label}>Your name</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Type your name"
          placeholderTextColor={colors.textSecondary}
          autoFocus
        />

        <Text style={styles.label}>Gender</Text>
        <View style={styles.genderRow}>
          {GENDERS.map(option => (
            <TouchableOpacity
              key={option}
              style={[styles.genderPill, gender === option && styles.genderPillActive]}
              onPress={() => setGender(option)}
            >
              <Text
                style={[
                  styles.genderText,
                  gender === option && styles.genderTextActive,
                ]}
              >
                {GENDER_LABELS[option]}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.divider} />

        <TouchableOpacity
          style={styles.optionRow}
          onPress={() => setWhatsappOptIn(prev => !prev)}
          activeOpacity={0.7}
        >
          <Text style={styles.optionEmoji}>💬</Text>
          <Text style={styles.optionText}>Receive updates on Whatsapp</Text>
          <View style={[styles.checkbox, whatsappOptIn && styles.checkboxChecked]}>
            {whatsappOptIn && <Text style={styles.checkboxTick}>✓</Text>}
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.optionRow}
          onPress={() => setHasReferral(prev => !prev)}
          activeOpacity={0.7}
        >
          <Text style={styles.optionEmoji}>🎁</Text>
          <Text style={styles.optionText}>Have a referral code?</Text>
          <View style={[styles.checkbox, hasReferral && styles.checkboxChecked]}>
            {hasReferral && <Text style={styles.checkboxTick}>✓</Text>}
          </View>
        </TouchableOpacity>

        {hasReferral && (
          <TextInput
            style={styles.referralInput}
            value={referralCode}
            onChangeText={setReferralCode}
            placeholder="Enter referral code"
            placeholderTextColor={colors.textSecondary}
            autoCapitalize="characters"
          />
        )}
      </ScrollView>

      <View style={styles.footer}>
        <AppButton
          title="Next"
          onPress={handleNext}
          loading={saving}
          disabled={!canContinue}
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
    padding: 24,
    paddingTop: 60,
  },

  heading: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 30,
  },

  label: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 10,
  },

  input: {
    height: 52,
    backgroundColor: colors.input,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 15,
    fontSize: 16,
    color: colors.text,
    marginBottom: 26,
  },

  genderRow: {
    flexDirection: 'row',
    marginBottom: 26,
  },

  genderPill: {
    paddingVertical: 10,
    paddingHorizontal: 22,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 12,
  },

  genderPillActive: {
    backgroundColor: colors.navy,
    borderColor: colors.navy,
  },

  genderText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },

  genderTextActive: {
    color: colors.white,
  },

  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginBottom: 20,
  },

  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },

  optionEmoji: {
    fontSize: 20,
    marginRight: 14,
  },

  optionText: {
    flex: 1,
    fontSize: 15,
    color: colors.text,
  },

  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: colors.borderStrong,
    justifyContent: 'center',
    alignItems: 'center',
  },

  checkboxChecked: {
    backgroundColor: colors.navy,
    borderColor: colors.navy,
  },

  checkboxTick: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '800',
  },

  referralInput: {
    height: 48,
    backgroundColor: colors.input,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 15,
    fontSize: 15,
    color: colors.text,
    marginTop: 6,
    marginBottom: 10,
  },

  footer: {
    padding: 24,
    paddingBottom: 30,
  },
});

export default ProfileSetupScreen;
