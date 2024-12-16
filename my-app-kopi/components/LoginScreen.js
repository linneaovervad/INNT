import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../firebase";
import Toast from "react-native-toast-message"; 
import styles from "../styles/LoginScreenStyles";

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Funktion til at validere log ind
  const handleLogin = () => {
    if (!email || !password) {
      Alert.alert("Error", "Fill out all the fields.");
      return;
    }

    // Log ind med e-mail og kodeord
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        Toast.show({
          type: "success",
          text1: "Success",
          text2: "Logged in.",
        });
      })
      .catch((error) => {
        console.error("Error logging in:", error);
        Alert.alert("Error", error.message);
      });
  };

  //Vis loginformular
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
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        style={styles.input}
        secureTextEntry
      />
      {/* Log ind knap */}]
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
