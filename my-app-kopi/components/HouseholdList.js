import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { ref, onValue, push, remove } from "firebase/database";
import { db, auth } from "../firebase";
import Toast from "react-native-toast-message"; 
import styles from "../styles/HouseholdListStyles";


export default function HouseholdList({ navigation }) {
  const [households, setHouseholds] = useState([]);
  const [newHousehold, setNewHousehold] = useState("");

  useEffect(() => {
    const householdsRef = ref(db, "households");
    const unsubscribe = onValue(householdsRef, (snapshot) => {
      const data = snapshot.val();
      const householdList = data
        ? Object.keys(data).map((key) => ({ id: key, ...data[key] }))
        : [];
      setHouseholds(householdList);
    });

    return () => unsubscribe();
  }, []);

  // Funktion til at oprette en ny husholdning
  const createHousehold = () => {
    if (!newHousehold.trim()) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Please enter a name for the household.",
      });
      return;
    }

    const householdsRef = ref(db, "households");
    push(householdsRef, {
      name: newHousehold.trim(),
      members: {
        [auth.currentUser.uid]: true, // Tilføj den aktuelle bruger som medlem
      },
    })
      .then(() => {
        setNewHousehold("");
        Toast.show({
          type: "success",
          text1: "Success",
          text2: "Household created.",
        });
      })
      .catch((error) => {
        console.error("Error creating household:", error);
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "An error occured when creating the household.",
        });
      });
  };

  // Funktion til at slette en husholdning
  const deleteHousehold = (id) => {
    Alert.alert(
      "Confirm deletion",
      "Are you sure you want to delete this household?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Yes",
          onPress: () => {
            const householdRef = ref(db, `households/${id}`);
            remove(householdRef)
              .then(() => {
                Toast.show({
                  type: "success",
                  text1: "Success",
                  text2: "Household deleted.",
                });
              })
              .catch((error) => {
                console.error("Error deleting household:", error);
                Toast.show({
                  type: "error",
                  text1: "Error",
                  text2: "An error occured when deleting household.",
                });
              });
          },
        },
      ]
    );
  };

  // Funktion til at vise en husholdning
  const renderHousehold = ({ item }) => (
    <TouchableOpacity
      style={styles.householdItem}
      onPress={() =>
        navigation.navigate("HouseholdDetail", {
          householdId: item.id,
          householdName: item.name,
        })
      }
    >
      <Text style={styles.householdName}>{item.name}</Text>
      <TouchableOpacity
        onPress={() => deleteHousehold(item.id)}
        style={styles.deleteButton}
      >
        <Ionicons name="trash-outline" size={24} color="red" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Households</Text>

      {/* Opret en ny husholdning */}
      <View style={styles.createContainer}>
        <TextInput
          placeholder="New household name"
          value={newHousehold}
          onChangeText={setNewHousehold}
          style={styles.inputField}
        />
        <TouchableOpacity onPress={createHousehold} style={styles.addButton}>
          <Ionicons name="add-circle-outline" size={24} color="#fff" />
          <Text style={styles.addButtonText}>Create</Text>
        </TouchableOpacity>
      </View>

      {/* Liste over husholdninger */}
      <FlatList
        data={households}
        keyExtractor={(item) => item.id}
        renderItem={renderHousehold}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No households created.</Text>
        }
      />

    </View>
  );
}
