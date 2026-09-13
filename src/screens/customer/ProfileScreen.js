import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { MaterialDesignIcons } from '@react-native-vector-icons/material-design-icons';
import colors from '../../constants/colors';

const MENU_OPTIONS = [
  { id: 'help', label: 'Help', icon: 'help-circle-outline', route: 'Help' },
  { id: 'payment', label: 'Payment', icon: 'credit-card-outline', route: 'Wallet' },
  { id: 'my_rides', label: 'My Rides', icon: 'history', route: 'RideHistory' },
  { id: 'safety', label: 'Safety', icon: 'shield-check-outline', route: 'Safety' },
  { id: 'refer', label: 'Refer and Earn', subtitle: 'Get ₹50', icon: 'gift-outline', route: 'Referral' },
  { id: 'notifications', label: 'Notifications', icon: 'bell-outline', route: 'Notifications' },
  { id: 'settings', label: 'Settings', icon: 'cog-outline', route: 'Settings' },
];

const ProfileScreen = ({ navigation }) => {
  const user = useSelector(state => state.auth.user);

  const userName = user?.name || 'arun kumar';
  const userPhone = user?.phone || '9578777764';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Title */}
        <Text style={styles.title}>Profile</Text>

        {/* User Info & Rating Card (matching Screenshot 1) */}
        <View style={styles.userCard}>
          <TouchableOpacity
            style={styles.userInfoRow}
            onPress={() => navigation.navigate('Settings')}
            activeOpacity={0.7}
          >
            <View style={styles.avatarCircle}>
              <MaterialDesignIcons name="account" size={32} color={colors.textSecondary} />
            </View>
            <View style={styles.userDetails}>
              <Text style={styles.userName}>{userName}</Text>
              <Text style={styles.userPhone}>{userPhone}</Text>
            </View>
            <MaterialDesignIcons name="chevron-right" size={24} color={colors.text} />
          </TouchableOpacity>

          <View style={styles.userCardDivider} />

          <TouchableOpacity
            style={styles.ratingRow}
            onPress={() => navigation.navigate('RideHistory')}
            activeOpacity={0.7}
          >
            <MaterialDesignIcons name="star" size={22} color="#EAB308" />
            <Text style={styles.ratingText}>4.46 My Rating</Text>
            <MaterialDesignIcons name="chevron-right" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* Profile Options List (matching Screenshot 1 & prompt) */}
        <View style={styles.menuList}>
          {MENU_OPTIONS.map((item, index) => (
            <React.Fragment key={item.id}>
              <TouchableOpacity
                style={styles.menuItemRow}
                onPress={() => navigation.navigate(item.route)}
                activeOpacity={0.7}
              >
                <View style={styles.menuIconBox}>
                  <MaterialDesignIcons name={item.icon} size={22} color={colors.textSecondary} />
                </View>
                <View style={styles.menuLabelContainer}>
                  <Text style={styles.menuLabelText}>{item.label}</Text>
                  {item.subtitle && <Text style={styles.menuSubtitleText}>{item.subtitle}</Text>}
                </View>
                <MaterialDesignIcons name="chevron-right" size={22} color={colors.textSecondary} />
              </TouchableOpacity>
              {index < MENU_OPTIONS.length - 1 && <View style={styles.menuItemDivider} />}
            </React.Fragment>
          ))}
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
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 20,
  },
  userCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  userInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  userPhone: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  userCardDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 10,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  ratingText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    marginLeft: 10,
  },
  menuList: {
    backgroundColor: colors.white,
    borderRadius: 16,
    paddingVertical: 4,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  menuItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  menuIconBox: {
    width: 32,
    alignItems: 'center',
    marginRight: 12,
  },
  menuLabelContainer: {
    flex: 1,
  },
  menuLabelText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  menuSubtitleText: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  menuItemDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginLeft: 60,
  },
});

export default ProfileScreen;
