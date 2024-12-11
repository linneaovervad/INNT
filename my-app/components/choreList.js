// Vi bruger den nye Camera API fra Expo
import React, { useEffect, useState, useRef } from 'react';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { StatusBar } from 'expo-status-bar';
import { Button, StyleSheet, Text, TouchableOpacity, View, Image, SafeAreaView, TextInput, FlatList, Platform } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { ref, onValue, push, remove, update } from "firebase/database";
import * as FileSystem from 'expo-file-system';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function ChoreList({ database, navigation }) {
  const [chores, setChores] = useState([]);
  const [newChore, setNewChore] = useState("");
  const [assignedPerson, setAssignedPerson] = useState("");
  const [deadline, setDeadline] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [searchPerson, setSearchPerson] = useState("");
  const [filteredChores, setFilteredChores] = useState([]);

  const [showCamera, setShowCamera] = useState(false);

  // Ny API: Facing i stedet for type
  const [facing, setFacing] = useState('back');

  // Permissions via hook
  const [permission, requestPermission] = useCameraPermissions();
  const [loading, setLoading] = useState(false);
  
  const [currentImage, setCurrentImage] = useState("");
  const [base64Image, setBase64Image] = useState("");

  useEffect(() => {
    if (database) {
      const choresRef = ref(database, 'chores');
      onValue(choresRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const taskList = Object.keys(data).map(key => ({ id: key, ...data[key] }));
          setChores(taskList);
        } else {
          setChores([]);
        }
      });
    }
  }, [database]);

  useEffect(() => {
    if (searchPerson.trim() === "") {
      setFilteredChores(chores);
    } else {
      const filtered = chores.filter((chore) =>
        chore.assignedTo?.personName?.toLowerCase() === searchPerson.toLowerCase()
      );
      setFilteredChores(filtered);
    }
  }, [searchPerson, chores]);

  const addChore = () => {
    if (newChore.trim() === "" || assignedPerson.trim() === "") return;
    const choresRef = ref(database, 'chores');
    push(choresRef, {
      name: newChore,
      assignedTo: { personName: assignedPerson },
      deadline: deadline.toISOString().split('T')[0],
      completed: false,
      base64Image: base64Image,
    });
    setNewChore("");
    setAssignedPerson("");
    setDeadline(new Date()); 
  };

  const deleteChore = (id) => {
    const choreRef = ref(database, `chores/${id}`);
    remove(choreRef);
  };

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

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: 'center' }}>We need your permission to show the camera</Text>
        <Button onPress={requestPermission} title="grant permission" />
      </View>
    );
  }

  // Konverter billede til base64
  const convertImageToBase64 = async (fileUri) => {
    try {
      const base64Data = await FileSystem.readAsStringAsync(fileUri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      return base64Data;
    } catch (error) {
      console.error('Error converting image to base64:', error);
      return null;
    }
  };

  // Når et billede bliver taget, fanges det her via onMediaCaptured
  const handleMediaCaptured = async (media) => {
    setLoading(true);
    const base64 = await convertImageToBase64(media.uri);
    setCurrentImage(media.uri);
    setBase64Image(base64);
    setLoading(false);
    setShowCamera(false);
  };

  function toggleCameraFacing() {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  }

  return (
    showCamera
      ? <SafeAreaView style={styles.safeview}>
          <View style={styles.container}>
            {/* Ny API: CameraView i stedet for Camera */}
            <CameraView 
              style={styles.camera} 
              facing={facing}
              photo={true} 
              onMediaCaptured={handleMediaCaptured}
            >
              <View style={styles.buttonContainer}>
                <View style={{ flex: 1, alignSelf: 'flex-end' }}>
                  <TouchableOpacity style={styles.flipbtn} onPress={toggleCameraFacing}>
                    <Ionicons name="camera-reverse-outline" size={32} color="#fff" />
                  </TouchableOpacity>
                </View>
                {/* 
                  Bemærk: Den nye API viser ikke et dedikeret "tag billede"-kald.
                  onMediaCaptured kaldes automatisk, når et billede er taget.
                  Der er muligvis ændringer i fremtidige versioner af dokumentationen.
                */}
              </View>
            </CameraView>
          </View>
          <StatusBar style="light" />
        </SafeAreaView>
      : <View style={{ padding: 20 }}>
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
            <View style={{ width: "100%", height: 60, backgroundColor: "#FDEDEC", flexDirection: "row", borderRadius: 20, alignItems: 'center', borderColor: '#ccc', borderWidth: 1 }}>
              <Image
                source={{ uri: currentImage ? currentImage : null }}
                style={{ width: 50, height: 50, borderRadius: 10, marginLeft: 10, resizeMode: 'cover', borderColor: '#ccc' }}
              />
              <View style={{ flex: 1, justifyContent: "center", alignItems: "center", borderColor: '#ccc' }}>
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
  safeview: {
    backgroundColor: 'black',
    flex: 1,
    justifyContent: 'center',
    width: '100%',
  },
  flipbtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 100,
    padding: 5,
    alignSelf: 'baseline',
    justifyContent: 'center',
  },
});
