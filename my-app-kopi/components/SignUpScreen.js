// components/SignUpScreen.js
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import {
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
} from "firebase/auth";
import { ref, set } from "firebase/database";
import { auth, db } from "../firebase";
import Toast from "react-native-toast-message"; // Importer Toast
import styles from "../styles/SignUpScreenStyles";

export default function SignUpScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");

  const handleSignUp = () => {
    if (!email || !password || !displayName) {
      Alert.alert("Error", "Fill out all the fields.");
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
          set(ref(db, "users/" + user.uid), {
            email: user.email.toLowerCase(), // Gem e-mail i lowercase for konsistens
            displayName: displayName,
            createdAt: new Date().toISOString(),
            // Tilføj eventuelle andre nødvendige oplysninger
          })
            .then(() => {
              Toast.show({
                type: "success",
                text1: "Success",
                text2: "User created. Log in with your details.",
              });
              // Log brugeren ud
              signOut(auth)
                .then(() => {
                  // Navigatoren skifter automatisk til AuthStack
                })
                .catch((error) => {
                  console.error("Error signing out:", error);
                  Alert.alert(
                    "Error",
                    "An error occurred during log out. Try again."
                  );
                });
            })
            .catch((error) => {
              console.error("Error writing user data:", error);
              Toast.show({
                type: "error",
                text1: "Error",
                text2: "An error occurred when creating user data.",
              });
            });
        });
      })
      .catch((error) => {
        console.error("Error signing up:", error);
        Alert.alert("Error", error.message);
      });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Create Account</Text>

      <TextInput
        placeholder="Name"
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
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        style={styles.input}
        secureTextEntry
      />

      <TouchableOpacity onPress={handleSignUp} style={styles.button}>
        <Text style={styles.buttonText}>Create</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate("Login")}>
        <Text style={styles.loginText}>
          Do you already have an account? Log in
        </Text>
      </TouchableOpacity>
      {/* Fjern <Toast /> fra her */}
    </View>
  );
}

