// Vi bruger Legacy Camera API, da det er den eneste der virker i dette projekt. Den ny Camera API virker kun med Typescript
import React, { useEffect, useState, useRef } from 'react';
import { Camera, CameraType } from 'expo-camera/legacy';
import { StatusBar } from 'expo-status-bar';
import { Button, StyleSheet, Text, TouchableOpacity, View, Image, ScrollView, SafeAreaView, TextInput, FlatList, Platform } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { ref, onValue, push, remove, update } from "firebase/database";
import * as FileSystem from 'expo-file-system'; // Importer FileSystem fra expo-pakken
import DateTimePicker from '@react-native-community/datetimepicker'; // Importer DateTimePicker fra react-native-pakken

// Skærm til opgaver 
export default function ChoreList({ database, navigation }) {
  const [chores, setChores] = useState([]); // Opgaveliste
  const [newChore, setNewChore] = useState(""); // Ny opgave
  const [assignedPerson, setAssignedPerson] = useState(""); // Tildelt person
  const [deadline, setDeadline] = useState(new Date()); // Deadline er en dato
  const [showDatePicker, setShowDatePicker] = useState(false); // Viser datepickeren
  const [searchPerson, setSearchPerson] = useState(""); // Søg efter person
  const [filteredChores, setFilteredChores] = useState([]); // Filtreret liste

  const [showCamera, setShowCamera] = useState(false); // Viser kameraet

  // Camera reference
  useEffect(() => {
    if (database) {
      const choresRef = ref(database, 'chores'); // Reference til 'chores'-databasen
      onValue(choresRef, (snapshot) => {
        const data = snapshot.val(); // Hent data fra snapshot
        if (data) {
          const taskList = Object.keys(data).map(key => ({ id: key, ...data[key] })); // Konverter data til array
          setChores(taskList); // Opdater state med data
        } else {
          setChores([]);
        }
      });
    }
  }, [database]); // Kør kun når databasen ændres

  // Filtrer opgaverne baseret på søgning
  useEffect(() => {
    // Hvis søgefeltet er tomt, vis alle opgaver
    if (searchPerson.trim() === "") {
      setFilteredChores(chores);
    } else {
      const filtered = chores.filter((chore) =>
        chore.assignedTo?.personName?.toLowerCase() === searchPerson.toLowerCase() // Filtrer opgaver baseret på personens navn
      );
      setFilteredChores(filtered);
    }
  }, [searchPerson, chores]);

  // Tilføj en ny opgave
  const addChore = () => {
    if (newChore.trim() === "" || assignedPerson.trim() === "") return; // Hvis inputfelterne er tomme, returner
    const choresRef = ref(database, 'chores'); // Reference til 'chores'-databasen
    push(choresRef, { // Tilføj en ny opgave til databasen
      name: newChore,
      assignedTo: { personName: assignedPerson },
      deadline: deadline.toISOString().split('T')[0], // Gem deadline som YYYY-MM-DD format
      completed: false,
      base64Image: base64Image,
    });
    setNewChore("");
    setAssignedPerson("");
    setDeadline(new Date()); 
  };


  const deleteChore = (id) => {
    const choreRef = ref(database, `chores/${id}`);
    remove(choreRef); // Slet opgaven fra databasen, som også opdaterer Calendar.js
  };

  // Opdaterer status for en opgave
  const toggleCompleteChore = (id, currentStatus) => {
    const choreRef = ref(database, `chores/${id}`);
    update(choreRef, { completed: !currentStatus });
  };

  const onDateChange = (event, selectedDate) => {
    if (selectedDate) {
      setDeadline(selectedDate);
    }
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
  };

  //DEN NYE KAMERAFUNKTION
  //flyt op til toppen af filen
  const [type, setType] = useState(CameraType.back);
  const [permission, requestPermission] = Camera.useCameraPermissions();
  const [loading, setLoading] = useState(false);
  // Camera reference
  const cameraRef = useRef();

  // Camera state
  const [currentImage, setCurrentImage] = useState(""); 
  const [base64Image, setBase64Image] = useState(""); //kan også bruges til at gemme i databasen



  if (!permission) {
    // Camera permissions are still loading
    return <View />;
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: 'center' }}>We need your permission to show the camera</Text>
        <Button onPress={requestPermission} title="grant permission" />
      </View>
    );
  }

  // Koversion af billede til base64
  const convertImageToBase64 = async (fileUri) => { // Funktion til at konvertere billede til base64

    try {

      const base64Data = await FileSystem.readAsStringAsync(fileUri, { // Læs filen som en streng

        encoding: FileSystem.EncodingType.Base64, // Konverter til base64

      });

      console.log(base64Data);

      return base64Data; // Returner base64-data

    } catch (error) {

      console.error('Error converting image to base64:', error); // Hvis der opstår en fejl, log fejlen

      return null;

    }

  };

  // Laver snapshot, som er et billede taget med kameraet og konverterer det til base64 og sætter det i state og lukker kameraet ned igen 
  const snap = async () => {

    if (!cameraRef.current) {
      console.log("No camera ref");

      return;
    }
    setLoading(true);
    const result = await cameraRef.current.takePictureAsync(); // Tag et billede med kameraet og gem det i result
    const base64 = await convertImageToBase64(result.uri); // Konverter billede til base64
    setCurrentImage(result.uri);
    setBase64Image(base64);

    /* setImagesArr([...imagesArr,result]);
     setCurrentImage(result.uri);*/
    setLoading(false); // Sæt loading til false
    setShowCamera(false); // Luk kameraet

  };



  // Toggles
  // Toggles the camera type
  function toggleCameraType() { // Funktion til at skifte kameraet mellem front og back
    setType(current => (current === CameraType.back ? CameraType.front : CameraType.back)); 
  }
