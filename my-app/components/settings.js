import React, { useState } from 'react';
import { View, Text, Switch, StyleSheet, Button, Alert } from 'react-native';

// Indstillinger-komponenten viser en liste over indstillinger
export default function Settings() {
  const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(false);

  // Funktion til at skifte status for notifikationer

  const toggleNotifications = () => setIsNotificationsEnabled(previousState => !previousState);

  // Funktion til at håndtere skift af kodeord
  const handleChangePassword = () => {
    Alert.alert("Change Password", "Navigate to change password screen.");
    // Her kan du navigere til en skærm for at ændre kodeord, f.eks. navigation.navigate('ChangePassword');
  };

  // Funktion til at slette konto
  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "Are you sure you want to delete your account? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Yes", onPress: () => console.log("Account deleted") } // Her kan du tilføje logik for kontosletning
      ]
    );
  };

  // Funktion til at kontakte support
  const handleContactSupport = () => {
    Alert.alert("Contact Support", "Support contact options will be available.");
    // Tilføj supportlogik her, f.eks. åbne en e-mail eller en supportchat
  };

  // Funktion til at logge ud
  const handleLogout = () => {
    Alert.alert("Logout", "You have been logged out.");
    // Tilføj logik for at logge brugeren ud, f.eks. fjernelse af tokens eller navigering til login-skærmen
  };

  // Returner JSX til visning af indstillinger

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Settings</Text>

      <View style={styles.settingItem}>
        <Text style={styles.label}>Enable Notifications</Text>
        <Switch
          value={isNotificationsEnabled}
          onValueChange={toggleNotifications}
        />
      </View>

      {/* Knappen til at ændre kodeord */}
      <View style={styles.settingItem}>
        <Button title="Change Password" onPress={handleChangePassword} />
      </View>

      {/* Knappen til at slette konto */}
      <View style={styles.settingItem}>
        <Button title="Delete Account" onPress={handleDeleteAccount} />
      </View>

      {/* Knappen til at kontakte support */}
      <View style={styles.settingItem}>
        <Button title="Contact Support" onPress={handleContactSupport} />
      </View>

      {/* Knappen til at logge ud */}
      <View style={styles.settingItem}>
        <Button title="Logout" onPress={handleLogout} />
      </View>
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
});
