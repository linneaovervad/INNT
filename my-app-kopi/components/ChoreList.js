import React, { useEffect, useState, useRef, useCallback} from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TextInput,
  FlatList,
  Modal,
  Platform,
  SafeAreaView,
  Image,
  ActivityIndicator,
  Alert,
  ScrollView
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { ref, onValue, push, remove, update, set } from "firebase/database";
import DateTimePicker from "@react-native-community/datetimepicker";
import { CameraView, useCameraPermissions, Camera} from "expo-camera";
import * as FileSystem from "expo-file-system";
import Toast from "react-native-toast-message";
import styles from "../styles/ChoreListStyles.js"; 

export default function ChoreList({ database }) {
  const [chores, setChores] = useState([]);
  const [newChore, setNewChore] = useState("");
  const [assignedPerson, setAssignedPerson] = useState(null);
  const [repeatedChore, setRepeatedChore] = useState(null);
  const [householdMembers, setHouseholdMembers] = useState([]);
  const [deadline, setDeadline] = useState(new Date());
  const [description, setDescription] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showDropdownRepeat, setShowDropdownRepeat] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [type, setType] = useState("back");
  const [permission, requestPermission] = useCameraPermissions();
  const [currentImage, setCurrentImage] = useState("");
  const [base64Image, setBase64Image] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedInterval, setSelectedInterval] = useState(null);
  const [showDropdownAlgorithm, setShowDropdownAlgorithm] = useState(false);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState(null);
  const cameraRef = useRef();

  useEffect(() => {
    (async () => {
      // If permission is not determined, request it directly
      console.log(permission?.status)
      if (permission?.status === 'undetermined' || permission?.status ==="denied") {
        const result = await requestPermission();
        
        if (result.granted) {
          console.log("Camera permission granted");
        } else {
          Toast.show({
            type: 'error',
            text1: 'Camera Access Denied',
            text2: 'Please enable camera permissions in your device settings'
          });
        }
      }
    })();
  }, [permission?.status, requestPermission]);



  // Skift mellem front- og bagkamera
  const toggleCameraType = () => {
    setType((type) => (type === "back" ? "front" : "back"));
  };

  // Tag Billede
  const snap = async () => {
    if (!cameraRef.current) {
      console.log("Camera reference is not available");
      return;
    }

    setLoading(true);
    try {
      const result = await cameraRef.current.takePictureAsync({
        quality: 1, // Højeste kvalitet
        base64: true, // Få Base64-streng direkte
      });

      if (result.base64) {
        setCurrentImage(result.uri); // Gemmer billedets URI
        setBase64Image(result.base64); // Gemmer billedet som base64-streng
      } else {
        console.error("No base64 data returned from camera");
      }
    } catch (error) {
      console.error("Error taking picture:", error);
    } finally {
      setLoading(false);
      setShowCamera(false); // Lukker kameraet
    }
  };

 // Henter opgaver og husstandsmedlemmer fra databasen
  useEffect(() => {
    if (database) {
      const choresRef = ref(database, "chores");
      // Henter opgaver
      onValue(choresRef, (snapshot) => {
        const data = snapshot.val();
        const taskList = data
          ? Object.keys(data).map((key) => ({ id: key, ...data[key] }))
          : [];
        setChores(taskList);
      });

      const membersRef = ref(database, "users");
      // Henter medlemmer
      onValue(membersRef, (snapshot) => {
        const data = snapshot.val();
        const membersList = data
          ? Object.keys(data).map((key) => ({
            id: key,
            displayName: data[key].displayName,
          }))
          : [];
        setHouseholdMembers(membersList);
      });
    }
  }, [database]);

  // Tilføj en ny opgave
  const addChore = () => {
    if (!newChore.trim() || !assignedPerson) {
      Alert.alert("Error", "Please create a name for the chore and assign it to a person");
      return;
    }
  
    const choresRef = ref(database, 'chores');
    push(choresRef, {
      name: newChore,
      assignedTo: assignedPerson.id,
      // Valgfrie felter inkluderes kun hvis de er sat
      deadline: deadline ? deadline.toISOString() : null,
      completed: false, // Standardværdi
      picture: base64Image || null,
      description: description || null,
      repeatedChore: selectedInterval ? selectedInterval.label : null,
    })
      .then(() => {
        // Nulstil felter efter opgaven er gemt
        setNewChore("");
        setAssignedPerson(null);
        setDeadline(new Date());
        setDescription("");
        setCurrentImage("");
        setBase64Image("");
        setSelectedInterval(null);
        Toast.show({
          type: "success",
          text1: "Succes",
          text2: "Chore added!",
        });
      })
      .catch((error) => {
        console.error("Error adding chore:", error);
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "An error occured when adding a chore.",
        });
      });
  };
  

  // Håndter valg af dato i forhold til styresystem
  const onDateChange = (event, selectedDate) => {
    if (selectedDate) {
      setDeadline(selectedDate); // Opdater deadline
    }
    if (Platform.OS === "android") {
      setShowDatePicker(false); // Skjuler DatePicker
    }
  };

  const intervals = [
    { id: '0', label: 'No' },
    { id: '1', label: 'Daily' },
    { id: '2', label: 'Weekly' },
    { id: '3', label: 'Monthly' },
    { id: '4', label: '2 Months' },
    { id: '5', label: '3 Months' },
    { id: '6', label: '6 Months' },
  ];
  const handleSelectInterval = (item) => {
    setSelectedInterval(item);
    setShowDropdownRepeat(false);
  }

  const algorithm = [
    { id: '0', label: 'This is a one-time thing' },
    { id: '1', label: 'Always the same person' },
    { id: '2', label: 'Rotate between all members' },
    { id: '3', label: 'Always random selection' }
  ]

  const handleSelectAlgorithm = (item) => {
    setSelectedAlgorithm(item);
    setShowDropdownAlgorithm(false);
  }

  // Returner visning
  return showCamera ? (
    // Skærmen hvis Camera view == true (Viser kameraet)
    <SafeAreaView style={styles.safeview}>
      <CameraView style={styles.camera} facing={type} ref={cameraRef}>
        <View style={styles.cameraButtonContainer}>
          {/* {Knap til at skifte mellem front- og bagkamera } */}
          <TouchableOpacity
            style={styles.flipButton}
            onPress={toggleCameraType}
          >
            <Ionicons name="camera-reverse-outline" size={32} color="#fff" />
          </TouchableOpacity>
          {/* Knap til at tage billede */}
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
    // Skærmen hvis Camera view == false
    <ScrollView>
      <View style={styles.container}>
        <View style={styles.container}>
          <Text style={styles.heading}>New Chore</Text>
          {/* Input felt til navnet på opgaven */}
          <TextInput
            placeholder="Chore"
            value={newChore}
            onChangeText={setNewChore}
            style={styles.inputField}
          />
          {/* Dropdown til at vælge person */}
          <TouchableOpacity
            style={styles.dropdownButton}
            onPress={() => setShowDropdown(true)}
          >
            <Text style={styles.dropdownButtonText}>
              {assignedPerson?.displayName || "Select a person"}
            </Text>
            <Ionicons name="chevron-down-outline" size={20} color="#333" />
          </TouchableOpacity>
          <Modal
            transparent
            visible={showDropdown}
            animationType="slide"
            onRequestClose={() => setShowDropdown(false)}
          >
            <View style={styles.modalContainer}>
              <View style={styles.dropdownContainer}>
                <Text style={styles.dropdownTitle}>Select a person</Text>
                <FlatList
                  data={householdMembers}
                  keyExtractor={(item) => item.id}
                  ListHeaderComponent={
                    <TouchableOpacity
                      style={styles.dropdownItem}
                      onPress={() => {
                        setAssignedPerson({ id: "freeForAll", displayName: "FreeforAll" });
                        setShowDropdown(false);
                      }}
                    >
                      <Text style={styles.dropdownItemText}>Free for All</Text>
                    </TouchableOpacity>
                  }
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.dropdownItem}
                      onPress={() => {
                        setAssignedPerson(item);
                        setShowDropdown(false);
                      }}
                    >
                      <Text style={styles.dropdownItemText}>{item.displayName}</Text>
                    </TouchableOpacity>
                  )}
                />
              </View>
            </View>
          </Modal>
          {/* Dropdown til at vælge interval */}
          <TouchableOpacity
            style={styles.dropdownButton}
            onPress={() => setShowDropdownRepeat(true)}
          >
            <Text style={styles.dropdownButtonText}>
              {selectedInterval ? selectedInterval.label : "Repeat Chore?"}
            </Text>
            <Ionicons name="chevron-down-outline" size={20} color="#333" />
          </TouchableOpacity>

          <Modal
            transparent
            visible={showDropdownRepeat}
            animationType="slide"
            onRequestClose={() => setShowDropdownRepeat(false)}
          >
            <View style={styles.modalContainer}>
              <View style={styles.dropdownContainer}>
                <Text style={styles.dropdownTitle}>Select how often you want the task to repeat</Text>
                <FlatList
                  data={intervals}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.dropdownItem}
                      onPress={() => handleSelectInterval(item)}
                    >
                      <Text style={styles.dropdownItemText}>
                        {item.label}
                      </Text>
                    </TouchableOpacity>
                  )}
                />
              </View>
            </View>
          </Modal>
          {/* Dropdown til at vælge algoritme */}
          <TouchableOpacity
            style={styles.dropdownButton}
            onPress={() => setShowDropdownAlgorithm(true)}
          >
            <Text style={styles.dropdownButtonText}>
              {selectedAlgorithm ? selectedAlgorithm.label : "How to assign the chore?"}
            </Text>
            <Ionicons name="chevron-down-outline" size={20} color="#333" />
          </TouchableOpacity>
          <Modal
            transparent
            visible={showDropdownAlgorithm}
            animationType="slide"
            onRequestClose={() => setShowDropdownAlgorithm(false)}
          >
            <View style={styles.modalContainer}>
              <View style={styles.dropdownContainer}>
                <Text style={styles.dropdownTitle}>Select how you want to assign the chore</Text>
                <FlatList
                  data={algorithm}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.dropdownItem}
                      onPress={() => handleSelectAlgorithm(item)}
                    >
                      <Text style={styles.dropdownItemText}>
                        {item.label}
                      </Text>
                    </TouchableOpacity>
                  )}
                />
              </View>
            </View>
          </Modal>
          {/* Dato og tidspunkt for deadline */}
          <TouchableOpacity
            onPress={() => setShowDatePicker(true)}
            style={styles.datePickerButton}
          >
            <Text style={styles.dateText}>
              Deadline: {deadline.toLocaleString()}
            </Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={deadline}
              mode="datetime"
              display="default"
              onChange={onDateChange}
            />
          )}

          <TextInput
            placeholder="Description"
            value={description}
            onChangeText={setDescription}
            style={styles.description}
          />
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
          {/* Knap til at tilføje opgaven */}
          <TouchableOpacity onPress={addChore} style={styles.actionButton}>
            <Ionicons
              name="add-circle-outline"
              size={20}
              color="#fff"
              style={styles.buttonIcon}
            />
            <Text style={styles.actionButtonText}>Add Chore</Text>
          </TouchableOpacity>
          {/* Visning billede hvis brugeren har taget et*/}
          {currentImage ? (
            <Image
              source={{ uri: currentImage }}
              style={styles.takenImage}
              resizeMode="contain"
            />
          ) : null}
        </View>
      </View>
    </ScrollView>
  );
}