// Returner JSX til visning af opgaver
  return (

    showCamera
      ?
      <SafeAreaView style={styles.safeview}>
        <View style={styles.container}>
          <Camera style={styles.camera} type={type} ref={cameraRef}>
            <View style={styles.buttonContainer}>
              <View style={{ flex: 1, alignSelf: 'flex-end' }}>
                <TouchableOpacity style={styles.flipbtn} onPress={toggleCameraType}>
                  <Ionicons name="camera-reverse-outline" size="32" color="#fff" />
                </TouchableOpacity>
              </View>
              <View style={{ flex: 1, alignSelf: 'flex-end', }}>
                <TouchableOpacity style={styles.snapbtn} onPress={snap}>
                  <Text style={styles.text}>{loading ? "Loading..." : ""}</Text>
                </TouchableOpacity>
              </View>
              <View style={{ flex: 1, alignSelf: 'flex-end', }}>

              </View>
            </View>
          </Camera>

        </View>
        <StatusBar style="light" />
      </SafeAreaView>
      :
      <View style={{ padding: 20 }}>
        <Text style={{ fontSize: 20, marginBottom: 20 }}>Chore List</Text>

        <TextInput
          placeholder="Add a new chore"
          value={newChore}
          onChangeText={setNewChore}
          style={styles.inputField}
        />

        <TextInput
          placeholder="Assign to"
          value={assignedPerson}
          onChangeText={setAssignedPerson}
          style={styles.inputField}
        />

        <TouchableOpacity onPress={() => setShowDatePicker(true)}>
          <View style={styles.inputField}>
            <Text style={styles.dateText}>
              Deadline: {deadline.toLocaleDateString()}
            </Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setShowCamera(true)}>
          <View style={{ width: "100%", height: 60, backgroundColor: "#FDEDEC", flexDirection: "row", borderRadius: 20, alignItems: 'center', borderColor: '#ccc', borderWidth: 1, }}>
            <Image
              source={{ uri: currentImage ? currentImage : null }}
              style={{ width: 50, height: 50, borderRadius: 10, marginLeft: 10, resizeMode: 'cover', borderColor: '#ccc', }}
            />
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center", borderColor: '#ccc', }}>
              <Text style={{ color: "black", textAlign: "center", fontSize: 13, fontWeight: 'bold', borderColor: '#ccc' }}>Take a picture</Text>
            </View>
          </View>
        </TouchableOpacity>


        {showDatePicker && (
          <DateTimePicker
            value={deadline}
            mode="date"
            display="default"
            onChange={onDateChange}
          />
        )}


        <Button title="Add Chore" onPress={addChore} />

        <TextInput
          placeholder="Search by name"
          value={searchPerson}
          onChangeText={setSearchPerson}
          style={styles.inputField}
        />
      
        {filteredChores.length > 0 ? (
          <FlatList
            data={filteredChores}
            keyExtractor={(item) => item.id || item.key}
            renderItem={({ item }) => (
              <View style={{ padding: 10, borderBottomWidth: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View>
                  <Text style={{ color: item.completed ? 'lightgray' : 'black' }}>Chore: {item.name || "Ingen opgave"}</Text> 
                  <Text style={{ color: item.completed ? 'lightgray' : 'black' }}>Assigned to: {item.assignedTo?.personName || "Ingen tildelt"}</Text>
                  <Text style={{ color: 'gray' }}>Deadline: {item.deadline || "Ingen deadline"}</Text>
                </View>

              
                <TouchableOpacity onPress={() => toggleCompleteChore(item.id, item.completed)}>
                  {item.completed ? (
                    <Ionicons name="checkmark-circle" size={24} color="rgba(0, 128, 0, 0.5)" />
                  ) : (
                    <Ionicons name="ellipse-outline" size={24} color="grey" />
                  )}
                </TouchableOpacity>

                    {/* Her kunne man i stedet sætte image under en  TouchableOpacity med en funktionlitet, som sender det til en image screen (kan ske ved vider*/}
                <TouchableOpacity onPress={() => navigation.navigate('Task List', { image: item.base64Image })}>
                  <Image
                    source={{ uri: `data:image/jpeg;base64,${item.base64Image}` }}
                    style={{ width: 50, height: 80 }}
                  />
                </TouchableOpacity>

                <TouchableOpacity onPress={() => deleteChore(item.id)}>
                  <Text style={{ color: 'red' }}>Delete</Text>
                </TouchableOpacity>
              </View>
            )}
          />
        ) : (
          <Text>No chores found for {searchPerson}</Text>
        )}
      </View>

  );
}

