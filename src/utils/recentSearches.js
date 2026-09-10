import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'ridex_recent_searches';
const MAX_RECENT = 8;

const getRecentSearches = async () => {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    return [];
  }
};

const addRecentSearch = async place => {
  const existing = await getRecentSearches();

  const withoutDuplicate = existing.filter(item => item.address !== place.address);
  const updated = [place, ...withoutDuplicate].slice(0, MAX_RECENT);

  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

  return updated;
};

export { getRecentSearches, addRecentSearch };
