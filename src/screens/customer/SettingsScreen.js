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
import { useDispatch, useSelector } from 'react-redux';
import { MaterialDesignIcons } from '@react-native-vector-icons/material-design-icons';
import colors from '../../constants/colors';
import { logout } from '../../app/store/slices/authSlice';
import { clearAuthData } from '../../utils/storage';
import { setAuthToken } from '../../services/api/axios';
import { deleteAccount } from '../../services/api/userApi';

const SettingsScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);

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

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to permanently delete your account? All your ride history, profile info, and saved data will be erased. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Account',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteAccount();
            } catch (err) {
              console.log('Server delete profile notice:', err?.message || err);
            }
            await clearAuthData();
            setAuthToken(null);
            dispatch(logout());
            Alert.alert('Account Deleted', 'Your account has been deleted successfully.');
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header matching Screenshot 2 */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <MaterialDesignIcons name="arrow-left" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Settings</Text>
        </View>
        <TouchableOpacity style={styles.helpHeaderBtn} onPress={() => navigation.navigate('Help')}>
          <MaterialDesignIcons name="help-circle-outline" size={20} color={colors.navy} />
          <Text style={styles.helpHeaderBtnText}>Help</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* GENERAL Section */}
        <Text style={styles.sectionHeader}>GENERAL</Text>
        <View style={styles.cardGroup}>
          <TouchableOpacity style={styles.row} onPress={() => navigation.navigate('ProfileSetup')}>
            <View style={styles.rowIcon}>
              <MaterialDesignIcons name="account-outline" size={22} color={colors.textSecondary} />
            </View>
            <View style={styles.rowContent}>
              <Text style={styles.rowTitle}>Profile</Text>
              <Text style={styles.rowSubtitle}>+91 {user?.phone || '9578777764'}</Text>
            </View>
            <MaterialDesignIcons name="chevron-right" size={22} color={colors.textSecondary} />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.row} onPress={() => Alert.alert('Favourites', 'Manage your home, work, and favourite locations.')}>
            <View style={styles.rowIcon}>
              <MaterialDesignIcons name="heart-outline" size={22} color={colors.textSecondary} />
            </View>
            <View style={styles.rowContent}>
              <Text style={styles.rowTitle}>Favourites</Text>
              <Text style={styles.rowSubtitle}>Manage favourite locations</Text>
            </View>
            <MaterialDesignIcons name="chevron-right" size={22} color={colors.textSecondary} />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.row} onPress={() => Alert.alert('App Shortcuts', 'Shortcuts created on home launcher.')}>
            <View style={styles.rowIcon}>
              <MaterialDesignIcons name="cellphone-link" size={22} color={colors.textSecondary} />
            </View>
            <View style={styles.rowContent}>
              <Text style={styles.rowTitle}>App shortcuts</Text>
              <Text style={styles.rowSubtitle}>Create shortcuts on home launcher</Text>
            </View>
            <MaterialDesignIcons name="chevron-right" size={22} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* OTHERS Section */}
        <Text style={styles.sectionHeader}>OTHERS</Text>
        <View style={styles.cardGroup}>
          <TouchableOpacity style={styles.row} onPress={() => Alert.alert('Ridex App', 'Version 8.123.0')}>
            <View style={styles.rowIcon}>
              <MaterialDesignIcons name="information-outline" size={22} color={colors.textSecondary} />
            </View>
            <View style={styles.rowContent}>
              <Text style={styles.rowTitle}>About</Text>
              <Text style={styles.rowSubtitle}>8.123.0</Text>
            </View>
            <MaterialDesignIcons name="chevron-right" size={22} color={colors.textSecondary} />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.row} onPress={() => Alert.alert('Beta Program', 'You are subscribed to Ridex beta access.')}>
            <View style={styles.rowIcon}>
              <MaterialDesignIcons name="bug-outline" size={22} color={colors.textSecondary} />
            </View>
            <View style={styles.rowContent}>
              <Text style={styles.rowTitle}>Subscribe to Beta</Text>
              <Text style={styles.rowSubtitle}>Get early access to latest features</Text>
            </View>
            <MaterialDesignIcons name="chevron-right" size={22} color={colors.textSecondary} />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.row} onPress={handleLogout}>
            <View style={styles.rowIcon}>
              <MaterialDesignIcons name="logout-variant" size={22} color={colors.textSecondary} />
            </View>
            <View style={styles.rowContent}>
              <Text style={styles.rowTitle}>Logout</Text>
            </View>
            <MaterialDesignIcons name="chevron-right" size={22} color={colors.textSecondary} />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.row} onPress={handleDeleteAccount}>
            <View style={styles.rowIcon}>
              <MaterialDesignIcons name="delete-outline" size={22} color={colors.danger || '#DC2626'} />
            </View>
            <View style={styles.rowContent}>
              <Text style={[styles.rowTitle, styles.deleteText]}>Delete Account</Text>
            </View>
            <MaterialDesignIcons name="chevron-right" size={22} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1F5F9',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#F1F5F9',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backBtn: {
    padding: 4,
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
  },
  helpHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  helpHeaderBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.navy,
    marginLeft: 6,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 30,
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 10,
    marginTop: 12,
    letterSpacing: 0.5,
  },
  cardGroup: {
    backgroundColor: colors.white,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  rowIcon: {
    marginRight: 14,
  },
  rowContent: {
    flex: 1,
  },
  rowTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  rowSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 3,
  },
  deleteText: {
    color: colors.danger || '#DC2626',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginLeft: 50,
  },
});

export default SettingsScreen;
