import React, { useEffect, useState, useRef } from "react";
import { Text, TouchableOpacity, View, TextInput, FlatList, Modal, Platform, SafeAreaView, Image, ActivityIndicator, Alert, ScrollView } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { ref, onValue, push } from "firebase/database";
import DateTimePicker from "@react-native-community/datetimepicker";
import { CameraView, useCameraPermissions } from "expo-camera";
import Toast from "react-native-toast-message";
import styles from "../styles/NewChoreStyles.js"; 

// Hovedkomponent for NewChore
export default function NewChore({ database }) {
  const [chores, setChores] = useState([]);
  const [newChore, setNewChore] = useState("");
  const [assignedPerson, setAssignedPerson] = useState(null);
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

  // Tjekker om brugeren har givet tilladelse til kameraet
  useEffect(() => {
     // Asynkron funktion til at håndtere tilladelseskontrol
    (async () => { 
      console.log(permission?.status) // Logger den aktuelle status for kamera-tilladelsen

       // Hvis tilladelsen er 'udefineret' eller 'afvist'
      if (permission?.status === 'undetermined' || permission?.status ==="denied") {
        const result = await requestPermission(); // Anmoder om kamera-tilladelse

        if (result.granted) {
          // Hvis brugeren giver tilladelse
          console.log("Camera permission granted"); 
        } else {
          // Hvis brugeren afviser tilladelse
          Toast.show({
            type: 'error',
            text1: 'Camera Access Denied',
            text2: 'Please enable camera permissions in your device settings'  
          });
        }
      }
    })();
  }, [permission?.status, requestPermission]); // Funktion afhænger af ændringer i permission-status eller requestPermission-funktion



  // Skift mellem front- og bagkamera
  const toggleCameraType = () => {
    setType((type) => (type === "back" ? "front" : "back")); // Skifter kameraets retning
  };

  // Tag Billede
  const snap = async () => {
    if (!cameraRef.current) {
      console.log("Camera reference is not available"); // Logger fejl hvis kameraet ikke er tilgængeligt
      return;
    }

    setLoading(true); // Sætter loading til true mens billedet tages
    try {
      const result = await cameraRef.current.takePictureAsync({
        quality: 1, // Højeste kvalitet
        base64: true, // Få Base64-streng direkte
      });

      if (result.base64) {
        setCurrentImage(result.uri); // Gemmer billedets URI
        setBase64Image(result.base64); // Gemmer billedet som base64-streng
      } else {
        console.error("No base64 data returned from camera"); // Logger fejl hvis Base64 mangler
      }
    } catch (error) {
      console.error("Error taking picture:", error); // Logger fejl under billedtagning
    } finally {
      setLoading(false); // Stopper loading
      setShowCamera(false); // Lukker kameraet
    }
  };

 // Henter opgaver og husstandsmedlemmer fra databasen
  useEffect(() => {
    if (database) {
      const choresRef = ref(database, "chores"); // Reference til opgaver i databasen
      // Læs opgaver fra databasen
      onValue(choresRef, (snapshot) => {
        const data = snapshot.val();
        const taskList = data
          ? Object.keys(data).map((key) => ({ id: key, ...data[key] }))
          : [];
        setChores(taskList); // Sætter listen af opgaver
      });

      const membersRef = ref(database, "users"); // Reference til husstandsmedlemmer
      // Henter medlemmer fra databasen
      onValue(membersRef, (snapshot) => {
        const data = snapshot.val();
        const membersList = data
          ? Object.keys(data).map((key) => ({
            id: key,
            displayName: data[key].displayName,
          }))
          : [];
        setHouseholdMembers(membersList); // Sætter listen af medlemmer
      });
    }
  }, [database]); // Kører når databasen ændrer sig

  // Tilføj en ny opgave
  const addChore = () => {
    if (!newChore.trim() || !assignedPerson) {
      Alert.alert("Error", "Please create a name for the chore and assign it to a person"); // Fejl hvis input mangler
      return;
    }
  
    const choresRef = ref(database, 'chores'); // Reference til opgaver i databasen
    push(choresRef, {
      name: newChore,
      assignedTo: assignedPerson.id,
      // Valgfrie felter inkluderes kun hvis de er sat
      deadline: deadline ? deadline.toISOString() : null,
      completed: false, // Standardværdi
      picture: base64Image || null,
      description: description || null,
      repeatedChore: selectedInterval ? selectedInterval.label : null, // Interval for gentagelse
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
        // Succesmeddelelser
        Toast.show({
          type: "success",
          text1: "Succes",
          text2: "Chore added!",
        });
      })
      .catch((error) => {
        console.error("Error adding chore:", error);
        // Fejlmeddelelser
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "An error occured when adding a chore.",
        });
      });
  };
  
  // Håndterer ændringer i datoen
  const onDateChange = (event, selectedDate) => {
    if (selectedDate) {
      setDeadline(selectedDate); // Opdater deadline
    }
    if (Platform.OS === "android") {
      setShowDatePicker(false); // Skjuler DatePicker på Android
    }
  };

  // Interval for opgaver
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
    setSelectedInterval(item); // Sætter valgt interval
    setShowDropdownRepeat(false); // Lukker dropdown
  }
  // Algoritme for opgaver
  const algorithm = [
    { id: '0', label: 'This is a one-time thing' },
    { id: '1', label: 'Always the same person' },
    { id: '2', label: 'Rotate between all members' },
    { id: '3', label: 'Always random selection' }
  ]

  const handleSelectAlgorithm = (item) => {
    setSelectedAlgorithm(item); // Sætter valgt algoritme
    setShowDropdownAlgorithm(false); // Lukker dropdown
  }

  // Returnerer visning af kamera eller hovedskærm
  return showCamera ? (
    // Skærmen hvis Camera view == true (Viser kameraet)
    <SafeAreaView style={styles.safeview}>
      <CameraView style={styles.camera} facing={type} ref={cameraRef}>
        <View style={styles.cameraButtonContainer}>
          {/* {Knap til at skifte mellem front- og bagkamera } */}
          <TouchableOpacity
            style={styles.flipButton}
            onPress={toggleCameraType} // Funktion til at ændre kameraets retning
          >
            <Ionicons name="camera-reverse-outline" size={32} color="#fff" />
          </TouchableOpacity>
          {/* Knap til at tage billede */}
          <TouchableOpacity
            style={styles.snapButton}
            onPress={snap} // Funktion til at tage billede
            disabled={loading} // Deaktiveret mens kameraet er i gang
          >
            {loading ? (
              // Viser en loader, hvis billedet tages
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.snapButtonText}>Take picture</Text>
            )}
          </TouchableOpacity>
        </View>
      </CameraView>
    </SafeAreaView>
  ) : (
    // Skærmen hvis Camera view == false (hvis kameraet ikke er aktivt)
    <ScrollView>
      <View style={styles.container}>
        <View style={styles.container}>
          <Text style={styles.heading}>New Chore</Text>
          {/* Inputfelt til at skrive opgavens navn */}
          <TextInput
            placeholder="Chore" // Pladsholdertekst
            value={newChore} // Binder inputfelt til newChore state
            onChangeText={setNewChore} // Opdaterer newChore state ved ændringer
            style={styles.inputField} // Styling for inputfeltet
          />
          {/* Dropdown til at vælge person */}
          <TouchableOpacity
            style={styles.dropdownButton}
            onPress={() => setShowDropdown(true)} // Åbner dropdown-menu
          >
            <Text style={styles.dropdownButtonText}>
              {assignedPerson?.displayName || "Select a person"} 
            </Text>
            <Ionicons name="chevron-down-outline" size={20} color="#333" />
          </TouchableOpacity>
          {/* Modal til at vælge person fra en liste */}
          <Modal
            transparent
            visible={showDropdown} // Modal vises hvis showDropdown er true
            animationType="slide"
            onRequestClose={() => setShowDropdown(false)} // Lukker modal, hvis brugeren trykker udenfor
          > 
            <View style={styles.modalContainer}>
              <View style={styles.dropdownContainer}>
                <Text style={styles.dropdownTitle}>Select a person</Text>
                {/* Liste over husstandsmedlemmer */}
                <FlatList
                  data={householdMembers}
                  keyExtractor={(item) => item.id} // Unik nøgle for hvert medlem
                  ListHeaderComponent={
                    <TouchableOpacity
                      style={styles.dropdownItem}
                      onPress={() => {
                        setAssignedPerson({ id: "freeForAll", displayName: "FreeforAll" });
                        setShowDropdown(false); // Lukker dropdown
                      }}
                    >
                      <Text style={styles.dropdownItemText}>Free for All</Text>
                    </TouchableOpacity>
                  }
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.dropdownItem}
                      onPress={() => {
                        setAssignedPerson(item); // Vælger et medlem
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
           {/* Dropdown for gentagelsesinterval */}
          <TouchableOpacity
            style={styles.dropdownButton}
            onPress={() => setShowDropdownRepeat(true)} // Åbner gentagelsesinterval-menu
          >
            <Text style={styles.dropdownButtonText}>
              {selectedInterval ? selectedInterval.label : "Repeat Chore?"}
            </Text>
            <Ionicons name="chevron-down-outline" size={20} color="#333" />
          </TouchableOpacity>
          {/* Modal for gentagelsesinterval */}
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
                  data={intervals} // Data til gentagelsesinterval
                  keyExtractor={(item) => item.id} // Unik nøgle for hvert interval
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.dropdownItem}
                      onPress={() => handleSelectInterval(item)} // Vælger interval
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
          {/* Dropdown for opgavealgoritme */}
          <TouchableOpacity
            style={styles.dropdownButton}
            onPress={() => setShowDropdownAlgorithm(true)} // Åbner algoritme-menu
          >
            <Text style={styles.dropdownButtonText}>
              {selectedAlgorithm ? selectedAlgorithm.label : "How to assign the chore?"}
            </Text>
            <Ionicons name="chevron-down-outline" size={20} color="#333" />
          </TouchableOpacity>
          {/* Modal for algoritmevalg */}
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
          {/* Input til beskrivelse */}
          <TextInput
            placeholder="Description"
            value={description}
            onChangeText={setDescription}
            style={styles.description}
          />
          {/* Knap til at åbne kamera */}
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

