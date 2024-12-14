import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
} from "react-native";
import { Calendar } from "react-native-calendars";
import { ref, onValue } from "firebase/database";
import { db } from "../firebase";
import Toast from "react-native-toast-message";
import Ionicons from "react-native-vector-icons/Ionicons";


export default function CalendarScreen({ route, navigation }) {
  const [markedDates, setMarkedDates] = useState({});
  const [selectedDate, setSelectedDate] = useState("");
  const [chores, setChores] = useState([]);
  const [choresForSelectedDate, setChoresForSelectedDate] = useState([]);
  const [enlargedImageId, setEnlargedImageId] = useState(null); 
  const [members, setMembers] = useState({}); 

  // Hent medlemmer fra databasen og opdater state
  useEffect(() => {
    const householdsRef = ref(db, `households`);
    const unsubscribe = onValue(householdsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const allMembers = {};
        Object.keys(data).forEach((householdKey) => {
          const household = data[householdKey];
          if (household.members) {
            Object.keys(household.members).forEach((userId) => {
              allMembers[userId] = {
                color: household.members[userId].color || "#FF5733",
                displayName: household.members[userId].displayName || "Unknown",
                email: household.members[userId].email || "",
              };
            });
          }
        });
        setMembers(allMembers);
      } else {
        setMembers({});
      }
    });

    return () => unsubscribe();
  }, []);

  // Hent opgaver fra databasen og opdater state
  useEffect(() => {
    const choresRef = ref(db, "chores");
    const unsubscribe = onValue(choresRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        updateChoresFromDatabase(data);
      } else {
        setMarkedDates({});
        setChores([]);
        setChoresForSelectedDate([]);
      }
    });

    return () => unsubscribe();
  }, [members]);

  // Funktion til at opdatere opgaver fra databasen
  const updateChoresFromDatabase = (data) => {
    const newMarkedDates = {};
    const allChores = [];
    Object.keys(data).forEach((key) => {
      const chore = data[key];
      // Tjek om opgaven er tildelt og om brugeren findes
      if (chore.assignedTo && members[chore.assignedTo]) {
        if (chore.deadline) {
          const userId = chore.assignedTo; 
          const color = members[userId].color || "#FF5733";
          // Formater deadline til 'YYYY-MM-DD'
          const deadlineDate = chore.deadline.split("T")[0];

          // Tilføj farvet prik til dato
          if (newMarkedDates[deadlineDate]) {
            if (!newMarkedDates[deadlineDate].dots) {
              newMarkedDates[deadlineDate].dots = [];
            }
            newMarkedDates[deadlineDate].dots.push({ color });
          } else {
            newMarkedDates[deadlineDate] = { dots: [{ color }] };
          }

          allChores.push({ ...chore, id: key, deadlineDate });
        }
      }
    });
    setMarkedDates(newMarkedDates);
    setChores(allChores);
    console.log("Marked Dates:", newMarkedDates); 
  };

  // Funktion til at håndtere valg af dato
  const handleDayPress = (day) => {
    setSelectedDate(day.dateString);
    const filteredChores = chores.filter(
      (chore) => chore.deadlineDate === day.dateString
    );
    setChoresForSelectedDate(filteredChores);
  };

  // Funktion til at vise billede i fuld størrelse
  const toggleImageSize = (id) => {
    setEnlargedImageId(enlargedImageId === id ? null : id); // Toggle mellem stort og småt billede
  };

  return (
    <View style={styles.container}>
      <Calendar
        onDayPress={handleDayPress}
        markedDates={{
          ...markedDates,
          [selectedDate]: {
            ...(markedDates[selectedDate] || {}),
            selected: true,
            selectedColor: "blue", 
          },
        }}
        markingType={"multi-dot"} // Flere prikker på samme dato
      />
      {selectedDate && (
        <View style={styles.choresContainer}> 
          <Text style={styles.choresTitle}>Chores for {selectedDate}:</Text> 

          {choresForSelectedDate.length > 0 ? ( 
            <FlatList
              data={choresForSelectedDate}
              keyExtractor={(item) => item.id} 
              renderItem={({ item }) => {
                const userId = item.assignedTo;
                const user = members[userId];
                const userColor = user ? user.color : "#000"; 

                return (
                  <View style={styles.choreItem}>
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
                        onPress={() => toggleImageSize(item.id)}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: "#fff",
  },
  choresContainer: {
    marginTop: 20,
  },
  choresTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  choreItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  choreHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  choreText: {
    fontSize: 16,
    color: "#333",
  },
  choreImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
    marginTop: 10,
  },
  enlargedImage: {
    width: 240, // 3 times larger
    height: 240, // 3 times larger
  },
  noChoresText: {
    fontSize: 16,
    color: "gray",
  },
  colorIndicator: {
    width: 15,
    height: 15,
    borderRadius: 7.5,
    marginRight: 10,
  },
});
