import React, { useState } from "react";
import { View, Text, Switch, Button, Alert, Modal, TextInput, TouchableOpacity,} from "react-native"; // Importér de nødvendige komponenter fra react-native
import { signOut, deleteUser, EmailAuthProvider, reauthenticateWithCredential, } from "firebase/auth"; // Importér de nødvendige funktioner fra firebase/auth
import { ref, remove } from "firebase/database"; // Importér remove fra firebase/database
import { auth, db } from "../firebase"; // Importér auth og db fra firebase.js
import Toast from "react-native-toast-message"; // Importér Toast
import { useNavigation } from "@react-navigation/native"; // Importer useNavigation
import styles from "../styles/SettingStyles"; // Importér styles fra SettingStyles.js

export default function Settings() { // Eksportér funktionen Settings
  const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [password, setPassword] = useState("");
  const navigation = useNavigation(); 

  // Funktion til at skifte status for notifikationer
  const toggleNotifications = () =>
    setIsNotificationsEnabled((previousState) => !previousState);

  // Funktion til at håndtere skift af kodeord
  const handleChangePassword = () => {
    Alert.alert("Change Password", "Navigate to change password screen.");
    // Her kunne man navigere til en skærm for at ændre kodeord, f.eks. navigation.navigate('ChangePassword');
  };

  // Funktion til at håndtere sletning af konto
  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete account",
      "Are you sure you want to delete your account?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Yes", onPress: () => setModalVisible(true) }, // Åbn modal til password indtastning
      ]
    );
  };

  // Funktion til at kontakte support
  const handleContactSupport = () => {
    Alert.alert("Contact Support");
    // Supportlogik ville typisk være at åbne en e-mail-app med supportens e-mailadresse
  };

  // Funktion til at logge ud
  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Yes",
        onPress: async () => {
          try {
            await signOut(auth);
            Alert.alert("Success", "you have been logged out.");
          } catch (error) {
            Alert.alert("Error", error.message);
          }
        },
      },
    ]);
  };

  // Funktion til at bekræfte sletning af konto
  const confirmDeleteAccount = async () => {
    const user = auth.currentUser;
    if (user && user.email) {
      // Opret credential med brugerens email og indtastede password
      const credential = EmailAuthProvider.credential(user.email, password);
      try {
        // Reautentificer brugeren
        await reauthenticateWithCredential(user, credential);

        // Slet brugerens data fra Realtime Database
        const userDataRef = ref(db, `users/${user.uid}`);
        await remove(userDataRef);
        console.log(
          `User data ${user.uid} has been deleted from the Realtime Database.`
        );

        // Slet brugeren fra Authentication
        await deleteUser(user);
        Alert.alert("Success", "Your account has been deleted.");
        // Auth state vil ændres, og App.js vil håndtere navigeringen
      } catch (error) {
        console.error(error);
        Alert.alert("Error", error.message);
      } finally {
        setModalVisible(false);
        setPassword("");
      }
    } else {
      Alert.alert("Error", "No user is logged in.");
      setModalVisible(false);
    }
  };

  // Funktion til at håndtere Remove Ads
  const handleRemoveAds = () => {
    Alert.alert(
      "Remove Ads",
      "Do you want to remove ads from the app",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Proceed",
          onPress: () => {
            const paymentUrl = "https://www.example.com/remove-ads"; // Tredje parts betaling
            navigation.navigate("PaymentWebView", { url: paymentUrl });
          },
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Settings</Text>

      <View style={styles.settingItem}>
        <Text style={styles.label}>Turn on notifications</Text>
        <Switch
          value={isNotificationsEnabled}
          onValueChange={toggleNotifications}
        />
      </View>

      <View style={styles.settingItem}>
        <Button title="Change password" onPress={handleChangePassword} />
      </View>

      <View style={styles.settingItem}>
        <Button title="Delete account" onPress={handleDeleteAccount} />
      </View>

      <View style={styles.settingItem}>
        <Button title="Contact support" onPress={handleContactSupport} />
      </View>

      <View style={styles.settingItem}>
        <Button title="Log out" onPress={handleLogout} />
      </View>

      <View style={styles.settingItem}>
        <Button title="Remove ads" onPress={handleRemoveAds} />
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
          setPassword("");
        }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>
              Input password to confirm deletion:
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Password"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.button, styles.buttonClose]}
                onPress={() => {
                  setModalVisible(false);
                  setPassword("");
                }}
              >
                <Text style={styles.textStyle}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.buttonDelete]}
                onPress={confirmDeleteAccount}
              >
                <Text style={styles.textStyle}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <Toast />
    </View>
  );
}
