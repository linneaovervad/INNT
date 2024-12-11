// components/Settings.js
import React, { useState } from 'react';
import { View, Text, Switch, StyleSheet, Button, Alert, Modal, TextInput, TouchableOpacity } from 'react-native';
import { signOut, deleteUser, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { auth, db } from '../firebase'; // Importér auth fra firebase.js

export default function Settings({ navigation }) {
  const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [password, setPassword] = useState('');

  // Funktion til at skifte status for notifikationer
  const toggleNotifications = () => setIsNotificationsEnabled(previousState => !previousState);

  // Funktion til at håndtere skift af kodeord
  const handleChangePassword = () => {
    Alert.alert("Change Password", "Navigate to change password screen.");
    // Her kan du navigere til en skærm for at ændre kodeord, f.eks. navigation.navigate('ChangePassword');
  };

  // Funktion til at håndtere sletning af konto
  const handleDeleteAccount = () => {
    Alert.alert(
      "Slet Konto",
      "Er du sikker på, at du vil slette din konto? Denne handling kan ikke fortrydes.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Yes", onPress: () => setModalVisible(true) } // Åbn modal til password indtastning
      ]
    );
  };

  // Funktion til at kontakte support
  const handleContactSupport = () => {
    Alert.alert("Contact Support", "Support kontaktmuligheder vil være tilgængelige.");
    // Tilføj supportlogik her, f.eks. åbne en e-mail eller en supportchat
  };

  // Funktion til at logge ud
  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Er du sikker på, at du vil logge ud?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Yes", 
          onPress: async () => {
            try {
              await signOut(auth);
              Alert.alert("Success", "Du er blevet logget ud.");
            } catch (error) {
              Alert.alert("Error", error.message);
            }
          } 
        }
      ]
    );
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
        // Slet brugeren
        await deleteUser(user);
        Alert.alert("Success", "Din konto er blevet slettet.");
        // Auth state vil ændres, og App.js vil håndtere navigeringen
      } catch (error) {
        console.error(error);
        Alert.alert("Error", error.message);
      } finally {
        setModalVisible(false);
        setPassword('');
      }
    } else {
      Alert.alert("Error", "Ingen bruger er logget ind.");
      setModalVisible(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Indstillinger</Text>

      <View style={styles.settingItem}>
        <Text style={styles.label}>Aktiver Notifikationer</Text>
        <Switch
          value={isNotificationsEnabled}
          onValueChange={toggleNotifications}
        />
      </View>

      {/* Knappen til at ændre kodeord */}
      <View style={styles.settingItem}>
        <Button title="Skift Kodeord" onPress={handleChangePassword} />
      </View>

      {/* Knappen til at slette konto */}
      <View style={styles.settingItem}>
        <Button title="Slet Konto" onPress={handleDeleteAccount} color="red" />
      </View>

      {/* Knappen til at kontakte support */}
      <View style={styles.settingItem}>
        <Button title="Kontakt Support" onPress={handleContactSupport} />
      </View>

      {/* Knappen til at logge ud */}
      <View style={styles.settingItem}>
        <Button title="Logout" onPress={handleLogout} color="red" />
      </View>

      {/* Modal til at indtaste password for sletning */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
          setPassword('');
        }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>Indtast dit kodeord for at bekræfte sletning:</Text>
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
                onPress={() => { setModalVisible(false); setPassword(''); }}
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  label: {
    fontSize: 18,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
    backgroundColor: 'rgba(0,0,0,0.5)', // Semi-transparent baggrund
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '80%',
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
    fontSize: 16,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    paddingHorizontal: 10,
    marginBottom: 20,
    borderRadius: 5,
    width: '100%',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  button: {
    borderRadius: 5,
    padding: 10,
    elevation: 2,
    width: '45%',
    alignItems: 'center',
  },
  buttonClose: {
    backgroundColor: '#bbb',
  },
  buttonDelete: {
    backgroundColor: '#FF6347',
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
  },
});
