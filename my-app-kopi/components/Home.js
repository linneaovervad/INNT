// components/Home.js
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
} from "react-native";
import { auth, db } from "../firebase";
import { ref, onValue, remove, update, query, orderByChild, equalTo } from "firebase/database";
import Ionicons from "react-native-vector-icons/Ionicons";
import Toast from "react-native-toast-message";

export default function Home() {
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const userId = auth.currentUser ? auth.currentUser.uid : null;

  useEffect(() => {
    if (userId) {
      const choresRef = ref(db, 'chores');
      const userChoresQuery = query(choresRef, orderByChild('assignedTo'), equalTo(userId));

      const unsubscribeChores = onValue(userChoresQuery, (snapshot) => {
        const data = snapshot.val();
        const loadedTasks = data
          ? Object.keys(data).map((key) => ({
              id: key,
              ...data[key],
            }))
          : [];
        setTasks(loadedTasks);
        setLoading(false);
      }, (error) => {
        console.error("Error fetching tasks:", error);
        Toast.show({
          type: "error",
          text1: "Fejl",
          text2: "Kunne ikke hente opgaver.",
        });
        setLoading(false);
      });

      const usersRef = ref(db, 'users');
      const unsubscribeUsers = onValue(usersRef, (snapshot) => {
        const data = snapshot.val();
        const usersList = data
          ? Object.keys(data).map((key) => ({
              id: key,
              displayName: data[key].displayName,
            }))
          : [];
        setUsers(usersList);
      }, (error) => {
        console.error("Error fetching users:", error);
        Toast.show({
          type: "error",
          text1: "Fejl",
          text2: "Kunne ikke hente brugere.",
        });
      });

      // Clean up listeners on unmount
      return () => {
        unsubscribeChores();
        unsubscribeUsers();
      };
    }
  }, [userId]);

  const handleDelete = (taskId) => {
    Alert.alert(
      "Slet Opgave",
      "Er du sikker på, at du vil slette denne opgave?",
      [
        { text: "Annuller", style: "cancel" },
        {
          text: "Ja",
          onPress: () => {
            const taskRef = ref(db, `chores/${taskId}`);
            remove(taskRef)
              .then(() => {
                Toast.show({
                  type: "success",
                  text1: "Succes",
                  text2: "Opgave slettet.",
                });
              })
              .catch((error) => {
                console.error("Error deleting task:", error);
                Toast.show({
                  type: "error",
                  text1: "Fejl",
                  text2: "Kunne ikke slette opgaven.",
                });
              });
          },
        },
      ],
      { cancelable: false }
    );
  };

  const toggleStatus = (taskId, currentStatus) => {
    const newStatus = !currentStatus; // Toggle between false and true
    const taskRef = ref(db, `chores/${taskId}`);
    update(taskRef, { completed: newStatus })
      .then(() => {
        Toast.show({
          type: "success",
          text1: "Succes",
          text2: `Opgave markeret som ${newStatus ? "færdig" : "ikke færdig"}.`,
        });
      })
      .catch((error) => {
        console.error("Error updating task status:", error);
        Toast.show({
          type: "error",
          text1: "Fejl",
          text2: "Kunne ikke opdatere opgavens status.",
        });
      });
  };

  const getUserName = (userId) => {
    const user = users.find((u) => u.id === userId);
    return user ? user.displayName : "Unassigned";
  };

  const renderItem = ({ item }) => (
    <View style={styles.taskItem}>
      <View style={styles.taskInfo}>
        <TouchableOpacity onPress={() => toggleStatus(item.id, item.completed)}>
          <Ionicons
            name={item.completed ? "checkmark-circle" : "ellipse-outline"}
            size={24}
            color={item.completed ? "green" : "gray"}
            style={styles.icon}
          />
        </TouchableOpacity>
        <View style={styles.taskDetails}>
          <Text
            style={[
              styles.taskTitle,
              item.completed && styles.taskDone,
            ]}
          >
            {item.name}
          </Text>
          <Text style={styles.taskDeadline}>Deadline: {item.deadline}</Text>
          <Text style={styles.taskAssigned}>Tildelt til: {getUserName(item.assignedTo)}</Text>
          {item.picture ? (
            <Image
              source={{ uri: `data:image/jpeg;base64,${item.picture}` }}
              style={styles.taskImage}
              resizeMode="cover"
            />
          ) : (
            <Image
              source={require('../assets/placeholder.png')} // Sørg for at have en placeholder-billede i dine assets
              style={styles.taskImage}
              resizeMode="cover"
            />
          )}
        </View>
      </View>
      <TouchableOpacity onPress={() => handleDelete(item.id)}>
        <Ionicons name="trash-outline" size={24} color="red" />
      </TouchableOpacity>
    </View>
  );

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
          <Text style={styles.noTasksText}>Du har ingen opgaver.</Text>
        </View>
      ) : (
        <FlatList
          data={tasks.sort(
            (a, b) => new Date(b.deadline) - new Date(a.deadline)
          )}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#FDFEFE",
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  noTasksContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  noTasksText: {
    fontSize: 18,
    color: "gray",
  },
  listContainer: {
    paddingBottom: 20,
  },
  taskItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    backgroundColor: "#EBF5FB",
    borderRadius: 8,
    marginBottom: 10,
  },
  taskInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  icon: {
    marginRight: 10,
  },
  taskDetails: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2E4053",
  },
  taskDone: {
    textDecorationLine: "line-through",
    color: "gray",
  },
  taskDeadline: {
    fontSize: 14,
    color: "gray",
  },
  taskAssigned: {
    fontSize: 14,
    color: "gray",
  },
  taskImage: {
    width: 100,
    height: 100,
    marginTop: 10,
    borderRadius: 8,
  },
});
