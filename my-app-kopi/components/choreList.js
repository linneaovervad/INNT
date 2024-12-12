// components/ChoreList.js
import React, { useEffect, useState, useRef } from "react";
import { CameraView } from "expo-camera";
import { StatusBar } from "expo-status-bar";
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
  Image,
  ActivityIndicator,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { ref, onValue, push, remove, update } from "firebase/database";
import * as FileSystem from "expo-file-system";
import DateTimePicker from "@react-native-community/datetimepicker";

export default function ChoreList({ database, navigation }) {
  const [chores, setChores] = useState([]);
  const [newChore, setNewChore] = useState("");
  const [assignedPerson, setAssignedPerson] = useState("");
  const [deadline, setDeadline] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [searchPerson, setSearchPerson] = useState("");
  const [filteredChores, setFilteredChores] = useState([]);
  const [showCamera, setShowCamera] = useState(false);
  const [type, setType] = useState("back");
  const [permission, setPermission] = useState(null);
  const [currentImage, setCurrentImage] = useState("");
  const [base64Image, setBase64Image] = useState("");
  const [loading, setLoading] = useState(false);
  const cameraRef = useRef();

  // Camera Permission
  useEffect(() => {
    const requestPermission = async () => {
      const { status } = await CameraView.requestCameraPermissionsAsync();
      setPermission(status === "granted");
    };
    requestPermission();
  }, []);

  // Database Hook
  useEffect(() => {
    if (database) {
      const choresRef = ref(database, "chores");
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
    if (searchPerson.trim() === "") {
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
      console.error("Error converting image to base64:", error);
      return null;
    }
  };

  // Take Picture
  const snap = async () => {
    if (!cameraRef.current) {
      console.log("Camera reference is not available");
      return;
    }

    setLoading(true);
    try {
      const result = await cameraRef.current.takePictureAsync();
      const base64 = await convertImageToBase64(result.uri);

      setCurrentImage(result.uri);
      setBase64Image(base64);
    } catch (error) {
      console.error("Error taking picture:", error);
    } finally {
      setLoading(false);
      setShowCamera(false);
    }
  };

  // Add Chore to Database
  const addChore = () => {
    if (!newChore.trim() || !assignedPerson.trim()) return;

    const choresRef = ref(database, "chores");
    push(choresRef, {
      name: newChore,
      assignedTo: { personName: assignedPerson },
      deadline: deadline.toISOString().split("T")[0],
      completed: false,
      base64Image,
    })
      .then(() => {
        setNewChore("");
        setAssignedPerson("");
        setDeadline(new Date());
        setBase64Image("");
      })
      .catch((error) => console.error("Error adding chore:", error));
  };

  // Delete Chore
  const deleteChore = (id) => {
    const choreRef = ref(database, `chores/${id}`);
    remove(choreRef).catch((error) =>
      console.error("Error deleting chore:", error)
    );
  };

  // Toggle Chore Completion
  const toggleCompleteChore = (id, currentStatus) => {
    const choreRef = ref(database, `chores/${id}`);
    update(choreRef, { completed: !currentStatus }).catch((error) =>
      console.error("Error updating chore status:", error)
    );
  };

  // Date Picker Change
  const onDateChange = (event, selectedDate) => {
    if (selectedDate) {
      setDeadline(selectedDate);
    }
    if (Platform.OS === "android") {
      setShowDatePicker(false);
    }
  };

  // Toggle Camera Type
  const toggleCameraType = () => {
    setType((current) => (current === "back" ? "front" : "back"));
  };

  // Permission Handling
  if (permission === null) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>
          We need your permission to access the camera
        </Text>
        <Button onPress={() => setPermission(true)} title="Give permission" />
      </View>
    );
  }

  // Render Camera or Chore List
  return showCamera ? (
    <SafeAreaView style={styles.safeview}>
      <CameraView style={styles.camera} type={type} ref={cameraRef}>
        <View style={styles.cameraButtonContainer}>
          <TouchableOpacity
            style={styles.flipButton}
            onPress={toggleCameraType}
          >
            <Ionicons name="camera-reverse-outline" size={32} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.snapButton}
            onPress={snap}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.snapButtonText}>Take picture</Text>
            )}
          </TouchableOpacity>
        </View>
      </CameraView>
    </SafeAreaView>
  ) : (
    <View style={styles.container}>
      <Text style={styles.heading}>New chore</Text>

      <TextInput
        placeholder="Add a new chore"
        value={newChore}
        onChangeText={setNewChore}
        style={styles.inputField}
      />

      <TextInput
        placeholder="Assigned to"
        value={assignedPerson}
        onChangeText={setAssignedPerson}
        style={styles.inputField}
      />

      <TouchableOpacity
        onPress={() => setShowDatePicker(true)}
        style={styles.datePickerButton}
      >
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

      {/* Take a Picture Button */}
      <TouchableOpacity
        onPress={() => setShowCamera(true)}
        style={styles.actionButton}
      >
        <Ionicons
          name="camera-outline"
          size={20}
          color="#fff"
          style={styles.buttonIcon}
        />
        <Text style={styles.actionButtonText}>Take a picture</Text>
      </TouchableOpacity>

      {/* Display Taken Image */}
      {currentImage ? (
        <Image
          source={{ uri: currentImage }}
          style={styles.takenImage}
          resizeMode="contain"
        />
      ) : null}

      {/* Add Chore Button */}
      <TouchableOpacity onPress={addChore} style={styles.actionButton}>
        <Ionicons
          name="add-circle-outline"
          size={20}
          color="#fff"
          style={styles.buttonIcon}
        />
        <Text style={styles.actionButtonText}>Add chore</Text>
      </TouchableOpacity>

      {/* Search by Name */}
      <TextInput
        placeholder="Search by name"
        value={searchPerson}
        onChangeText={setSearchPerson}
        style={styles.inputField}
      />

      {/* Chore List */}
      <FlatList
        data={filteredChores}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.choreItem}>
            <View style={styles.choreInfo}>
              <Text style={styles.choreName}>{item.name}</Text>
              <Text style={styles.choreAssigned}>
                Assigned to: {item.assignedTo?.personName}
              </Text>
              <Text style={styles.choreDeadline}>
                Deadline: {item.deadline}
              </Text>
            </View>
            <View style={styles.choreActions}>
              <TouchableOpacity
                onPress={() => toggleCompleteChore(item.id, item.completed)}
              >
                <Ionicons
                  name={item.completed ? "checkmark-circle" : "ellipse-outline"}
                  size={24}
                  color={item.completed ? "green" : "grey"}
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => deleteChore(item.id)}
                style={styles.deleteButton}
              >
                <Ionicons name="trash-outline" size={24} color="red" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  permissionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  permissionText: {
    textAlign: "center",
    marginBottom: 20,
    fontSize: 16,
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#FDEDEC",
  },
  heading: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#333",
  },
  inputField: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    marginBottom: 15,
    borderRadius: 8,
    backgroundColor: "#fff",
  },
  datePickerButton: {
    padding: 12,
    backgroundColor: "#fff",
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  dateText: {
    fontSize: 16,
    color: "#333",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#4CAF50",
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
    justifyContent: "center",
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 16,
    marginLeft: 8,
  },
  buttonIcon: {
    marginRight: 5,
  },
  takenImage: {
    width: "100%",
    height: 200,
    alignSelf: "center",
    marginBottom: 15,
    borderRadius: 8,
  },
  cameraButtonContainer: {
    flex: 1,
    backgroundColor: "transparent",
    flexDirection: "row",
    justifyContent: "space-between",
    margin: 20,
  },
  flipButton: {
    backgroundColor: "rgba(0,0,0,0.3)",
    padding: 10,
    borderRadius: 50,
  },
  snapButton: {
    backgroundColor: "rgba(0,0,0,0.3)",
    padding: 10,
    borderRadius: 50,
  },
  snapButtonText: {
    color: "#fff",
    fontSize: 16,
  },
  camera: {
    flex: 1,
  },
  safeview: {
    flex: 1,
  },
  choreItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    backgroundColor: "#fff",
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  choreInfo: {
    flex: 1,
  },
  choreName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  choreAssigned: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  choreDeadline: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  choreActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  deleteButton: {
    marginLeft: 15,
  },
});
