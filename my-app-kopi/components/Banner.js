// Importerer nødvendige komponenter
import React from 'react';
import { View, Image, StyleSheet, TouchableOpacity } from 'react-native';

// Funktionel komponent for banneret
export default function Banner({ onPress }) {
  return (
    // TouchableOpacity gør banneret trykbart og udfører en funktion når det trykkes på
    <TouchableOpacity onPress={onPress} style={styles.bannerContainer}>
      {/* Viser billedet som bliver hentet fra placeringen */}
      <Image
        source={require('../assets/banner.png')} // Hvor bannerbilledet er gemt
        style={styles.bannerImage} // Anvender global styles til billedet
        resizeMode="cover" // Justerer billedet så det dækker hele rammen 
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  bannerContainer: {
    position: 'absolute',
    bottom: 80,
    left: 30,
    right: 30,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
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
