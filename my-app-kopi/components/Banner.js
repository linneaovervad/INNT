// Importerer nødvendige komponenter
import React from 'react';
import { View, Image, TouchableOpacity } from 'react-native';
import styles from '../styles/BannerStyles';

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
