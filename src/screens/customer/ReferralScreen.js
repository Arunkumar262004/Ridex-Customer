import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { MaterialDesignIcons } from '@react-native-vector-icons/material-design-icons';
import colors from '../../constants/colors';

const ReferralScreen = ({ navigation }) => {
  const user = useSelector(state => state.auth.user);
  const referralCode = user?.referralCode || `RIDEX${user?.phone ? user.phone.slice(-4) : '9578'}`;

  const handleShare = () => {
    Alert.alert(
      'Referral Shared!',
      `Use my code ${referralCode} to sign up on Ridex & get ₹50 off your first ride!`,
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <MaterialDesignIcons name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Refer and Earn</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.heroCard}>
          <View style={styles.giftCircle}>
            <MaterialDesignIcons name="gift-outline" size={48} color={colors.primary} />
          </View>
          <Text style={styles.heroTitle}>Get ₹50 Per Friend</Text>
          <Text style={styles.heroSubtitle}>
            Invite your friends to Ridex. When they complete their first ride, both of you earn ₹50 in your Ridex wallet!
          </Text>
        </View>

        <View style={styles.codeCard}>
          <Text style={styles.codeLabel}>YOUR REFERRAL CODE</Text>
          <View style={styles.codeBox}>
            <Text style={styles.codeText}>{referralCode}</Text>
            <TouchableOpacity onPress={handleShare}>
              <MaterialDesignIcons name="content-copy" size={22} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity style={styles.shareBtn} onPress={handleShare} activeOpacity={0.85}>
          <MaterialDesignIcons name="share-variant" size={20} color={colors.white} />
          <Text style={styles.shareBtnText}>Invite Friends & Earn ₹50</Text>
        </TouchableOpacity>

        <Text style={styles.howTitle}>How It Works</Text>
        <View style={styles.stepRow}>
          <Text style={styles.stepNum}>1</Text>
          <Text style={styles.stepText}>Share your referral code with your friends.</Text>
        </View>
        <View style={styles.stepRow}>
          <Text style={styles.stepNum}>2</Text>
          <Text style={styles.stepText}>Your friend downloads Ridex and signs up using your code.</Text>
        </View>
        <View style={styles.stepRow}>
          <Text style={styles.stepNum}>3</Text>
          <Text style={styles.stepText}>When they complete their 1st ride, ₹50 is added to your wallet!</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  content: {
    padding: 20,
    alignItems: 'center',
  },
  heroCard: {
    alignItems: 'center',
    marginBottom: 24,
  },
  giftCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 10,
  },
  codeCard: {
    width: '100%',
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    marginBottom: 20,
  },
  codeLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
    letterSpacing: 1,
    marginBottom: 8,
  },
  codeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 12,
    width: '100%',
  },
  codeText: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.navy,
    letterSpacing: 2,
  },
  shareBtn: {
    flexDirection: 'row',
    width: '100%',
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 28,
  },
  shareBtnText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 10,
  },
  howTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    alignSelf: 'flex-start',
    marginBottom: 14,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  stepNum: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.navy,
    color: colors.white,
    textAlign: 'center',
    lineHeight: 28,
    fontWeight: '700',
    fontSize: 13,
    marginRight: 12,
  },
  stepText: {
    fontSize: 13,
    color: colors.textSecondary,
    flex: 1,
  },
});

export default ReferralScreen;
