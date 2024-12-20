import React, { useState } from "react"; // Importer React og useState fra react
import { View, Text, TextInput, TouchableOpacity, Alert, } from "react-native"; // Importer View, Text, TextInput, TouchableOpacity og Alert fra react-native
import { createUserWithEmailAndPassword, updateProfile, signOut, } from "firebase/auth"; // Importer createUserWithEmailAndPassword, updateProfile og signOut fra firebase/auth
import { ref, set } from "firebase/database"; // Importer ref og set fra firebase/database
import { auth, db } from "../firebase"; // Importer auth og db fra firebase
import Toast from "react-native-toast-message";   // Importer Toast fra react-native-toast-message
import styles from "../styles/SignUpScreenStyles"; // Importer styles fra SignUpScreenStyles

// Funktionel komponent for SignUpScreen
export default function SignUpScreen({ navigation }) { 
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState(""); // State til adgangskode
  const [displayName, setDisplayName] = useState(""); // State til brugernavn

  // Funktion til at oprette en bruger
  const handleSignUp = () => {
    // Tjekker om alle felter er udfyldt
    if (!email || !password || !displayName) {
      Alert.alert("Error", "Fill out all the fields."); // Fejlmeddelelse 
      return;
    }

    // Firebase funktion til at oprette bruger med e-mail og adgangskode
    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user; // Henter brugerdata fra brugeroprettelsen

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
                // Viser en succesmeddelelse når brugeren er oprettet
                type: "success",
                text1: "Success",
                text2: "User created. Log in with your details.",
              });
              // Log brugeren ud
              signOut(auth)
                .then(() => {
                  // Navigatoren skifter automatisk til AuthStack efter log ud
                })
                .catch((error) => {
                  // Fejlhåndtering
                  console.error("Error signing out:", error);
                  Alert.alert(
                    "Error",
                    "An error occurred during log out. Try again."
                  );
                });
            })
            .catch((error) => {
              // Fejlhåndtering hvis det ikke lykkes at gemme brugerdata
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
        // Fejlhåndtering hvis brugeroprettelsen fejler
        console.error("Error signing up:", error);
        Alert.alert("Error", error.message);
      });
  };

   // Returnerer UI for oprettelsesskærmen
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
        onChangeText={(text) => setEmail(text.toLowerCase())}
        style={styles.input}
        keyboardType="email-address" 
        autoCapitalize="none" 
      />

      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword} // Opdaterer adgangskode når tekst ændres
        style={styles.input}
        secureTextEntry // Skjuler adgangskode når der skrives
      />

      {/* Knap til oprettelse af bruger */}
      <TouchableOpacity onPress={handleSignUp} style={styles.button}>
        <Text style={styles.buttonText}>Create</Text>
      </TouchableOpacity>

      {/* Link til login-skærmen */}
      <TouchableOpacity onPress={() => navigation.navigate("Login")}>
        <Text style={styles.loginText}>
          Do you already have an account? Log in
        </Text>
      </TouchableOpacity>
    </View>
  );
}

