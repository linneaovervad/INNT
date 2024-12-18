import React, { useEffect, useState } from "react"; // Importer React, useEffect og useState fra react
import { View, Text, FlatList, TouchableOpacity, Alert, ActivityIndicator, Image, } from "react-native"; // Importer View, Text, FlatList, TouchableOpacity, Alert, ActivityIndicator og Image fra react-native
import { auth, db } from "../firebase"; // Importer auth og db fra firebase
import { ref, onValue, remove, update, query,orderByChild, equalTo, } from "firebase/database"; // Importer ref, onValue, remove, update, query, orderByChild, equalTo fra firebase/database
import Ionicons from "react-native-vector-icons/Ionicons";  // Importer Ionicons fra react-native-vector-icons      
import Toast from "react-native-toast-message"; // Importer Toast fra react-native-toast-message
import styles from "../styles/HomeStyles";  // Importer styles fra HomeStyles


export default function Home() { // Funktion til at vise hjem skærmen
  const [tasks, setTasks] = useState([]); // State til opgaver
  const [users, setUsers] = useState([]);  // State til brugere
  const [loading, setLoading] = useState(true); // State til at vise indlæsningsikon
  const [enlargedImageId, setEnlargedImageId] = useState(null); // State til at vise forstørret billede

  const userId = auth.currentUser ? auth.currentUser.uid : null; // Bruger ID (hvis bruger er logget ind (UID))
  
  //Funktion til at ændre billedets størrelse
  const toggleImageSize = (id) => { // Funktion til at ændre billedets størrelse
    setEnlargedImageId(enlargedImageId === id ? null : id); // Ændre billedets størrelse
  };

  // Hent opgaver fra databasen
  useEffect(() => { // Hent opgaver fra databasen
    if (userId) { // Hvis bruger ID
      const choresRef = ref(db, "chores"); // Reference til "chores" noden i databasen
      const userChoresQuery = query( // Opretter en forespørgsel for at hente specifikke opgaver relateret til brugere
        choresRef, // Opgaver reference 
        orderByChild("assignedTo"), // Sorter efter tildelt til
        equalTo(userId) // Lige med bruger ID
      );
      const unsubscribeChores = onValue( /// Opsætter en realtime lytter på forespørgslen for brugeropgaver
        userChoresQuery, // Forespørgsel for at hente brugerens opgaver fra databasen
        (snapshot) => { // Callback, der køres ved ændringer i databasen
          const data = snapshot.val();  // Henter alle data fra snapshot som et objekt
          const loadedTasks = data  // Hvis der er data, behandles opgaverne 
            ? Object.keys(data).map((key) => ({  // Mapper hver opgaves nøgle og tilhørende data til et objekt
                id: key, // Tildeler opgavens ID (nøgle)
                ...data[key], // Spreder de resterende datafelter til objektet
              }))
            : [];
          setTasks(loadedTasks); // Indlæste opgaver
          setLoading(false); // Indlæsning
        },
        (error) => { // Hvis der er en fejl
          console.error("Error fetching tasks:", error); // Konsol log fejl
          Toast.show({ // Vis fejlmeddelelse
            type: "error",  // Type fejl
            text1: "Error", 
            text2: "Couldn't get chores.",    
          });
          setLoading(false); // Indlæsning
        }
      );

      // Hent brugere fra databasen
      const usersRef = ref(db, "users"); // Brugere reference
      const unsubscribeUsers = onValue( // Afbestil brugere
        usersRef, // Brugere reference
        (snapshot) => { // Snapshot
          const data = snapshot.val(); //Henter alle data fra snapshot som et objekt 
          const usersList = data // Brugere liste
            ? Object.keys(data).map((key) => ({ // Hvis der er data, så map over data og returner nøgle og data
                id: key, 
                displayName: data[key].displayName, // Henter og tildeler brugerens navn fra dataobjektet
              }))
            : []; 
          setUsers(usersList); // Brugere liste
        },
        (error) => {
          console.error("Error fetching users:", error);
          Toast.show({
            type: "error",
            text1: "Error",
            text2: "Couldn't get users.",
          });
        }
      );

      // Ryd op ved afmontering af komponenten eller ændring af userId
      return () => { // Returnerer en funktion, der udføres ved oprydning
        unsubscribeChores();  // Stopper den realtime lytter for brugerens opgaver
        unsubscribeUsers();  // Stopper den realtime lytter for brugerliste
      };
    }
  }, [userId]); // Afhængighed af userId

  // Funktion til at slette en opgave
  const handleDelete = (taskId) => { // Funktion til at slette en opgave 
    Alert.alert( // Alert dialog
      "Delete Chore",
      "Are you sure you want to delete this chore?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Yes",
          onPress: () => { // Hvis brugeren trykker på "Yes" for at slette opgaven, så slettes opgaven
            const taskRef = ref(db, `chores/${taskId}`); // Reference til opgaven i databasen, som skal slettes
            remove(taskRef) // Fjern opgaven fra databasen, hvis brugeren bekræfter
              .then(() => { // Hvis opgaven er slettet, vis en succesmeddelelse
                Toast.show({
                  type: "success",
                  text1: "Success",
                  text2: "Chore deleted.",
                });
              })
              .catch((error) => { // Hvis der er en fejl ved sletning
                console.error("Error deleting task:", error); // Konsol log fejl 
                Toast.show({
                  type: "error",
                  text1: "Error",
                  text2: "Couldn't delete chore.",
                });
              });
          },
        },
      ],
      { cancelable: false }
    );
  };

  // Funkiton til at ændre status på en opgave
  const toggleStatus = (taskId, currentStatus) => { 
    const newStatus = !currentStatus; // Toggle mellem false og true
    const taskRef = ref(db, `chores/${taskId}`); // Reference til opgaven
    update(taskRef, { completed: newStatus }) // Opdater opgaven med ny status
      .then(() => {
        Toast.show({
          type: "success",
          text1: "Success",
          text2: `Chore marked as ${newStatus ? "Done" : "Not done"}.`,   // Besked om at opgaven er markeret som udført eller ikke udført
        });
      })
      .catch((error) => { // Hvis der er en fejl
        console.error("Error updating chore status:", error); // Konsol log fejl
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Couldn't update chore.",
        });
      });
  };

  // Funktion til at finde brugerens Display navn ud fra ID
  const getUserName = (userId) => { 
    const user = users.find((u) => u.id === userId); // Find bruger ud fra ID
    return user ? user.displayName : "Unassigned"; // Returner brugerens navn eller "Unassigned" hvis bruger ikke findes
  };

  // Funktion til at formatere deadline
  const renderItem = ({ item }) => { // Funktion til at formatere opgaver
    //Formater deadline 
    const deadlineDate = new Date(item.deadline); // Deadline dato
    const formattedDeadline = deadlineDate.toLocaleString([], {   // Formater deadline til dato og tid
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });

    // Vis opgaver
    return ( // Returnerer opgaver
      <View style={styles.taskItem}>  
        <View style={styles.taskInfo}>
          <TouchableOpacity onPress={() => toggleStatus(item.id, item.completed)}> 
            <Ionicons
              name={item.completed ? "checkmark-circle" : "ellipse-outline"} // Vis ikon afhængig af om opgaven er udført eller ej
              size={24}
              color={item.completed ? "green" : "gray"}
              style={styles.icon} 
            />
          </TouchableOpacity> 
          <View style={styles.taskDetails}>
            <Text style={[styles.taskTitle, item.completed && styles.taskDone]}> 
              {item.name}
            </Text>
            <Text style={styles.taskDeadline}>Deadline: {formattedDeadline}</Text> 
            <Text style={styles.taskAssigned}>
              Assigned to: {getUserName(item.assignedTo)}
            </Text>
            {item.description ? (
              <Text style={styles.taskDescription}>{item.description}</Text> // Vis beskrivelse hvis der er en
            ) : null}
            {item.picture ? (
              <TouchableOpacity onPress={() => toggleImageSize(item.id)}> 
                <Image
                  source={{ uri: `data:image/jpeg;base64,${item.picture}` }} // Vis billede
                  style={[ 
                    styles.choreImage,
                    enlargedImageId === item.id && styles.enlargedImage]}   // Forstørre billede
                  resizeMode="cover" // Dækker hele billede
                />
              </TouchableOpacity>
            ) : null} 
          </View>
        </View>
        <TouchableOpacity onPress={() => handleDelete(item.id)}>
          <Ionicons name="trash-outline" size={24} color="red" /> 
        </TouchableOpacity> 
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#28B463" /> 
      </View>
    );
  }

  return (
    <View style={styles.container}>  
      {tasks.length === 0 ? (
        <View style={styles.noTasksContainer}> 
          <Text style={styles.noTasksText}>You have no chores.</Text> 
        </View>
      ) : (
        <FlatList // Liste over opgaver
          data={tasks.sort(
            (a, b) => new Date(b.deadline) - new Date(a.deadline) // Sorter opgaver efter deadline
          )}
          keyExtractor={(item) => item.id} // Unik nøgle til hver opgave
          renderItem={renderItem} // Funktion til at formatere opgaver
          contentContainerStyle={styles.listContainer} // Stil til liste
        />
      )}
    </View>
  );
}


