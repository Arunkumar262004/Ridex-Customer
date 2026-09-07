import React from 'react';
import { Text, StyleSheet, SafeAreaView } from 'react-native';
import colors from '../../constants/colors';

const AllServicesScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.emoji}>🧭</Text>
      <Text style={styles.title}>All Services</Text>
      <Text style={styles.subtitle}>More Ridex services are coming soon.</Text>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: 24,
  },
  emoji: {
    fontSize: 40,
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 6,
    textAlign: 'center',
  },
});

export default AllServicesScreen;
