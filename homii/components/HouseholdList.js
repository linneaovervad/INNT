import React, { useEffect, useState } from "react"; // Importer React, useEffect og useState fra react
import { View, Text, TextInput, TouchableOpacity, FlatList, Alert, } from "react-native"; // Importer View, Text, TextInput, TouchableOpacity, FlatList og Alert fra react-native
import Ionicons from "react-native-vector-icons/Ionicons"; // Importer Ionicons fra react-native-vector-icons
import { ref, onValue, push, remove } from "firebase/database"; // Importer ref, onValue, push og remove fra firebase/database
import { db, auth } from "../firebase"; // Importer db og auth fra firebase
import Toast from "react-native-toast-message";  // Importer Toast fra react-native-toast-message
import styles from "../styles/HouseholdListStyles"; // Importer styles fra HouseholdListStyles


export default function HouseholdList({ navigation }) { // Funktion til at vise husholdningslisten
  const [households, setHouseholds] = useState([]);   // State til husholdninger
  const [newHousehold, setNewHousehold] = useState(""); // State til ny husholdning

  useEffect(() => {   // Effekt-hook, der kører ved komponentens montering eller opdatering
    const householdsRef = ref(db, "households");  // Opretter en reference til "households" noden i databasen
    const unsubscribe = onValue(householdsRef, (snapshot) => {  // Opsætter en realtime lytter til databasen
      const data = snapshot.val(); // Henter alle husholdningsdata fra snapshot som et objekt
      const householdList = data   // Hvis der er data tilgængelig
        ? Object.keys(data).map((key) => ({ id: key, ...data[key] })) // Mapper hver nøgle til et objekt med id og husholdningsdata
        : []; // Hvis der ikke er data, returner en tom liste
      setHouseholds(householdList); // Opdaterer tilstanden med listen over husholdninger
    });

    return () => unsubscribe(); // Returnerer en funktion, der afmelder lytteren når komponenten afmonteres
  }, []);

  // Funktion til at oprette en ny husholdning
  const createHousehold = () => { // Funktion til at oprette en ny husholdning
    if (!newHousehold.trim()) { // Hvis der ikke er indtastet en husholdningsnavn
      Toast.show({ // Vis en fejlmeddelelse
        type: "error",
        text1: "Error",
        text2: "Please enter a name for the household.",
      });
      return; // Afslut funktionen
    }

    const householdsRef = ref(db, "households"); // Opretter en reference til "households" noden i databasen
    push(householdsRef, { // Tilføj en ny husholdning til databasen
      name: newHousehold.trim(), // Husholdningsnavn
      members: { // Medlemmer af husholdningen
        [auth.currentUser.uid]: true, // Tilføj den aktuelle bruger som medlem
      },
    })
      .then(() => {   // Hvis husholdningen er oprettet
        setNewHousehold(""); // Nulstil inputfeltet
        Toast.show({ // Vis en succesmeddelelse
          type: "success", 
          text1: "Success", 
          text2: "Household created.",    // Besked om at husholdningen er oprettet
        });
      })
      .catch((error) => {   // Hvis der opstår en fejl
        console.error("Error creating household:", error); // Hvis der opstår en fejl, log fejlen
        Toast.show({ // Vis en fejlmeddelelse
          type: "error",
          text1: "Error",
          text2: "An error occured when creating the household.",
        });
      });
  };

  // Funktion til at slette en husholdning
  const deleteHousehold = (id) => { // Funktion til at slette en husholdning
    Alert.alert( // Vis en bekræftelsesdialog
      "Confirm deletion", // Titel
      "Are you sure you want to delete this household?", // Besked
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Yes",
          onPress: () => { // Hvis brugeren trykker på "Yes"
            const householdRef = ref(db, `households/${id}`); // Opretter en reference til den valgte husholdning
            remove(householdRef) // Slet husholdningen fra databasen
              .then(() => { // Hvis husholdningen er slettet
                Toast.show({ // Vis en succesmeddelelse
                  type: "success", // Succes
                  text1: "Success",
                  text2: "Household deleted.",
                });
              })
              .catch((error) => { // Hvis der opstår en fejl
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
  const renderHousehold = ({ item }) => ( // Funktion til at vise en husholdning
    <TouchableOpacity
      style={styles.householdItem} // Stil til husholdningslisten
      onPress={() => // Naviger til HouseholdDetail skærmen
        navigation.navigate("HouseholdDetail", { // Naviger til HouseholdDetail skærmen
          householdId: item.id, // Send husholdningsid til HouseholdDetail skærmen
          householdName: item.name, // Send husholdningsnavn til HouseholdDetail skærmen
        })
      }
    >
      <Text style={styles.householdName}>{item.name}</Text> 
      <TouchableOpacity
        onPress={() => deleteHousehold(item.id)} // Slet husholdning
        style={styles.deleteButton} // Stil til slet knap
      >
        <Ionicons name="trash-outline" size={24} color="red" /> 
      </TouchableOpacity> {/* Slet knap */}
    </TouchableOpacity> // Husholdningsliste
  );

  return (
    <View style={styles.container}> {/* Container */}
      <Text style={styles.heading}>Households</Text> {/* Overskrift */}

      {/* Opret en ny husholdning */}
      <View style={styles.createContainer}> {/* Container til oprettelse af ny husholdning */}
        <TextInput // Inputfelt til husholdningsnavn 
          placeholder="New household name" // Placeholder tekst (indtast husholdningsnavn)
          value={newHousehold} // Værdi (ny husholdning)
          onChangeText={setNewHousehold} // Opdater værdi (ny husholdning)
          style={styles.inputField} // Stil til inputfelt 
        />
        <TouchableOpacity onPress={createHousehold} style={styles.addButton}> {/* Opret knap */}
          <Ionicons name="add-circle-outline" size={24} color="#fff" /> 
          <Text style={styles.addButtonText}>Create</Text> 
        </TouchableOpacity> 
      </View>

      {/* Liste over husholdninger */}
      <FlatList
        data={households} // Husholdningsdata
        keyExtractor={(item) => item.id} // Unik nøgle til husholdning
        renderItem={renderHousehold} // Funktion til at vise husholdning
        ListEmptyComponent={ // Hvis der ikke er nogen husholdninger
          <Text style={styles.emptyText}>No households created.</Text> // Besked om ingen husholdninger
        }
      />

    </View>
  );
}
