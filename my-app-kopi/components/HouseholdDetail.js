// components/HouseholdDetail.js
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
import Banner from "./Banner";

export default function HouseholdDetail({ route, navigation }) {
  const { householdId, householdName } = route.params;
  const [household, setHousehold] = useState(null);
  const [searchEmail, setSearchEmail] = useState("");
  const [searchResult, setSearchResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    navigation.setOptions({ title: householdName });
    const householdRef = ref(db, `households/${householdId}`);
    const unsubscribe = onValue(householdRef, (snapshot) => {
      const data = snapshot.val();
      setHousehold(data);
    });

    return () => unsubscribe(); // Clean up listener on unmount
  }, [householdId, householdName, navigation]);

  // Funktion til at søge efter en bruger baseret på e-mail
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
          text2: "An error occured during search.",
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

    // Tjek om brugeren allerede er medlem
    if (household.members && household.members[searchResult.id]) {
      Toast.show({
        type: "info",
        text1: "Info",
        text2: `${
          searchResult.displayName || searchResult.email
        } is allready a member of ${household.name}.`,
      });
      return;
    }

    // Brug set til at tilføje medlemmet
    const memberRef = ref(
      db,
      `households/${householdId}/members/${searchResult.id}`
    );

    set(memberRef, true)
      .then(() => {
        Toast.show({
          type: "success",
          text1: "Success",
          text2: `${
            searchResult.displayName || searchResult.email
          } has been added ${household.name}.`,
        });
        setSearchEmail("");
        setSearchResult(null);
      })
      .catch((error) => {
        console.error("Error adding user to household:", error);
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "An error ocurred when adding user.",
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
                  text2: `${userName} Has been removed ${householdName}.`,
                });
              })
              .catch((error) => {
                console.error("Error removing user from household:", error);
                Toast.show({
                  type: "error",
                  text1: "Error",
                  text2: "An error occured when removing the user.",
                });
              });
          },
        },
      ]
    );
  };

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
                <Text style={styles.searchButtonText}>Søg</Text>
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
       <Banner />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#FDFEFE",
  },
  sectionHeading: {
    fontSize: 20,
    fontWeight: "bold",
    marginVertical: 10,
    color: "#2E4053",
  },
  memberItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
    backgroundColor: "#D5F5E3",
    borderRadius: 8,
    marginBottom: 10,
  },
  memberText: {
    fontSize: 16,
    color: "#196F3D",
  },
  removeButton: {
    padding: 5,
  },
  addUserContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: "#D6EAF8",
    borderRadius: 8,
  },
  searchContainer: {
    flexDirection: "row",
    marginBottom: 10,
    alignItems: "center",
  },
  inputField: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#AAB7B8",
    padding: 10,
    borderRadius: 8,
    backgroundColor: "#EBF5FB",
  },
  searchButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2874A6",
    padding: 10,
    borderRadius: 8,
    marginLeft: 10,
  },
  searchButtonText: {
    color: "#fff",
    marginLeft: 5,
    fontSize: 16,
  },
  searchResultContainer: {
    padding: 10,
    backgroundColor: "#D4EFDF",
    borderRadius: 8,
  },
  resultText: {
    color: "#1E8449",
    fontSize: 16,
    marginBottom: 10,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#28B463",
    padding: 10,
    borderRadius: 8,
  },
  addButtonText: {
    color: "#fff",
    marginLeft: 5,
    fontSize: 16,
  },
  emptyText: {
    textAlign: "center",
    color: "#5D6D7E",
    fontSize: 16,
    marginTop: 10,
  },
});
