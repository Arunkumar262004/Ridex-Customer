import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
} from 'react-native';
import colors from '../../constants/colors';

const RECENT_PLACES = [
  { id: '1', title: '252', address: 'Mettupalayam Main Rd, Saibaba Koil, Coimbatore' },
  { id: '2', title: 'Tachil Centre', address: 'No. 10, Raja Annamalai Rd, Opposite City Union Bank' },
  { id: '3', title: '21/22', address: 'Jawahar Nagar, Saibaba Colony, Coimbatore, Tamil Nadu' },
  { id: '4', title: '2010', address: 'Mettupalayam Main Rd, Kuppakonam Pudur, Coimbatore' },
];

const DropLocationScreen = ({ navigation, route }) => {
  const { pickup, serviceType } = route.params || {};

  const [destinationText, setDestinationText] = useState('');

  const proceedWithDestination = address => {
    navigation.navigate('VehicleSelection', {
      pickup,
      destination: {
        address,
        latitude: pickup.latitude + 0.02,
        longitude: pickup.longitude + 0.02,
      },
      serviceType,
    });
  };

  const handleSubmitDestination = () => {
    if (!destinationText.trim()) {
      return;
    }

    proceedWithDestination(destinationText.trim());
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Drop</Text>
        <View style={styles.forMePill}>
          <Text style={styles.forMeText}>For me ⌄</Text>
        </View>
      </View>

      <View style={styles.locationCard}>
        <View style={styles.locationRow}>
          <View style={[styles.dot, styles.greenDot]} />
          <Text style={styles.locationText} numberOfLines={1}>
            {pickup?.address || 'Current Location'}
          </Text>
        </View>

        <View style={styles.dashedLine} />

        <View style={styles.locationRow}>
          <View style={[styles.dot, styles.redDot]} />
          <TextInput
            style={styles.destinationInput}
            value={destinationText}
            onChangeText={setDestinationText}
            placeholder="Drop location"
            placeholderTextColor={colors.textSecondary}
            autoFocus
            returnKeyType="search"
            onSubmitEditing={handleSubmitDestination}
          />
        </View>
      </View>

      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.actionPill}>
          <Text style={styles.actionText}>📍 Select on map</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionPill}>
          <Text style={styles.actionText}>◆ Add stops</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={RECENT_PLACES}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.recentRow}
            onPress={() => proceedWithDestination(`${item.title}, ${item.address}`)}
          >
            <Text style={styles.historyIcon}>↻</Text>
            <View style={styles.recentTextBox}>
              <Text style={styles.recentTitle}>{item.title}</Text>
              <Text style={styles.recentAddress} numberOfLines={1}>
                {item.address}
              </Text>
            </View>
            <Text style={styles.heartIcon}>♡</Text>
          </TouchableOpacity>
        )}
      />
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
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
  },
  forMePill: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  forMeText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
  locationCard: {
    marginHorizontal: 20,
    backgroundColor: colors.input,
    borderRadius: 14,
    padding: 16,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 12,
  },
  greenDot: {
    backgroundColor: colors.success,
  },
  redDot: {
    backgroundColor: colors.danger,
  },
  locationText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  destinationInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    paddingVertical: 4,
  },
  dashedLine: {
    height: 14,
    marginLeft: 4,
    borderLeftWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.borderStrong,
  },
  actionRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginTop: 16,
    marginBottom: 6,
  },
  actionPill: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 12,
  },
  actionText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
  list: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  recentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  historyIcon: {
    fontSize: 16,
    color: colors.textSecondary,
    marginRight: 14,
  },
  recentTextBox: {
    flex: 1,
  },
  recentTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  recentAddress: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  heartIcon: {
    fontSize: 18,
    color: colors.borderStrong,
    marginLeft: 10,
  },
});

export default DropLocationScreen;
