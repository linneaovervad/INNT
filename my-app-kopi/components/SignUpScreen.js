// components/SignUpScreen.js
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { createUserWithEmailAndPassword, updateProfile, signOut } from 'firebase/auth';
import { ref, set } from 'firebase/database';
import { auth, db } from '../firebase';
import Toast from 'react-native-toast-message'; // Importer Toast

export default function SignUpScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');

  const handleSignUp = () => {
    if (!email || !password || !displayName) {
      Alert.alert('Fejl', 'Udfyld alle felter.');
      return;
    }

    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;

        // Opdater brugerens display navn
        updateProfile(user, {
          displayName: displayName,
        }).then(() => {
          // Gem brugerdata i Realtime Database
          set(ref(db, 'users/' + user.uid), {
            email: user.email.toLowerCase(), // Gem e-mail i lowercase for konsistens
            displayName: displayName,
            createdAt: new Date().toISOString(),
            // Tilføj eventuelle andre nødvendige oplysninger
          })
            .then(() => {
              Toast.show({
                type: 'success',
                text1: 'Success',
                text2: 'Bruger oprettet. Log ind med dine oplysninger.',
              });
              // Log brugeren ud
              signOut(auth)
                .then(() => {
                  navigation.navigate('Login'); // Naviger til login-skærmen
                })
                .catch((error) => {
                  console.error('Error signing out:', error);
                  Alert.alert('Fejl', 'Der opstod en fejl under log ud. Prøv igen.');
                });
            })
            .catch((error) => {
              console.error('Error writing user data:', error);
              Toast.show({
                type: 'error',
                text1: 'Fejl',
                text2: 'Der opstod en fejl under oprettelsen af brugerdata.',
              });
            });
        });
      })
      .catch((error) => {
        console.error('Error signing up:', error);
        Alert.alert('Fejl', error.message);
      });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Opret Konto</Text>
      
      <TextInput
        placeholder="Navn"
        value={displayName}
        onChangeText={setDisplayName}
        style={styles.input}
      />
      
      <TextInput
        placeholder="E-mail"
        value={email}
        onChangeText={(text) => setEmail(text.toLowerCase())} // Konverter input til lowercase
        style={styles.input}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      
      <TextInput
        placeholder="Adgangskode"
        value={password}
        onChangeText={setPassword}
        style={styles.input}
        secureTextEntry
      />
      
      <TouchableOpacity onPress={handleSignUp} style={styles.button}>
        <Text style={styles.buttonText}>Opret</Text>
      </TouchableOpacity>
      
      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={styles.loginText}>Har du allerede en konto? Log ind</Text>
      </TouchableOpacity>
      
      {/* Placer Toast komponenten her uden ref */}
      <Toast />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#FDFEFE',
    justifyContent: 'center',
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
    color: '#2E4053',
  },
  input: {
    height: 50,
    borderColor: '#AAB7B8',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    backgroundColor: '#EBF5FB',
  },
  button: {
    backgroundColor: '#28B463',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loginText: {
    color: '#2874A6',
    textAlign: 'center',
    fontSize: 16,
  },
});
