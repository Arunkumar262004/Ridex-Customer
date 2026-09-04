import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';

const CaptainHomeScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Captain Dashboard
      </Text>

      <Text style={styles.text}>
        Go Online and receive rides
      </Text>
    </View>
  );
};

export default CaptainHomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  title: {
    fontSize: 26,
    fontWeight: 'bold',
  },

  text: {
    marginTop: 10,
    fontSize: 18,
  },
});