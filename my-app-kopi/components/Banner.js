// components/Banner.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export default function Banner({ onPress }) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.bannerContainer}>
      <Text style={styles.bannerText}>🔔 Look at out latest offer!</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  bannerContainer: {
    height: 50,
    width: '100%',
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingHorizontal: 10,
  },
  bannerText: {
    fontSize: 16,
    color: '#555',
  },
});
