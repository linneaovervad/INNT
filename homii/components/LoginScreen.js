import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, } from "react-native";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, } from "../firebase";
import Toast from "react-native-toast-message"; 
import styles from "../styles/LoginScreenStyles";

// LoginScreen-komponenten
export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState(""); // State til at gemme e-mail
  const [password, setPassword] = useState(""); // State til at gemme adgangskode

  // Funktion til at validere log ind
  const handleLogin = () => {
    // Tjekker om alle felter er udfyldt
    if (!email || !password) {
      Alert.alert("Error", "Fill out all the fields."); // Viser en advarsel hvis felter mangler
      return;
    }

    // Log ind med e-mail og kodeord
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user; // Henter den autentificerede bruger
        Toast.show({
          type: "success",
          text1: "Success",
          text2: "Logged in.",
        });
      })
      .catch((error) => {
        console.error("Error logging in:", error); // Logger fejl til konsollen
        Alert.alert("Error", error.message); // Viser fejlmeddelelsen
      });
  };

  // Returnerer loginformularen
  return (
    <View style={styles.container}>
      {/* Overskrift for login-skærmen */}
      <Text style={styles.heading}>Log Ind</Text>
      {/* Inputfelt til e-mail */}
      <TextInput
        placeholder="E-mail"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      {/* Inputfelt til adgangskode */}
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        style={styles.input}
        secureTextEntry
      />
      {/* Log ind knap */}
      <TouchableOpacity onPress={handleLogin} style={styles.button}>
        <Text style={styles.buttonText}>Log Ind</Text>
      </TouchableOpacity>
      {/* Naviger til SignUp-siden */}
      <TouchableOpacity onPress={() => navigation.navigate("SignUp")}>
        <Text style={styles.signupText}>Create a new account</Text>
      </TouchableOpacity>
      <Toast />
    </View>
  );
}
