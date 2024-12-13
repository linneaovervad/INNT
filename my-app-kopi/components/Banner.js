// components/Banner.js
import React from 'react';
import { View, Image, StyleSheet, TouchableOpacity } from 'react-native';

export default function Banner({ onPress }) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.bannerContainer}>
      <Image 
        source={require('../assets/banner.png')} 
        style={styles.bannerImage} 
        resizeMode="cover"
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  bannerContainer: {
    height: 60,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingHorizontal: 10,
  },
  bannerImage: {
    height: '100%',
    width: '110%',
    borderRadius: 5, 
  },
});
