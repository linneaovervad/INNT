import React, { useEffect, useState, useRef } from 'react';
import { Camera, CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { StatusBar } from 'expo-status-bar';
import {
  Button,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  TextInput,
  FlatList,
  SafeAreaView,
  Platform,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { ref, onValue, push, remove, update } from 'firebase/database';
import * as FileSystem from 'expo-file-system';
import DateTimePicker from '@react-native-community/datetimepicker';

// ChoreList Component
export default function ChoreList({ database, navigation }) {
  const [chores, setChores] = useState([]);
  const [newChore, setNewChore] = useState('');
  const [assignedPerson, setAssignedPerson] = useState('');
  const [deadline, setDeadline] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [searchPerson, setSearchPerson] = useState('');
  const [filteredChores, setFilteredChores] = useState([]);
  const [showCamera, setShowCamera] = useState(false);
  const [type, setType] = useState("front"); // Correct usage of CameraType
  const [currentImage, setCurrentImage] = useState('');
  const [base64Image, setBase64Image] = useState('');
  const cameraRef = useRef();

  const [ permission, setPermission ] = useState();

  useEffect(() => {
    const requestPermission = async () => {
      const permission = await Camera.requestCameraPermissionsAsync();
      setPermission(permission);
      console.log(permission)
    }
    requestPermission();
  }, []);
    


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

  const deleteChore = (id) => {
    const choreRef = ref(database, `chores/${id}`);
    remove(choreRef).catch((error) =>
      console.error('Error deleting chore:', error)
    );
  };

  const toggleCompleteChore = (id, currentStatus) => {
    const choreRef = ref(database, `chores/${id}`);
    update(choreRef, { completed: !currentStatus }).catch((error) =>
      console.error('Error updating chore status:', error)
    );
  };

  const onDateChange = (event, selectedDate) => {
    if (selectedDate) {
      setDeadline(selectedDate);
    }
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
  };

  const snap = async () => {
    if (!cameraRef.current) {
      console.log('No camera reference');
      return;
    }
    try {
      const result = await cameraRef.current.takePictureAsync();
      const base64 = await FileSystem.readAsStringAsync(result.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      setCurrentImage(result.uri);
      setBase64Image(base64);
      setShowCamera(false);
    } catch (error) {
      console.error('Error taking picture:', error);
    }
  };

  const toggleCameraType = () => {
    setType(
      (current) =>
        current === CameraType.back ? CameraType.front : CameraType.back
    );
  };

  if (!permission) return <View />;
  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: 'center' }}>
          We need your permission to show the camera
        </Text>
        <Button onPress={requestPermission} title="Grant Permission" />
      </View>
    );
  }

  return showCamera ? (
    <SafeAreaView style={styles.safeview}>
      <Camera style={styles.camera} type={type} ref={cameraRef}>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.flipbtn} onPress={toggleCameraType}>
            <Ionicons name="camera-reverse-outline" size={32} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.snapbtn} onPress={snap}>
            <Text style={styles.text}>Snap</Text>
          </TouchableOpacity>
        </View>
      </Camera>
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
          <View>
            <Text>{item.name}</Text>
            <Text>{item.assignedTo?.personName}</Text>
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
