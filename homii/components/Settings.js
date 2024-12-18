import React, { useState } from "react"; // Importer React og useState fra react
import { View, Text, Switch, Button, Alert, Modal, TextInput, TouchableOpacity,} from "react-native"; // Importer View, Text, Switch, Button, Alert, Modal, TextInput og TouchableOpacity fra react-native
import { signOut, deleteUser, EmailAuthProvider, reauthenticateWithCredential, } from "firebase/auth"; // Importer signOut, deleteUser, EmailAuthProvider og reauthenticateWithCredential fra firebase/auth
import { auth, db } from "../firebase";  // Importer auth og db fra firebase
import Toast from "react-native-toast-message"; 
import { useNavigation } from "@react-navigation/native"; 
import styles from "../styles/SettingStyles";

// Indstillinger komponent
export default function Settings() { 
  const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(false); // State til notifikationer
  const [modalVisible, setModalVisible] = useState(false); // State til modal
  const [password, setPassword] = useState(""); // State til adgangskode
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
      { text: "Cancel", style: "cancel" }, //Cancel-knap
      {
        text: "Yes", // Yes-knap
        onPress: async () => { // Håndterer log ud, hvis brugeren vælger "Yes"
          try {
            await signOut(auth); // Firebase-funktion til at logge brugeren ud
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
    // Viser en dialogboks for at bekræfte om brugeren vil fjerne reklamer
    Alert.alert(
      "Remove Ads",
      "Do you want to remove ads from the app", //brugerbesked
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Proceed",
          onPress: () => { 
            const paymentUrl = "https://www.example.com/remove-ads"; // Tredje parts betaling
            navigation.navigate("PaymentWebView", { url: paymentUrl }); // Naviger til en webvisning der håndterer betalingen
          },
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Settings</Text>
      {/* Indstilling for at slå notifikationer til eller fra */}
      <View style={styles.settingItem}>
        <Text style={styles.label}>Turn on notifications</Text> 
        <Switch
          value={isNotificationsEnabled} // Angiver om notifikationer er slået til
          onValueChange={toggleNotifications} // Funktion til at ændre notifikationsstatus
        />
      </View>

      {/* Knap til at ændre adgangskode */}
      <View style={styles.settingItem}>
        <Button title="Change password" onPress={handleChangePassword} />
      </View>

      {/* Knap til at slette kontoen */}
      <View style={styles.settingItem}>
        <Button title="Delete account" onPress={handleDeleteAccount} />
      </View>

      {/* Knap til at kontakte support */}
      <View style={styles.settingItem}>
        <Button title="Contact support" onPress={handleContactSupport} />
      </View>

      {/* Knap til at logge ud */}
      <View style={styles.settingItem}>
        <Button title="Log out" onPress={handleLogout} />
      </View>

      {/* Knap til at fjerne reklamer */}
      <View style={styles.settingItem}>
        <Button title="Remove ads" onPress={handleRemoveAds} />
      </View>
      {/* Modal til at bekræfte sletning af konto */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible); // Lukker modal ved tryk på tilbageknap
          setPassword(""); // Nulstiller adgangskodeinput
        }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>
              Input password to confirm deletion:
            </Text>
            {/* Tekstinput til adgangskode */}
            <TextInput
              style={styles.input}
              placeholder="Password"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.button, styles.buttonClose]} // Bruger tilpasset stil
                onPress={() => {
                  setModalVisible(false);
                  setPassword(""); // Nulstiller adgangskode
                }}
              >
                <Text style={styles.textStyle}>Cancel</Text>
              </TouchableOpacity>
              {/* Knap til at bekræfte sletning */}
              <TouchableOpacity
                style={[styles.button, styles.buttonDelete]} // Bruger tilpasset stil
                onPress={confirmDeleteAccount} // Funktion til at bekræfte sletning
              >
                <Text style={styles.textStyle}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      {/* Toast notifikationer */}
      <Toast />
    </View>
  );
}

