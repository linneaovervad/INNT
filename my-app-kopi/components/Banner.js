// Importerer komponenter
import React from 'react';
import { View, Image, StyleSheet, TouchableOpacity } from 'react-native';

// Funktionel komponent for Banner
export default function Banner({ onPress, style }) {
  return (
    // TouchableOpacity gør banneret trykbart og udfører en funktion når det trykkes på
    <TouchableOpacity onPress={onPress} style={[styles.bannerContainer, style]}>
      {/* Billedet der vises som banner */}
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
    position: 'absolute',
    left: 30,
    right: 30,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 5,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    zIndex: 10,
  },
  bannerImage: {
    height: '100%',
    width: '100%',
    borderRadius: 5,
  },
});
