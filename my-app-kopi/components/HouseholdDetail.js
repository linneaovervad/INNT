import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import {
  ref,
  onValue,
  set,
  remove,
  get,
  query,
  orderByChild,
  equalTo,
} from "firebase/database";
import { db } from "../firebase";
import MemberItem from "./MemberItem";
import Toast from "react-native-toast-message";
import styles from "../styles/HouseholdDetailStyles";


export default function HouseholdDetail({ route, navigation }) {
  const { householdId, householdName } = route.params;
  const [household, setHousehold] = useState(null);
  const [searchEmail, setSearchEmail] = useState("");
  const [searchResult, setSearchResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedColor, setSelectedColor] = useState(null); 


  useEffect(() => {
    navigation.setOptions({ title: householdName });
    const householdRef = ref(db, `households/${householdId}`);
    const unsubscribe = onValue(householdRef, (snapshot) => {
      const data = snapshot.val();
      setHousehold(data);
    });

    return () => unsubscribe();
  }, [householdId, householdName, navigation]);

//Funktion til at søge efter bruger via email
  const searchUserByEmail = () => {
    if (!searchEmail.trim()) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Enter an email to search for.",
      });
      return;
    }

    const usersRef = ref(db, "users");
    const userQuery = query(
      usersRef,
      orderByChild("email"),
      equalTo(searchEmail.trim().toLowerCase())
    );

    setLoading(true);
    get(userQuery)
      .then((snapshot) => {
        setLoading(false);
        if (snapshot.exists()) {
          const data = snapshot.val();
          const userId = Object.keys(data)[0];
          setSearchResult({ id: userId, ...data[userId] });
          console.log(`Search found user:`, { id: userId, ...data[userId] });
        } else {
          setSearchResult(null);
          Toast.show({
            type: "info",
            text1: "No results",
            text2: "No user found with this Email.",
          });
        }
      })
      .catch((error) => {
        setLoading(false);
        console.error("Error searching user:", error);
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "An error occurred during search.",
        });
      });
  };

  // Funktion til at tilføje en bruger til husholdningen
  const addUserToHousehold = () => {
    if (!searchResult) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "No user to add.",
      });
      return;
    }

    if (!selectedColor) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Please select a color for the user.",
      });
      return;
    }

    // Tjek om brugeren allerede er medlem
    if (household.members && household.members[searchResult.id]) {
      Toast.show({
        type: "info",
        text1: "Info",
        text2: `${searchResult.displayName || searchResult.email} is already a member of ${household.name}.`,
      });
      return;
    }

    // Brug set til at tilføje medlemmet med farve, displayName og email
    const memberRef = ref(
      db,
      `households/${householdId}/members/${searchResult.id}`
    );
    set(memberRef, { 
      color: selectedColor,
      displayName: searchResult.displayName || "Unknown",
      email: searchResult.email || "",
    }) // Gem farve, displayName og email
      .then(() => {
        Toast.show({
          type: "success",
          text1: "Success",
          text2: `${searchResult.displayName || searchResult.email} has been added to ${household.name} with the selected color.`,
        });
        setSearchEmail("");
        setSearchResult(null);
        setSelectedColor(null); // Reset farvevalget efter tilføjelse
      })
      .catch((error) => {
        console.error("Error adding user to household:", error);
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "An error occurred when adding user.",
        });
      });
  };

  // Funktion til at fjerne en bruger fra husholdningen
  const removeUserFromHousehold = (userId, userName) => {
    Alert.alert(
      "Confirm deletion",
      `Are you sure you want to remove ${userName} from ${householdName}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Yes",
          onPress: () => {
            const memberRef = ref(
              db,
              `households/${householdId}/members/${userId}`
            );
            remove(memberRef)
              .then(() => {
                Toast.show({
                  type: "success",
                  text1: "Success",
                  text2: `${userName} has been removed from ${householdName}.`,
                });
              })
              .catch((error) => {
                console.error("Error removing user from household:", error);
                Toast.show({
                  type: "error",
                  text1: "Error",
                  text2: "An error occurred when removing the user.",
                });
              });
          },
        },
      ]
    );
  };

  // Liste over tilgængelige farver
  const availableColors = [
    "#FF5733",
    "#33FF57",
    "#3357FF",
    "#FF33A8",
    "#A833FF",
    "#33FFF6",
    "#FF8F33",
    "#8FFF33",
    "#FF3333",
    "#33FF8F",
  ];

  return (
    <View style={styles.container}>
      {/* Søg efter og tilføj bruger */}
      <View style={styles.addUserContainer}>
        <Text style={styles.sectionHeading}>Add user</Text>
        <View style={styles.searchContainer}>
          <TextInput
            placeholder="Search by Email"
            value={searchEmail}
            onChangeText={setSearchEmail}
            style={styles.inputField}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TouchableOpacity
            onPress={searchUserByEmail}
            style={styles.searchButton}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="search-outline" size={24} color="#fff" />
                <Text style={styles.searchButtonText}>Search</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Vis søgeresultater */}
        {searchResult && (
          <View style={styles.searchResultContainer}>
            <Text style={styles.resultText}>
              User found:{" "}
              {searchResult.displayName
                ? `${searchResult.displayName} (${searchResult.email})`
                : searchResult.email}
            </Text>
            
            {/* Farvevalg */}
            <Text style={styles.colorLabel}>Select a color:</Text>
            <View style={styles.colorsContainer}>
              {availableColors.map((color) => (
                <TouchableOpacity
                  key={color}
                  style={[
                    styles.colorCircle,
                    { backgroundColor: color },
                    selectedColor === color && styles.selectedColorCircle,
                  ]}
                  onPress={() => setSelectedColor(color)}
                />
              ))}
            </View>

            <TouchableOpacity
              onPress={addUserToHousehold}
              style={styles.addButton}
            >
              <Ionicons name="add-circle-outline" size={24} color="#fff" />
              <Text style={styles.addButtonText}>Add to household</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
      <Text style={styles.sectionHeading}>Members</Text>
      <FlatList
        data={household?.members ? Object.keys(household.members) : []}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <MemberItem
            userId={item}
            householdId={householdId} // Tilføj householdId her
            householdName={householdName}
            removeUser={removeUserFromHousehold}
          />
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            Ingen medlemmer i denne husholdning.
          </Text>
        }
      />
      <Toast />

    </View>
  );
}
