import React, { useEffect, useState } from "react"; // Importer React, useEffect og useState fra react
import { View, Text, TouchableOpacity } from "react-native"; // Importer View, Text og TouchableOpacity fra react-native
import Ionicons from "react-native-vector-icons/Ionicons"; // Importer Ionicons fra react-native-vector-icons
import { ref, onValue } from "firebase/database"; // Importer ref og onValue fra firebase/database
import { db } from "../firebase"; // Importer db fra firebase
import styles from "../styles/MemberItemStyles"; // Importer styles fra MemberItemStyles

export default function MemberItem({ userId, householdId, removeUser }) {
  const [user, setUser] = useState(null);
  const [color, setColor] = useState("#000"); 
 // Hent brugerens data
  useEffect(() => {
    const userRef = ref(db, `users/${userId}`);
    const unsubscribeUser = onValue(userRef, (snapshot) => { // Lytter efter ændringer i brugerens data
      const data = snapshot.val();
      if (data) {
        setUser(data);
      }
    });

    // Hent brugerens farve
    const memberRef = ref(db, `households/${householdId}/members/${userId}/color`);
    const unsubscribeColor = onValue(memberRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        console.log(`User ${userId} has color: ${data}`);
        setColor(data);
      }
    });

    return () => {
      unsubscribeUser();
      unsubscribeColor();
    };
  }, [userId, householdId]);

  if (!user) {
    return null; 
  }

  return (
    <View style={styles.memberItem}>
      <View style={styles.memberInfo}>
        <View style={[styles.colorIndicator, { backgroundColor: color }]} />
        <Text style={styles.memberText}>
          {user.displayName || user.email}
        </Text>
      </View>
      <TouchableOpacity onPress={() => removeUser(userId, user.displayName || user.email)}>
        <Ionicons name="trash-outline" size={24} color="red" />
      </TouchableOpacity>
    </View>
  );
}

