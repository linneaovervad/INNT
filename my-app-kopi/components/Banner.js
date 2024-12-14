//Importerer 
import React from 'react';
import { View, Image, StyleSheet, TouchableOpacity } from 'react-native';

export default function Banner({ onPress }) { //Eksporterer banneret
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
