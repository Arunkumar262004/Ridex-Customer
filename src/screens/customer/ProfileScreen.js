import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import colors from '../../constants/colors';
import { logout } from '../../app/store/slices/authSlice';
import { clearAuthData } from '../../utils/storage';
import { setAuthToken } from '../../services/api/axios';

const MENU_ITEMS = [
  { id: 'wallet', label: 'Wallet', emoji: '👛', route: 'Wallet' },
  { id: 'history', label: 'Ride History', emoji: '🕑', route: 'RideHistory' },
];

const ProfileScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);

  const initial = user?.name ? user.name.charAt(0).toUpperCase() : '?';

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await clearAuthData();
          setAuthToken(null);
          dispatch(logout());
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initial}</Text>
        </View>
        <Text style={styles.name}>{user?.name || 'Ridex User'}</Text>
        <Text style={styles.phone}>+91 {user?.phone}</Text>
      </View>

      <View style={styles.menu}>
        {MENU_ITEMS.map(item => (
          <TouchableOpacity
            key={item.id}
            style={styles.menuRow}
            onPress={() => navigation.navigate(item.route)}
          >
            <Text style={styles.menuEmoji}>{item.emoji}</Text>
            <Text style={styles.menuLabel}>{item.label}</Text>
            <Text style={styles.menuChevron}>›</Text>
          </TouchableOpacity>
        ))}

        <TouchableOpacity style={styles.menuRow} onPress={handleLogout}>
          <Text style={styles.menuEmoji}>🚪</Text>
          <Text style={[styles.menuLabel, styles.logoutLabel]}>Logout</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 30,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: {
    color: colors.white,
    fontSize: 28,
    fontWeight: '800',
  },
  name: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
  },
  phone: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  menu: {
    marginTop: 16,
    backgroundColor: colors.white,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  menuEmoji: {
    fontSize: 20,
    marginRight: 16,
  },
  menuLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  menuChevron: {
    fontSize: 20,
    color: colors.textSecondary,
  },
  logoutLabel: {
    color: colors.danger,
  },
});

export default ProfileScreen;
