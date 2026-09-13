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
import { MaterialDesignIcons } from '@react-native-vector-icons/material-design-icons';
import colors from '../../constants/colors';

const SAFETY_TIPS = [
  {
    id: '1',
    icon: 'numeric-1-circle',
    title: 'Verify Driver & Vehicle OTP',
    description: 'Check the vehicle number plate, driver photo, and give your 4-digit PIN before starting the ride.',
  },
  {
    id: '2',
    icon: 'share-variant',
    title: 'Share Live Trip Status',
    description: 'Share your real-time trip route and location with trusted family members or friends.',
  },
  {
    id: '3',
    icon: 'phone-in-talk',
    title: '24/7 Safety Helpline',
    description: 'Connect immediately with our dedicated 24x7 emergency response safety center.',
  },
  {
    id: '4',
    icon: 'face-agent',
    title: 'Helmet & Seatbelt Safety',
    description: 'Always wear a helmet during bike rides and fasten seatbelts during cab/auto rides.',
  },
];

const SafetyScreen = ({ navigation }) => {
  const handleEmergencySOS = () => {
    Alert.alert(
      'Emergency SOS Alert',
      'This will alert emergency contacts and Ridex 24/7 Safety Response Team. Do you wish to proceed?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Call Emergency SOS',
          style: 'destructive',
          onPress: () => Alert.alert('SOS Sent', 'Safety response team has been alerted to your current location.'),
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <MaterialDesignIcons name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Safety Center</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Top Banner Card */}
        <View style={styles.bannerCard}>
          <View style={styles.bannerIconBox}>
            <MaterialDesignIcons name="shield-check" size={32} color={colors.white} />
          </View>
          <View style={styles.bannerContent}>
            <Text style={styles.bannerTitle}>Your Safety is Our Top Priority</Text>
            <Text style={styles.bannerSubtitle}>
              Every Ridex ride is tracked with live GPS, 24x7 emergency assistance, and verified partners.
            </Text>
          </View>
        </View>

        {/* Emergency SOS Button */}
        <TouchableOpacity style={styles.sosButton} onPress={handleEmergencySOS} activeOpacity={0.85}>
          <MaterialDesignIcons name="alert-decagram" size={26} color={colors.white} />
          <Text style={styles.sosButtonText}>Emergency SOS Call</Text>
        </TouchableOpacity>

        {/* Safety Instructions Section */}
        <Text style={styles.sectionTitle}>Ride Safety Guidelines & Instructions</Text>

        {SAFETY_TIPS.map(tip => (
          <View key={tip.id} style={styles.tipCard}>
            <View style={styles.tipIconBox}>
              <MaterialDesignIcons name={tip.icon} size={24} color={colors.primary} />
            </View>
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>{tip.title}</Text>
              <Text style={styles.tipDescription}>{tip.description}</Text>
            </View>
          </View>
        ))}

        {/* Support Card */}
        <View style={styles.supportCard}>
          <MaterialDesignIcons name="headphones-settings" size={28} color={colors.navy} />
          <View style={styles.supportContent}>
            <Text style={styles.supportTitle}>Need Safety Help?</Text>
            <Text style={styles.supportDesc}>Contact support anytime if you feel uncomfortable during a ride.</Text>
          </View>
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
    padding: 16,
  },
  bannerCard: {
    flexDirection: 'row',
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    marginBottom: 16,
  },
  bannerIconBox: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#16A34A',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  bannerContent: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.white,
    marginBottom: 4,
  },
  bannerSubtitle: {
    fontSize: 12,
    color: '#94A3B8',
    lineHeight: 17,
  },
  sosButton: {
    flexDirection: 'row',
    backgroundColor: '#DC2626',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    elevation: 3,
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  sosButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 14,
  },
  tipCard: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  tipIconBox: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  tipDescription: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  supportCard: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  supportContent: {
    flex: 1,
    marginLeft: 14,
  },
  supportTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  supportDesc: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
});

export default SafetyScreen;
