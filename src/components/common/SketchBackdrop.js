import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import colors from '../../constants/colors';

// Lightweight "sketched" decoration for the auth screens' empty white space
// — a faint dotted route with a couple of ride icons. Built from plain RN
// primitives (no svg/icon library dependency) so it stays cheap to render.
const SketchBackdrop = () => (
  <View style={styles.container} pointerEvents="none">
    <Text style={[styles.emoji, styles.emojiTopLeft]}>🛺</Text>
    <Text style={[styles.emoji, styles.emojiTopRight]}>📍</Text>
    <View style={styles.dottedLine} />
    <Text style={[styles.emoji, styles.emojiBottomLeft]}>🏍️</Text>
    <Text style={[styles.emoji, styles.emojiBottomRight]}>🚗</Text>
    <View style={[styles.circle, styles.circleLarge]} />
    <View style={[styles.circle, styles.circleSmall]} />
  </View>
);

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  emoji: {
    position: 'absolute',
    fontSize: 30,
    opacity: 0.16,
  },
  emojiTopLeft: {
    top: 40,
    left: 24,
    transform: [{ rotate: '-12deg' }],
  },
  emojiTopRight: {
    top: 90,
    right: 32,
    transform: [{ rotate: '10deg' }],
  },
  emojiBottomLeft: {
    bottom: 130,
    left: 40,
    transform: [{ rotate: '8deg' }],
  },
  emojiBottomRight: {
    bottom: 70,
    right: 20,
    transform: [{ rotate: '-6deg' }],
  },
  dottedLine: {
    position: 'absolute',
    top: 70,
    left: 60,
    right: 60,
    height: 1,
    borderTopWidth: 2,
    borderStyle: 'dotted',
    borderColor: colors.primary,
    opacity: 0.14,
    transform: [{ rotate: '4deg' }],
  },
  circle: {
    position: 'absolute',
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: colors.primary,
    opacity: 0.1,
  },
  circleLarge: {
    width: 160,
    height: 160,
    top: -40,
    right: -50,
  },
  circleSmall: {
    width: 90,
    height: 90,
    bottom: 20,
    left: -30,
  },
});

export default SketchBackdrop;
