import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import colors from '../../constants/colors';
import { searchPlaces, getPlaceDetails } from '../../services/api/placesApi';
import { getRecentSearches, addRecentSearch } from '../../utils/recentSearches';

const DropLocationScreen = ({ navigation, route }) => {
  const { pickup, serviceType } = route.params || {};

  const [pickupText, setPickupText] = useState(pickup?.address || 'Current Location');
  const [pickupCoords, setPickupCoords] = useState({ latitude: pickup?.latitude, longitude: pickup?.longitude });

  const [destinationText, setDestinationText] = useState('');
  const [activeField, setActiveField] = useState('destination');
  const [suggestions, setSuggestions] = useState([]);
  const [searching, setSearching] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);

  useEffect(() => {
    getRecentSearches().then(setRecentSearches);
  }, []);

  useEffect(() => {
    const query = activeField === 'pickup' ? pickupText : destinationText;

    if (!query || query.trim().length < 3) {
      setSuggestions([]);
      return undefined;
    }

    setSearching(true);
    const timer = setTimeout(async () => {
      const results = await searchPlaces(query, pickupCoords);
      setSuggestions(results);
      setSearching(false);
    }, 350);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pickupText, destinationText, activeField]);

  const proceedWithDestination = async destination => {
    const savedRecent = await addRecentSearch({
      address: destination.address,
      latitude: destination.latitude,
      longitude: destination.longitude,
    });
    setRecentSearches(savedRecent);

    navigation.navigate('VehicleSelection', {
      pickup: { address: pickupText, ...pickupCoords },
      destination,
      serviceType,
    });
  };

  const handleSelectSuggestion = async suggestion => {
    setSuggestions([]);

    try {
      const details = await getPlaceDetails(suggestion.placeId);

      if (activeField === 'pickup') {
        setPickupText(details.address);
        setPickupCoords({ latitude: details.latitude, longitude: details.longitude });
      } else {
        setDestinationText(details.address);
        await proceedWithDestination(details);
      }
    } catch (error) {
      console.log('Place details error:', error.message);
    }
  };

  const handleSelectOnMap = () => {
    navigation.navigate('MapPicker', {
      initialCoords: pickupCoords,
      onConfirm: 'destination',
      pickup: { address: pickupText, ...pickupCoords },
      serviceType,
    });
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
          <TextInput
            style={styles.locationInput}
            value={pickupText}
            onChangeText={setPickupText}
            onFocus={() => setActiveField('pickup')}
            placeholder="Pickup location"
            placeholderTextColor={colors.textSecondary}
          />
        </View>

        <View style={styles.dashedLine} />

        <View style={styles.locationRow}>
          <View style={[styles.dot, styles.redDot]} />
          <TextInput
            style={styles.locationInput}
            value={destinationText}
            onChangeText={setDestinationText}
            onFocus={() => setActiveField('destination')}
            placeholder="Drop location"
            placeholderTextColor={colors.textSecondary}
            autoFocus
            returnKeyType="search"
          />
        </View>
      </View>

      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.actionPill} onPress={handleSelectOnMap}>
          <Text style={styles.actionText}>📍 Select on map</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionPill}>
          <Text style={styles.actionText}>◆ Add stops</Text>
        </TouchableOpacity>
      </View>

      {searching && (
        <ActivityIndicator style={styles.searchSpinner} color={colors.primary} />
      )}

      {suggestions.length > 0 ? (
        <FlatList
          data={suggestions}
          keyExtractor={item => item.placeId}
          contentContainerStyle={styles.list}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.recentRow} onPress={() => handleSelectSuggestion(item)}>
              <Text style={styles.historyIcon}>📍</Text>
              <Text style={styles.recentAddress} numberOfLines={2}>
                {item.description}
              </Text>
            </TouchableOpacity>
          )}
        />
      ) : (
        <FlatList
          data={recentSearches}
          keyExtractor={(item, index) => `${item.address}-${index}`}
          contentContainerStyle={styles.list}
          ListHeaderComponent={
            recentSearches.length > 0 ? (
              <Text style={styles.recentHeading}>Recent</Text>
            ) : null
          }
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              Search for a drop location above — your recent searches will show up here.
            </Text>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.recentRow}
              onPress={() => proceedWithDestination(item)}
            >
              <Text style={styles.historyIcon}>↻</Text>
              <Text style={styles.recentAddress} numberOfLines={2}>
                {item.address}
              </Text>
            </TouchableOpacity>
          )}
        />
      )}
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
  locationInput: {
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
  searchSpinner: {
    marginTop: 10,
  },
  list: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  recentHeading: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.textSecondary,
    marginBottom: 6,
  },
  emptyText: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 20,
    lineHeight: 20,
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
  recentAddress: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
});

export default DropLocationScreen;
