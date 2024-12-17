import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, Alert, ActivityIndicator, Image, } from "react-native";
import { auth, db } from "../firebase";
import { ref, onValue, remove, update, query,orderByChild, equalTo, } from "firebase/database";
import Ionicons from "react-native-vector-icons/Ionicons";
import Toast from "react-native-toast-message";
import styles from "../styles/HomeStyles"; 


export default function Home() {
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enlargedImageId, setEnlargedImageId] = useState(null); 

  const userId = auth.currentUser ? auth.currentUser.uid : null;
  
  //Funktion til at ændre billedets størrelse
  const toggleImageSize = (id) => {
    setEnlargedImageId(enlargedImageId === id ? null : id); 
  };

  // Hent opgaver fra databasen
  useEffect(() => {
    if (userId) {
      const choresRef = ref(db, "chores");
      const userChoresQuery = query(
        choresRef,
        orderByChild("assignedTo"),
        equalTo(userId)
      );
      const unsubscribeChores = onValue(
        userChoresQuery,
        (snapshot) => {
          const data = snapshot.val();
          const loadedTasks = data
            ? Object.keys(data).map((key) => ({
                id: key,
                ...data[key],
              }))
            : [];
          setTasks(loadedTasks);
          setLoading(false);
        },
        (error) => {
          console.error("Error fetching tasks:", error);
          Toast.show({
            type: "error",
            text1: "Error",
            text2: "Couldn't get chores.",
          });
          setLoading(false);
        }
      );

      // Hent brugere fra databasen
      const usersRef = ref(db, "users");
      const unsubscribeUsers = onValue(
        usersRef,
        (snapshot) => {
          const data = snapshot.val();
          const usersList = data
            ? Object.keys(data).map((key) => ({
                id: key,
                displayName: data[key].displayName,
              }))
            : [];
          setUsers(usersList);
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

      // Clean up
      return () => {
        unsubscribeChores();
        unsubscribeUsers();
      };
    }
  }, [userId]);

  // Funktion til at slette en opgave
  const handleDelete = (taskId) => {
    Alert.alert(
      "Delete Chore",
      "Are you sure you want to delete this chore?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Yes",
          onPress: () => {
            const taskRef = ref(db, `chores/${taskId}`);
            remove(taskRef)
              .then(() => {
                Toast.show({
                  type: "success",
                  text1: "Success",
                  text2: "Chore deleted.",
                });
              })
              .catch((error) => {
                console.error("Error deleting task:", error);
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
    const taskRef = ref(db, `chores/${taskId}`);
    update(taskRef, { completed: newStatus })
      .then(() => {
        Toast.show({
          type: "success",
          text1: "Success",
          text2: `Chore marked as ${newStatus ? "Done" : "Not done"}.`,
        });
      })
      .catch((error) => {
        console.error("Error updating chore status:", error);
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Couldn't update chore.",
        });
      });
  };

  // Funktion til at finde brugerens Display navn ud fra ID
  const getUserName = (userId) => {
    const user = users.find((u) => u.id === userId);
    return user ? user.displayName : "Unassigned";
  };

  // Funktion til at formatere deadline
  const renderItem = ({ item }) => {
    //Formater deadline
    const deadlineDate = new Date(item.deadline);
    const formattedDeadline = deadlineDate.toLocaleString([], {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });

    // Vis opgaver
    return (
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
            <Text style={[styles.taskTitle, item.completed && styles.taskDone]}>
              {item.name}
            </Text>
            <Text style={styles.taskDeadline}>Deadline: {formattedDeadline}</Text>
            <Text style={styles.taskAssigned}>
              Assigned to: {getUserName(item.assignedTo)}
            </Text>
            {item.description ? (
              <Text style={styles.taskDescription}>{item.description}</Text>
            ) : null}
            {item.picture ? (
              <TouchableOpacity onPress={() => toggleImageSize(item.id)}>
                <Image
                  source={{ uri: `data:image/jpeg;base64,${item.picture}` }}
                  style={[
                    styles.choreImage,
                    enlargedImageId === item.id && styles.enlargedImage]}
                  resizeMode="cover"
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


