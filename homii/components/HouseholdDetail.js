import React, { useEffect, useState } from "react"; // Importer React, useEffect og useState fra react
import { View, Text, TextInput, TouchableOpacity, FlatList, Alert, ActivityIndicator, } from "react-native"; // Importer View, Text, TextInput, TouchableOpacity, FlatList, Alert og ActivityIndicator fra react-native
import Ionicons from "react-native-vector-icons/Ionicons"; // Importer Ionicons fra react-native-vector-icons
import { ref, onValue, set, remove, get, query, orderByChild, equalTo, } from "firebase/database"; // Importer ref, onValue, set, remove, get, query, orderByChild, equalTo fra firebase/database
import { db } from "../firebase"; // Importer db fra firebase
import MemberItem from "./MemberItem"; // Importer MemberItem fra ./MemberItem
import Toast from "react-native-toast-message"; // Importer Toast fra react-native-toast-message
import styles from "../styles/HouseholdDetailStyles"; // Importer styles fra ../styles/HouseholdDetailStyles


export default function HouseholdDetail({ route, navigation }) { // Funktion til at vise husholdningsdetaljer
  const { householdId, householdName } = route.params; // Hent householdId og householdName fra route.params
  const [household, setHousehold] = useState(null); // State til husholdning
  const [searchEmail, setSearchEmail] = useState(""); // State til søgning efter email
  const [searchResult, setSearchResult] = useState(null); // State til søgeresultat
  const [loading, setLoading] = useState(false); // State til loading
  const [selectedColor, setSelectedColor] = useState(null); // State til valgt farve


  useEffect(() => { // Funktion til at hente husholdningsdata
    navigation.setOptions({ title: householdName }); // Sæt titel til householdName
    const householdRef = ref(db, `households/${householdId}`); // Hent husholdningsdata fra db
    const unsubscribe = onValue(householdRef, (snapshot) => { // Hvis der er data
      const data = snapshot.val(); // Hent data
      setHousehold(data); // Sæt husholdning
    });

    return () => unsubscribe(); // Returner unsubscribe
  }, [householdId, householdName, navigation]); // Hent husholdningsdata

//Funktion til at søge efter bruger via email
  const searchUserByEmail = () => { // Funktion til at søge efter bruger via email
    if (!searchEmail.trim()) { // Hvis der ikke er indtastet en email
      Toast.show({ // Vis fejlbesked
        type: "error",
        text1: "Error",
        text2: "Enter an email to search for.",
      });
      return;
    }

    const usersRef = ref(db, "users"); // Hent brugere fra db
    const userQuery = query( // Hent brugerdata
      usersRef, // Brugere
      orderByChild("email"), // Sorter efter email
      equalTo(searchEmail.trim().toLowerCase()) // Sammenlign med indtastet email
    );

    setLoading(true); // Aktiver loading-indikator, mens data hentes
    get(userQuery) // Udfør forespørgsel for at hente brugerdata
      .then((snapshot) => { // Når forespørgslen er fuldført
        setLoading(false); // Deaktiver loading-indikator
        if (snapshot.exists()) { // Kontroller, om der findes data i snapshot
          const data = snapshot.val(); // Hent data fra snapshot som et objekt
          const userId = Object.keys(data)[0]; // Ekstraher brugerens ID (første nøgle i objektet)
          setSearchResult({ id: userId, ...data[userId] }); // Gem søgeresultatet som et objekt med ID og brugerdata
          console.log(`Search found user:`, { id: userId, ...data[userId] }); // Log resultatet for debugging
        } else {
          setSearchResult(null); // Nulstil søgeresultatet
          Toast.show({
            type: "info",
            text1: "No results",
            text2: "No user found with this Email.",
          });
        }
      })
      .catch((error) => { // Hvis der opstår en fejl
        setLoading(false); // Deaktiver loading-indikator
        console.error("Error searching user:", error); // Log fejlbesked
        Toast.show({ // Vis fejlbesked
          type: "error",
          text1: "Error",
          text2: "An error occurred during search.",
        });
      });
  };

  // Funktion til at tilføje en bruger til husholdningen
  const addUserToHousehold = () => { // Funktion til at tilføje en bruger til husholdningen
    if (!searchResult) { // Hvis der ikke er fundet en bruger
      Toast.show({ // Vis fejlbesked
        type: "error",
        text1: "Error",
        text2: "No user to add.",
      });
      return;
    }

    if (!selectedColor) { // Hvis der ikke er valgt en farve
      Toast.show({ // Vis fejlbesked
        type: "error", 
        text1: "Error",
        text2: "Please select a color for the user.",
      });
      return;
    }

    // Tjek om brugeren allerede er medlem
    if (household.members && household.members[searchResult.id]) { // Hvis brugeren allerede er medlem
      Toast.show({ // Vis info-besked
        type: "info", 
        text1: "Info",
        text2: `${searchResult.displayName || searchResult.email} is already a member of ${household.name}.`,
      }); // Vis info-besked
      return;
    }

    // Brug set til at tilføje medlemmet med farve, displayName og email
    const memberRef = ref(
      db,
      `households/${householdId}/members/${searchResult.id}` // Reference til medlem i husholdningens database
    );
    set(memberRef, { // Tilføjer medlem til husholdningens medlemmer
      color: selectedColor, // Gem farve
      displayName: searchResult.displayName || "Unknown", // Gem displayName eller "Unknown"
      email: searchResult.email || "", // Gem email eller ""
    }) // Gem farve, displayName og email
      .then(() => { // Hvis medlemmet er tilføjet
        Toast.show({
          type: "success",
          text1: "Success",
          text2: `${searchResult.displayName || searchResult.email} has been added to ${household.name} with the selected color.`,
        });
        setSearchEmail(""); // Nulstil søgefeltet
        setSearchResult(null); // Nulstil søgeresultatet
        setSelectedColor(null); // Reset farvevalget efter tilføjelse
      })
      .catch((error) => { // Hvis der opstår en fejl
        console.error("Error adding user to household:", error); // Hvis der opstår en fejl
        Toast.show({ // Vis fejlbesked
          type: "error",
          text1: "Error",
          text2: "An error occurred when adding user.",
        });
      });
  };

  // Funktion til at fjerne en bruger fra husholdningen
  const removeUserFromHousehold = (userId, userName) => { 
    Alert.alert( // Vis bekræftelsesdialog til brugeren
      "Confirm deletion",
      `Are you sure you want to remove ${userName} from ${householdName}?`, // Spørg om brugeren er sikker på at fjerne medlemmet (vis medlemmets navn og husholdningens navn)
      [
        { text: "Cancel", style: "cancel" }, // Mulighed for at annullere handlingen uden at fjerne medlemmet
        {
          text: "Yes",
          onPress: () => { // Hvis brugeren bekræfter fjernelse af medlemmet (trykker på "Yes")
            const memberRef = ref(
              db,
              `households/${householdId}/members/${userId}` // Reference til medlem i husholdningens database
            );
            remove(memberRef) // Fjern medlem fra husholdningens medlemmer i databasen
              .then(() => { // Hvis medlemmet er fjernet fra husholdningen
                Toast.show({
                  type: "success", // Vis succesbesked 
                  text1: "Success",   
                  text2: `${userName} has been removed from ${householdName}.`, // Vis succesbesked
                });
              })
              .catch((error) => {
                console.error("Error removing user from household:", error); // Hvis der opstår en fejl
                Toast.show({ // Vis fejlbesked
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
  const availableColors = [ // Liste over tilgængelige farver
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
          <TextInput // Inputfelt til email
            placeholder="Search by Email" // Placeholder tekst
            value={searchEmail} // Værdi for søgefeltet
            onChangeText={setSearchEmail} // Opdater søgefeltet
            style={styles.inputField} // Inputfelt stil
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TouchableOpacity
            onPress={searchUserByEmail} // Søg efter bruger
            style={styles.searchButton} // Søg knap
          >
            {loading ? (
              <ActivityIndicator color="#fff" /> // Vis loading-indikator
            ) : (
              <>
                <Ionicons name="search-outline" size={24} color="#fff" />  
                <Text style={styles.searchButtonText}>Search</Text> 
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Vis søgeresultater */}
        {searchResult && ( // Kontroller, om der er et søgeresultat at vise
          <View style={styles.searchResultContainer}> 
            <Text style={styles.resultText}>
              User found:{" "} 
              {searchResult.displayName // Hvis der er et displayName, vis det
                ? `${searchResult.displayName} (${searchResult.email})` // Vis displayName og email
                : searchResult.email} 
            </Text>
            
            {/* Farvevalg */}
            <Text style={styles.colorLabel}>Select a color:</Text>
            <View style={styles.colorsContainer}> 
              {availableColors.map((color) => ( // Iterer gennem listen over tilgængelige farver
                <TouchableOpacity
                  key={color} // Unik nøgle for farvecirkel
                  style={[ // Stil for farvecirkel
                    styles.colorCircle, // Farvecirkel
                    { backgroundColor: color }, // Farve for farvecirkel
                    selectedColor === color && styles.selectedColorCircle, // Hvis farven er valgt, vis en anden stil
                  ]}
                  onPress={() => setSelectedColor(color)} // Vælg farve, når der trykkes på farvecirkel
                />
              ))}
            </View>

            <TouchableOpacity
              onPress={addUserToHousehold} // Tilføj bruger til husholdning 
              style={styles.addButton} // Tilføj knap
            >
              <Ionicons name="add-circle-outline" size={24} color="#fff" /> 
              <Text style={styles.addButtonText}>Add to household</Text> 
            </TouchableOpacity>
          </View>
        )}
      </View>
      <Text style={styles.sectionHeading}>Members</Text> 
      <FlatList
        data={household?.members ? Object.keys(household.members) : []} // Hent listen over medlemmer; hvis der ikke er medlemmer, returneres en tom liste
        keyExtractor={(item) => item} // Definer en unik nøgle for hvert medlem baseret på deres ID
        renderItem={({ item }) => ( // Render hvert medlem som et listeelement
          <MemberItem // Vis medlem som et listeelement
            userId={item} // Tilføj userId her
            householdId={householdId} // Tilføj householdId her 
            householdName={householdName} // Tilføj householdName her 
            removeUser={removeUserFromHousehold} // Fjern bruger fra husholdning
          />
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}> 
            No members in this household.
          </Text>
        }
      />
      <Toast />

    </View>
  );
}
