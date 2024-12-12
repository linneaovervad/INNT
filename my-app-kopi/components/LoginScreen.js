// components/LoginScreen.js
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { db } from '../firebase';
import Toast from 'react-native-toast-message'; // Importer Toast

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    if (!email || !password) {
      Alert.alert('Fejl', 'Udfyld alle felter.');
      return;
    }

    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'Logget ind.',
        });
        navigation.navigate('Main'); // Naviger til hovedskærmen
      })
      .catch((error) => {
        console.error('Error logging in:', error);
        Alert.alert('Fejl', error.message);
      });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Log Ind</Text>
      
      <TextInput
        placeholder="E-mail"
        value={email}
        onChangeText={setEmail}
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
      
      <TouchableOpacity onPress={handleLogin} style={styles.button}>
        <Text style={styles.buttonText}>Log Ind</Text>
      </TouchableOpacity>
      
      <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
        <Text style={styles.signupText}>Opret en ny konto</Text>
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
    backgroundColor: '#2874A6',
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
  signupText: {
    color: '#28B463',
    textAlign: 'center',
    fontSize: 16,
  },
});
