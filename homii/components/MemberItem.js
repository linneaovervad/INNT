import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { ref, onValue } from "firebase/database";
import { db } from "../firebase";
import styles from "../styles/MemberItemStyles";

// Definerer en funktionel komponent til at vise et medlem
export default function MemberItem({ userId, householdId, removeUser }) {
  const [user, setUser] = useState(null); // State til at gemme brugerens data
  const [color, setColor] = useState("#000"); // State til at gemme brugerens farve (standard: sort)
 // Hent brugerens data og farve fra databasen
  useEffect(() => {
    // Reference til brugerdata i databasen
    const userRef = ref(db, `users/${userId}`);
    const unsubscribeUser = onValue(userRef, (snapshot) => {
      const data = snapshot.val(); // Henter brugerens data
      if (data) {
        setUser(data); // Opdaterer user state med brugerens data
      }
    });

    // Reference til brugerens farve i husstandens medlemmer
    const memberRef = ref(db, `households/${householdId}/members/${userId}/color`);
    const unsubscribeColor = onValue(memberRef, (snapshot) => {
      const data = snapshot.val(); // Henter farvedata
      if (data) {
        console.log(`User ${userId} has color: ${data}`); // Logger brugerens farve til konsollen
        setColor(data); // Opdaterer color state med den hentede farve
      }
    });

    // Rydder op ved at afmelde databasen, når komponenten afmonteres
    return () => {
      unsubscribeUser(); // Stopper lytning til brugerdata
      unsubscribeColor(); // Stopper lytning til farvedata
    };
  }, [userId, householdId]); // Effekt afhænger af userId og householdId

  if (!user) {
    return null; // Returnerer intet, hvis brugerdata ikke er tilgængelige
  }

  return (
    <View style={styles.memberItem}>
      <View style={styles.memberInfo}>
        <View style={[styles.colorIndicator, { backgroundColor: color }]} />
        <Text style={styles.memberText}>
          {user.displayName || user.email} {/* Viser enten displayName eller email */}
        </Text>
      </View>
      {/* Knap til at fjerne medlemmet */}
      <TouchableOpacity onPress={() => removeUser(userId, user.displayName || user.email)}>
        <Ionicons name="trash-outline" size={24} color="red" />
      </TouchableOpacity>
    </View>
  );
}

