// Importerer nødvendige moduler og komponenter fra React, React Native og andre biblioteker
import React, { useState, useEffect } from "react";
import { View, Text, FlatList, Image, TouchableOpacity } from "react-native";
import { Calendar } from "react-native-calendars"; 
import { ref, onValue } from "firebase/database";
import { db } from "../firebase"; 
import Toast from "react-native-toast-message"; 
import styles from "../styles/CalendarStyles"; 

// Hovedkomponent for CalendarScreen
export default function CalendarScreen({ route, navigation }) {
  // State-variabler til at holde data
  const [markedDates, setMarkedDates] = useState({}); // Markerede datoer i kalenderen
  const [selectedDate, setSelectedDate] = useState(""); // Dato valgt af brugeren
  const [chores, setChores] = useState([]); // Liste over opgaver
  const [choresForSelectedDate, setChoresForSelectedDate] = useState([]); // Opgaver for den valgte dato
  const [enlargedImageId, setEnlargedImageId] = useState(null); // Håndtering af forstørret billede
  const [members, setMembers] = useState({}); // Husstandsmedlemmer

  // Hent medlemmer fra databasen og opdater state
  useEffect(() => {
    const householdsRef = ref(db, `households`); // Reference til "households" i databasen
    const unsubscribe = onValue(householdsRef, (snapshot) => { // Lytter efter ændringer i databasen
      const data = snapshot.val(); // Data fra databasen
      if (data) {
        const allMembers = {};
        Object.keys(data).forEach((householdKey) => { // Gennemgår alle husstande
          const household = data[householdKey];
          if (household.members) {
            // Henter og gemmer medlemmer med deres oplysninger
            Object.keys(household.members).forEach((userId) => { // Gennemgår alle medlemmer
              allMembers[userId] = {
                color: household.members[userId].color || "#FF5733",
                displayName: household.members[userId].displayName || "Unknown",
                email: household.members[userId].email || "",
              };
            });
          }
        });
        setMembers(allMembers); // Opdaterer medlemmer
      } else {
        setMembers({});
      }
    });

    return () => unsubscribe(); // Afmeld database-lytning, når komponenten unmountes
  }, []);

  // Hent opgaver fra databasen og opdater state
  useEffect(() => {
    const choresRef = ref(db, "chores"); // Reference til "chores" i databasen
    const unsubscribe = onValue(choresRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        updateChoresFromDatabase(data); // Opdater opgaver og markerede datoer
      } else {
        setMarkedDates({});
        setChores([]);
        setChoresForSelectedDate([]);
      }
    });

    return () => unsubscribe(); // Afmeld database-lytning, når komponenten unmountes
  }, [members]);

  // Funktion til at opdatere opgaver fra databasen
  const updateChoresFromDatabase = (data) => { // Data fra databasen
    const newMarkedDates = {};
    const allChores = [];
    Object.keys(data).forEach((key) => {
      const chore = data[key];
      if (chore.assignedTo && members[chore.assignedTo]) { // Hvis opgaven er tildelt et medlem
        if (chore.deadline) {
          const userId = chore.assignedTo;
          const color = members[userId].color || "#FF5733"; // Brugerens farve
          const deadlineDate = chore.deadline.split("T")[0]; // Formaterer dato

          // Tilføjer markerede datoer med farvede prikker
          if (newMarkedDates[deadlineDate]) {
            newMarkedDates[deadlineDate].dots.push({ color });
          } else {
            newMarkedDates[deadlineDate] = { dots: [{ color }] };
          }

          allChores.push({ ...chore, id: key, deadlineDate }); // Tilføjer opgave
        }
      }
    });
    setMarkedDates(newMarkedDates); // Opdaterer markerede datoer
    setChores(allChores); // Opdaterer opgaver
  };

  // Funktion til håndtering af valg af dato
  const handleDayPress = (day) => {
    setSelectedDate(day.dateString); // Opdaterer den valgte dato
    const filteredChores = chores.filter(
      (chore) => chore.deadlineDate === day.dateString
    );
    setChoresForSelectedDate(filteredChores); // Viser opgaver for den valgte dato
  };

  // Funktion til at vise eller skjule det forstørrede billede
  const toggleImageSize = (id) => {
    setEnlargedImageId(enlargedImageId === id ? null : id);
  };

  return (
    <View style={styles.container}>
      {/* Kalender med markerede datoer */}
      <Calendar
        onDayPress={handleDayPress} // Håndtering af dagvalg
        markedDates={{
          ...markedDates,
          [selectedDate]: {
            ...(markedDates[selectedDate] || {}),
            selected: true,
            selectedColor: "blue",
          },
        }}
        markingType={"multi-dot"} // Tillader flere prikker på en dato
      />
      {selectedDate && (
        <View style={styles.choresContainer}>
          {/* Titel for opgaver på den valgte dato */}
          <Text style={styles.choresTitle}>Chores for {selectedDate}:</Text>

          {choresForSelectedDate.length > 0 ? (
            <FlatList
              data={choresForSelectedDate} // Viser liste over opgaver
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => {
                const userId = item.assignedTo;
                const user = members[userId];
                const userColor = user ? user.color : "#000";

                return (
                  <View style={styles.choreItem}>
                    {/* Viser opgaveinformation */}
                    <View style={styles.choreHeader}>
                      <View
                        style={[
                          styles.colorIndicator,
                          { backgroundColor: userColor },
                        ]}
                      />
                      <Text style={styles.choreText}>Chore: {item.name}</Text>
                    </View>
                    <Text style={styles.choreText}>
                      Assigned to: {user ? user.displayName : "Unknown"}
                    </Text>
                    <Text style={styles.choreText}>
                      Status: {item.completed ? "Done" : "Not done"} 
                    </Text>
                    {item.picture ? (
                      <TouchableOpacity
                        onPress={() => toggleImageSize(item.id)} // Forstør billede
                      >
                        <Image
                          source={{
                            uri: `data:image/jpeg;base64,${item.picture}`,
                          }}
                          style={[
                            styles.choreImage,
                            enlargedImageId === item.id && styles.enlargedImage,
                          ]}
                        />
                      </TouchableOpacity>
                    ) : null}
                  </View>
                );
              }}
              style={styles.flatList} 
            />
          ) : (
            <Text style={styles.noChoresText}>No chores today</Text>
          )}
        </View>
      )}
      <Toast /> 
    </View>
  );
}
