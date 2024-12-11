import React, { useEffect, useState, useRef } from 'react';
import { CameraView } from 'expo-camera';
import { StatusBar } from 'expo-status-bar';
import {
  Button,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TextInput,
  FlatList,
  SafeAreaView,
  Platform,
  Image
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { ref, onValue, push, remove, update } from 'firebase/database';
import * as FileSystem from 'expo-file-system';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function ChoreList({ database, navigation }) {
  const [chores, setChores] = useState([]);
  const [newChore, setNewChore] = useState('');
  const [assignedPerson, setAssignedPerson] = useState('');
  const [deadline, setDeadline] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [searchPerson, setSearchPerson] = useState('');
  const [filteredChores, setFilteredChores] = useState([]);
  const [showCamera, setShowCamera] = useState(false);
  const [type, setType] = useState('back');
  const [permission, setPermission] = useState(null);
  const [currentImage, setCurrentImage] = useState('');
  const [base64Image, setBase64Image] = useState('');
  const [loading, setLoading] = useState(false);
  const cameraRef = useRef();

  // Camera Permission
  useEffect(() => {
    const requestPermission = async () => {
      const { status } = await CameraView.requestCameraPermissionsAsync();
      setPermission(status === 'granted');
    };
    requestPermission();
  }, []);

  // Database Hook
  useEffect(() => {
    if (database) {
      const choresRef = ref(database, 'chores');
      onValue(choresRef, (snapshot) => {
        const data = snapshot.val();
        const taskList = data
          ? Object.keys(data).map((key) => ({ id: key, ...data[key] }))
          : [];
        setChores(taskList);
      });
    }
  }, [database]);

  // Search and Filter Hook
  useEffect(() => {
    if (searchPerson.trim() === '') {
      setFilteredChores(chores);
    } else {
      const filtered = chores.filter(
        (chore) =>
          chore.assignedTo?.personName?.toLowerCase() ===
          searchPerson.toLowerCase()
      );
      setFilteredChores(filtered);
    }
  }, [searchPerson, chores]);

  // Convert Image to Base64
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

  // Take Picture
  const snap = async () => {
    if (!cameraRef.current) {
      console.log('Camera reference is not available');
      return;
    }

    setLoading(true);
    try {
      const result = await cameraRef.current.takePictureAsync();
      const base64 = await convertImageToBase64(result.uri);

      setCurrentImage(result.uri);
      setBase64Image(base64);
    } catch (error) {
      console.error('Error taking picture:', error);
    } finally {
      setLoading(false);
      setShowCamera(false);
    }
  };

  // Add Chore to Database
  const addChore = () => {
    if (!newChore.trim() || !assignedPerson.trim()) return;

    const choresRef = ref(database, 'chores');
    push(choresRef, {
      name: newChore,
      assignedTo: { personName: assignedPerson },
      deadline: deadline.toISOString().split('T')[0],
      completed: false,
      base64Image,
    })
      .then(() => {
        setNewChore('');
        setAssignedPerson('');
        setDeadline(new Date());
        setBase64Image('');
      })
      .catch((error) => console.error('Error adding chore:', error));
  };

  // Delete Chore
  const deleteChore = (id) => {
    const choreRef = ref(database, `chores/${id}`);
    remove(choreRef).catch((error) =>
      console.error('Error deleting chore:', error)
    );
  };

  // Toggle Chore Completion
  const toggleCompleteChore = (id, currentStatus) => {
    const choreRef = ref(database, `chores/${id}`);
    update(choreRef, { completed: !currentStatus }).catch((error) =>
      console.error('Error updating chore status:', error)
    );
  };

  // Date Picker Change
  const onDateChange = (event, selectedDate) => {
    if (selectedDate) {
      setDeadline(selectedDate);
    }
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
  };

  // Toggle Camera Type
  const toggleCameraType = () => {
    setType((current) => (current === 'back' ? 'front' : 'back'));
  };

  // Permission Handling
  if (permission === null) {
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: 'center' }}>
          We need your permission to show the camera
        </Text>
        <Button onPress={() => setPermission(true)} title="Grant Permission" />
      </View>
    );
  }

  // Render Camera or Chore List
  return showCamera ? (
    <SafeAreaView style={styles.safeview}>
      <CameraView style={styles.camera} type={type} ref={cameraRef}>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.flipbtn} onPress={toggleCameraType}>
            <Ionicons name="camera-reverse-outline" size={32} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.snapbtn} onPress={snap} disabled={loading}>
            <Text style={styles.text}>{loading ? "Loading..." : "Snap"}</Text>
          </TouchableOpacity>
        </View>
      </CameraView>
    </SafeAreaView>
  ) : (
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
        <Text style={styles.dateText}>
          Deadline: {deadline.toLocaleDateString()}
        </Text>
      </TouchableOpacity>

      {showDatePicker && (
        <DateTimePicker
          value={deadline}
          mode="date"
          display="default"
          onChange={onDateChange}
        />
      )}

      <TouchableOpacity onPress={() => setShowCamera(true)}>
        <Text>Take a Picture</Text>
      </TouchableOpacity>

      {currentImage ? (
        <Image
          source={{ uri: currentImage }}
          style={{ width: 200, height: 200, alignSelf: 'center', marginVertical: 10 }}
          resizeMode="contain"
        />
      ) : null}

      <Button title="Add Chore" onPress={addChore} />

      <TextInput
        placeholder="Search by name"
        value={searchPerson}
        onChangeText={setSearchPerson}
        style={styles.inputField}
      />

      <FlatList
        data={filteredChores}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 10, borderBottomWidth: 1 }}>
            <View>
              <Text>{item.name}</Text>
              <Text>{item.assignedTo?.personName}</Text>
              <Text>{item.deadline}</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <TouchableOpacity onPress={() => toggleCompleteChore(item.id, item.completed)}>
                <Ionicons
                  name={item.completed ? "checkmark-circle" : "ellipse-outline"}
                  size={24}
                  color={item.completed ? "green" : "grey"}
                />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => deleteChore(item.id)} style={{ marginLeft: 10 }}>
                <Text style={{ color: 'red' }}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
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
  },
  dateText: {
    fontSize: 16,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  safeview: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
  },
  snapbtn: {
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 50,
  },
  flipbtn: {
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 50,
  },
});