import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import colors from '../../constants/colors';

const WalletScreen = ({ navigation }) => {
  const user = useSelector(state => state.auth.user);
  const balance = user?.walletBalance ?? 0;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Wallet</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Ridex Wallet Balance</Text>
        <Text style={styles.balanceValue}>₹{balance}</Text>

        <TouchableOpacity
          style={styles.addMoneyButton}
          onPress={() => Alert.alert('Add Money', 'Adding money to your wallet is coming soon.')}
        >
          <Text style={styles.addMoneyText}>+ Add Money</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Recent Transactions</Text>

      <View style={styles.emptyState}>
        <Text style={styles.emptyEmoji}>🧾</Text>
        <Text style={styles.emptyText}>No transactions yet</Text>
        <Text style={styles.emptySubtext}>
          Your ride payments and refunds will show up here.
        </Text>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  backIcon: {
    fontSize: 22,
    color: colors.text,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
  },
  headerSpacer: {
    width: 22,
  },
  balanceCard: {
    marginHorizontal: 20,
    backgroundColor: colors.primary,
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
  },
  balanceLabel: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '600',
    opacity: 0.9,
  },
  balanceValue: {
    color: colors.white,
    fontSize: 36,
    fontWeight: '900',
    marginTop: 8,
    marginBottom: 20,
  },
  addMoneyButton: {
    alignSelf: 'flex-start',
    backgroundColor: colors.white,
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  addMoneyText: {
    color: colors.primary,
    fontWeight: '800',
    fontSize: 14,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.text,
    marginHorizontal: 20,
    marginBottom: 12,
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 40,
    paddingHorizontal: 40,
  },
  emptyEmoji: {
    fontSize: 40,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  emptySubtext: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 6,
  },
});

export default WalletScreen;
