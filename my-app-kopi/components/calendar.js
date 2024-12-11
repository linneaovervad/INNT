import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, FlatList, Image } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { ref, onValue } from 'firebase/database';

// Kalenderskærm til visning af opgaver på en bestemt dato
export default function CalendarScreen({ database }) {
  const [markedDates, setMarkedDates] = useState({}); // Markeret datoer, som virker ved at trykke på dem
  const [selectedDate, setSelectedDate] = useState(''); // Valgt dato fra kalenderen
  const [chores, setChores] = useState([]); // Alle opgaver fra databasen
  const [choresForSelectedDate, setChoresForSelectedDate] = useState([]); // Opgaver for den valgte dato

  // Funktion til at opdatere de markerede datoer og opgaver
  const updateChoresFromDatabase = (data) => {
    const newMarkedDates = {}; // Nye markerede datoer, som skal opdateres
    const allChores = [];  // Alle opgaver, som skal opdateres
    Object.keys(data).forEach(key => { // Gennemgå alle opgaver i databasen
      const chore = data[key]; // Hent opgave fra databasen
      if (chore.deadline) {   // Hvis opgaven har en deadline
        newMarkedDates[chore.deadline] = { marked: true, dotColor: 'red' }; // Marker datoen i kalenderen
        allChores.push({ ...chore, id: key }); // Tilføj opgaven til listen over alle opgaver
      }
    });
    setMarkedDates(newMarkedDates); // Opdater de markerede datoer
    setChores(allChores); // Opdater alle opgaver
  };

  // Lyt til opdateringer fra Firebase-databasen
  useEffect(() => {
    if (database) {
      const choresRef = ref(database, 'chores'); // Reference til 'chores'-databasen
      const unsubscribe = onValue(choresRef, (snapshot) => { // Lyt efter ændringer i databasen, snapshot er data fra databasen
        const data = snapshot.val(); // Hent data fra snapshot
        if (data) {
          updateChoresFromDatabase(data); // Opdater de markerede datoer og opgaver
        } else {
          setMarkedDates({}); // Ingen data, nulstil markerede datoer og opgaver
          setChores([]); // Ingen data, nulstil alle opgaver
          setChoresForSelectedDate([]); // Ingen data, nulstil opgaver for valgt dato
        }
      });

      return () => unsubscribe();
    }
  }, [database]);

  // Når en dato trykkes, find alle chores på den dato
  const handleDayPress = (day) => { // day indeholder information om den valgte dato
    setSelectedDate(day.dateString); // Gem valgt dato
    const filteredChores = chores.filter(chore => chore.deadline === day.dateString); // Filtrer opgaver på valgt dato
    setChoresForSelectedDate(filteredChores);
  };

  return (
    <View style={styles.container}>
      <Calendar
        onDayPress={handleDayPress}
        markedDates={markedDates}
      />



      {selectedDate && (
        // Vis opgaver for valgt dato
        <View style={styles.choresContainer}>
          <Text style={styles.choresTitle}>Opgaver for {selectedDate}:</Text>

          {choresForSelectedDate.length > 0 ? ( // Hvis der er opgaver på valgt dato
            <FlatList
              data={choresForSelectedDate}
              keyExtractor={(item) => item.id} // Unik nøgle for hver opgave
              renderItem={({ item }) => (
                <View style={styles.choreItem}>
                  <Text style={styles.choreText}>Chore: {item.name}</Text>
                  <Text style={styles.choreText}>Assigned to: {item.assignedTo?.personName}</Text>
                  <Text style={styles.choreText}>
                    Status: {item.completed ? 'Finshed' : 'Not finished'}
                  </Text>
                  {item.base64Image ? ( // Hvis der er et billede
                    <Image
                      source={{ uri: `data:image/jpeg;base64,${item.base64Image}` }}
                      style={styles.choreImage}
                    />
                  ) : null}
                </View>
              )}
            />
          ) : (
            <Text style={styles.noChoresText}>No chores today</Text>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#fff',
  },
  choresContainer: {
    marginTop: 20,
  },
  choresTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  choreItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  choreText: {
    fontSize: 16,
  },
  choreImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
    marginTop: 10,
  },
  noChoresText: {
    fontSize: 16,
    color: 'gray',
  },
});
