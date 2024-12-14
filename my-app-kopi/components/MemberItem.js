import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { ref, onValue } from "firebase/database";
import { db } from "../firebase";

export default function MemberItem({ userId, householdId, householdName, removeUser }) {
  const [user, setUser] = useState(null);
  const [color, setColor] = useState("#000"); 
 // Hent brugerens data
  useEffect(() => {
    const userRef = ref(db, `users/${userId}`);
    const unsubscribeUser = onValue(userRef, (snapshot) => {
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
    return null; // Eller en placeholder
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

const styles = StyleSheet.create({
  memberItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
    backgroundColor: "#D5F5E3",
    borderRadius: 8,
    marginBottom: 10,
  },
  memberInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  memberText: {
    fontSize: 16,
    color: "#196F3D",
  },
  colorIndicator: {
    width: 15,
    height: 15,
    borderRadius: 7.5,
    marginRight: 10,
  },
});
