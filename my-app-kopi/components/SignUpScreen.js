import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet } from 'react-native';
import { getAuth, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';

export default function SignUpScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const auth = getAuth();

  const handleSignUp = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      if (displayName.trim() !== '') {
        await updateProfile(userCredential.user, { displayName: displayName });
      }
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Opret bruger</Text>
      {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}

      <TextInput
        style={styles.input}
        placeholder="Navn"
        value={displayName}
        onChangeText={setDisplayName}
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Adgangskode"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <Button title="Opret" onPress={handleSignUp} />
      <View style={{ height: 10 }} />
      <Button title="Tilbage til login" onPress={() => navigation.goBack()} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center'
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10
  },
  error: {
    color: 'red',
    marginBottom: 10,
    textAlign: 'center'
  }
});
