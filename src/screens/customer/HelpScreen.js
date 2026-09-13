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

const HELP_TOPICS = [
  { id: '1', title: 'Ride Issues & Refunds', icon: 'car-wash' },
  { id: '2', title: 'Payment & Wallet Help', icon: 'wallet-outline' },
  { id: '3', title: 'Account & App Settings', icon: 'account-cog-outline' },
  { id: '4', title: 'Safety Concerns', icon: 'shield-alert-outline' },
  { id: '5', title: 'Offers & Coupons', icon: 'ticket-percent-outline' },
];

const HelpScreen = ({ navigation }) => {
  const handleTopicPress = title => {
    Alert.alert('Help & Support', `Selected category: ${title}. Our support representative is available 24/7 to assist you.`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <MaterialDesignIcons name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help & Support</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.searchCard}>
          <MaterialDesignIcons name="magnify" size={20} color={colors.textSecondary} />
          <Text style={styles.searchPlaceholder}>How can we help you today?</Text>
        </View>

        <Text style={styles.sectionTitle}>Browse Help Topics</Text>

        {HELP_TOPICS.map(item => (
          <TouchableOpacity
            key={item.id}
            style={styles.topicRow}
            onPress={() => handleTopicPress(item.title)}
          >
            <View style={styles.topicIconBox}>
              <MaterialDesignIcons name={item.icon} size={22} color={colors.primary} />
            </View>
            <Text style={styles.topicLabel}>{item.title}</Text>
            <MaterialDesignIcons name="chevron-right" size={22} color={colors.textSecondary} />
          </TouchableOpacity>
        ))}

        <TouchableOpacity
          style={styles.contactBtn}
          onPress={() => Alert.alert('Contact Support', 'Calling Ridex 24x7 Support Helpline: 1800-123-4567')}
        >
          <MaterialDesignIcons name="phone" size={20} color={colors.white} />
          <Text style={styles.contactBtnText}>Call Customer Support</Text>
        </TouchableOpacity>
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
  searchCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 20,
  },
  searchPlaceholder: {
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  topicRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  topicIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  topicLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  contactBtn: {
    flexDirection: 'row',
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  contactBtnText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '700',
    marginLeft: 8,
  },
});

export default HelpScreen;