const styles = StyleSheet.create({
  inputField: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
    backgroundColor: '#FDEDEC',
  },
  dateText: {
    fontSize: 16,
    color: '#333',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    width: '100%',
    marginTop: 0,
    borderRadius: 20,
    backgroundColor: 'black',
    overflow: 'hidden',

  },
  camera: {
    flex: 1,
    overflow: 'hidden',
    width: '100%',
    flexDirection: 'column',
    justifyContent: 'flex-end',
  },
  buttonContainer: {
    flexDirection: 'row',
    backgroundColor: 'transparent',
    margin: 32,
    alignSelf: 'center',
  },

  text: {
    fontSize: 16,
    fontWeight: 'semibold',
    color: 'white',
    alignSelf: 'center',
  },
  buttonGallery: {
    fontSize: 15,
    color: "white",
    padding: 10,
    borderRadius: 10,
    alignSelf: 'center',
  },
  gallery: {
    flex: 0.2,
    paddingTop: 10,
    width: "100%",
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'black',
  },
  safeview: {
    backgroundColor: 'black',
    flex: 1,
    justifyContent: 'center',
    width: '100%',
  },
  snapbtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    height: 80,
    width: 80,
    borderRadius: 100,
    padding: 10,
    margin: 5,
    alignSelf: 'center',
    borderWidth: 4,
    borderColor: 'white',
    justifyContent: 'center',
  },
  flipbtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 100,

    padding: 5,
    alignSelf: 'baseline',
    justifyContent: 'center',
  },
  gallerybtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 100,
    padding: 5,
    alignSelf: 'flex-end',
    justifyContent: 'center',
  },
});