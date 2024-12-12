import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, FlatList, Image, TouchableOpacity } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { ref, onValue } from 'firebase/database';
import { db } from '../firebase'; // Importer db fra firebase.js

export default function CalendarScreen() {
  const [markedDates, setMarkedDates] = useState({});
  const [selectedDate, setSelectedDate] = useState('');
  const [chores, setChores] = useState([]);
  const [choresForSelectedDate, setChoresForSelectedDate] = useState([]);
  const [enlargedImageId, setEnlargedImageId] = useState(null); // Track which image is enlarged

  const updateChoresFromDatabase = (data) => {
    const newMarkedDates = {};
    const allChores = [];
    Object.keys(data).forEach(key => {
      const chore = data[key];
      if (chore.deadline) {
        newMarkedDates[chore.deadline] = { marked: true, dotColor: 'red' };
        allChores.push({ ...chore, id: key });
      }
    });
    setMarkedDates(newMarkedDates);
    setChores(allChores);
  };

  useEffect(() => {
    const choresRef = ref(db, 'chores');
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
  }, []);

  const handleDayPress = (day) => {
    setSelectedDate(day.dateString);
    const filteredChores = chores.filter(chore => chore.deadline === day.dateString);
    setChoresForSelectedDate(filteredChores);
  };

  const toggleImageSize = (id) => {
    setEnlargedImageId(enlargedImageId === id ? null : id); // Toggle enlarged state
  };

  return (
    <View style={styles.container}>
      <Calendar
        onDayPress={handleDayPress}
        markedDates={{
          ...markedDates,
          [selectedDate]: {
            ...markedDates[selectedDate],
            selected: true,
            selectedColor: 'blue',
          },
        }}
      />

      {selectedDate && (
        <View style={styles.choresContainer}>
          <Text style={styles.choresTitle}>Chores for {selectedDate}:</Text>

          {choresForSelectedDate.length > 0 ? (
            <FlatList
              data={choresForSelectedDate}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={styles.choreItem}>
                  <Text style={styles.choreText}>Chore: {item.name}</Text>
                  <Text style={styles.choreText}>Assigend to: {item.assignedTo?.personName}</Text>
                  <Text style={styles.choreText}>
                    Status: {item.completed ? 'Done' : 'Not done'}
                  </Text>
                  {item.base64Image ? (
                    <TouchableOpacity onPress={() => toggleImageSize(item.id)}>
                      <Image
                        source={{ uri: `data:image/jpeg;base64,${item.base64Image}` }}
                        style={[
                          styles.choreImage,
                          enlargedImageId === item.id && styles.enlargedImage, // Conditional styling
                        ]}
                      />
                    </TouchableOpacity>
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
  enlargedImage: {
    width: 240, // 3 times larger
    height: 240, // 3 times larger
  },
  noChoresText: {
    fontSize: 16,
    color: 'gray',
  },
});
