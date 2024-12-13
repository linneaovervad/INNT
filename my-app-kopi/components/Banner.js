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
    position: 'absolute', // Fix it to a specific position
    bottom: 80, // Align to the bottom of the screen
    left: 30,
    right: 30,
    height: 60, // Adjust height of the banner
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white', // Optional: Set a background color
    borderTopWidth: 1, // Add a border at the top to separate it visually
    borderTopColor: '#ccc',
    zIndex: 10, // Ensure it appears above other content
  },
  bannerImage: {
    height: '100%',
    width: '110%',
    borderRadius: 5, 
  },
});
