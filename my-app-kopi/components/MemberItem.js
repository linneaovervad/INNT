// components/MemberItem.js
import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { ref, get } from 'firebase/database';
import { db } from '../firebase';
import Toast from 'react-native-toast-message';

export default function MemberItem({ userId, householdName, removeUser }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      const userRef = ref(db, `users/${userId}`);
      try {
        const snapshot = await get(userRef);
        if (snapshot.exists()) {
          const userData = snapshot.val();
          console.log(`Fetched data for userId ${userId}:`, userData);
          setUser(userData);
        } else {
          console.log(`No data found for userId ${userId}`);
          setUser({ displayName: 'Unknown User', email: 'Unknown' });
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        setUser({ displayName: 'Unknown User', email: 'Unknown' });
      }
    };
    fetchUser();
  }, [userId]);

  return (
    <View style={styles.memberItem}>
      <Text style={styles.memberText}>
        {user?.displayName ? `${user.displayName} (${user.email})` : user?.email}
      </Text>
      <TouchableOpacity onPress={() => removeUser(userId, user?.displayName || user?.email)} style={styles.removeButton}>
        <Ionicons name="remove-circle-outline" size={24} color="red" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  memberItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#D5F5E3',
    borderRadius: 8,
    marginBottom: 10,
  },
  memberText: {
    fontSize: 16,
    color: '#196F3D',
  },
  removeButton: {
    padding: 5,
  },
});
