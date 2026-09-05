import React from 'react';
import {
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
} from 'react-native';

import colors from '../../constants/colors';

const VehicleCard = ({
  vehicle,
  selected,
  onPress,
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.card,
        selected && styles.selectedCard,
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.iconContainer}>
        <Text style={styles.iconText}>
          {vehicle?.name ? vehicle.name.charAt(0) : 'V'}
        </Text>
      </View>

      <View style={styles.details}>
        <Text style={styles.name}>
          {vehicle.name}
        </Text>

        <Text style={styles.description}>
          {vehicle.description}
        </Text>

        <Text style={styles.price}>
          Base ₹{vehicle.baseFare} + ₹{vehicle.perKm}/km
        </Text>
      </View>

      {selected && (
        <View style={styles.check}>
          <Text style={styles.checkText}>✓</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    padding: 15,
    marginBottom: 12,
  },

  selectedCard: {
    borderColor: colors.customer,
    borderWidth: 2,
  },

  iconContainer: {
    width: 55,
    height: 55,
    borderRadius: 12,
    backgroundColor: colors.input,
    justifyContent: 'center',
    alignItems: 'center',
  },

  iconText: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.primary,
  },

  details: {
    flex: 1,
    marginLeft: 14,
  },

  name: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },

  description: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 3,
  },

  price: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 5,
  },

  check: {
    width: 25,
    height: 25,
    borderRadius: 20,
    backgroundColor: colors.customer,
    justifyContent: 'center',
    alignItems: 'center',
  },

  checkText: {
    color: colors.white,
    fontWeight: '700',
  },
});

export default VehicleCard;