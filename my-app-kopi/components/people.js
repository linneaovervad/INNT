import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, Button, Alert, TouchableOpacity, TextInput } from 'react-native';

// Initialiserer en liste med roomies til brug i People-komponenten
const initialRoomies = [
  { id: '1', name: 'Linnea', relation: 'Roomie', avatar: 'https://randomuser.me/api/portraits/women/1.jpg' },
  { id: '2', name: 'Mikkel', relation: 'Roomie', avatar: 'https://randomuser.me/api/portraits/men/2.jpg' },
  { id: '3', name: 'Sophia', relation: 'Roomie', avatar: 'https://randomuser.me/api/portraits/women/3.jpg' },
  { id: '4', name: 'Oliver', relation: 'Roomie', avatar: 'https://randomuser.me/api/portraits/men/4.jpg' },
];

// People-komponenten viser en liste over roomies
export default function People() {
  const [roomies, setRoomies] = useState(initialRoomies); // Initialiserer roomies med initialRoomies
  const [newRoomieName, setNewRoomieName] = useState(''); // Initialiserer newRoomieName med en tom streng

  // Funktion til at tilføje en ny roomie
  const addRoomie = () => {
    if (newRoomieName.trim() === '') { // Tjek om navnet er tomt
      Alert.alert('Error', 'Please enter a name.');
      return;
    }

    // Randomly select
    const gender = Math.random() > 0.5 ? 'men' : 'women'; // Random vælg mellem mænd og kvinder
    const newRoomie = {
      id: (roomies.length + 1).toString(), // Generer en unik id
      name: newRoomieName, // Brugernavnet fra inputfeltet
      relation: 'Roomie',
      avatar: `https://randomuser.me/api/portraits/${gender}/${Math.floor(Math.random() * 99) + 1}.jpg`, // Generate a random avatar
    };

    //  Tilføj den nye roomie til listen
    setRoomies([...roomies, newRoomie]); // Brug spredning for at tilføje den nye roomie til listen
    Alert.alert('Success', `${newRoomie.name} has been added!`);
    setNewRoomieName(''); // Clear input felt
  };

  // Funktion til at slette en roomie
  const deleteRoomie = (id) => {
    setRoomies(roomies.filter((roomie) => roomie.id !== id));
    Alert.alert('Deleted', `Roomie has been deleted.`);
  };

  //  Returner JSX  til at vise listen over roomies
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Dit team</Text>
      
      <FlatList
        data={roomies}
        keyExtractor={(item) => item.id} // Brug id som nøgle
        renderItem={({ item }) => ( // Brug item til at vise roomie-information
          <View style={styles.card}>
            <Image source={{ uri: item.avatar }} style={styles.avatar} />
            <View style={styles.roomieInfo}> 
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.relation}>{item.relation}</Text>
            </View>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => deleteRoomie(item.id)} // Kald deleteRoomie-funktionen med roomie-id
            >
              <Text style={styles.deleteButtonText}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}
      />
      
      <TextInput
        style={styles.input}
        placeholder="Enter roomie's name"
        value={newRoomieName}
        onChangeText={setNewRoomieName}
      />

      <Button title="Add Roomie" onPress={addRoomie} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#FDEDEC',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  roomieInfo: {
    flex: 1, // Fyld resten af pladsen ved siden af avataren
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  relation: {
    fontSize: 14,
    color: '#666',
  },
  deleteButton: {
    backgroundColor: '#FF6347',
    padding: 3,
    borderRadius: 1,
  },
  deleteButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
});
