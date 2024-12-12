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
import {
  ref,
  onValue,
  remove,
  update,
  query,
  orderByChild,
  equalTo,
} from "firebase/database";
import Ionicons from "react-native-vector-icons/Ionicons";
import Toast from "react-native-toast-message";

export default function Home() {
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enlargedImageId, setEnlargedImageId] = useState(null); 

  const userId = auth.currentUser ? auth.currentUser.uid : null;
  
  const toggleImageSize = (id) => {
    setEnlargedImageId(enlargedImageId === id ? null : id); // Toggle enlarged state
  };

  useEffect(() => {
    if (userId) {
      // Hent opgaver tildelt til den aktuelle bruger
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
 

      // Hent alle brugere for at matche `assignedTo` UID med `displayName`
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

      // Ryd op ved unmount
      return () => {
        unsubscribeChores();
        unsubscribeUsers();
      };
    }
  }, [userId]);

  const handleDelete = (taskId) => {
    Alert.alert(
      "Delete Chore",
      "Are you sure you want to delete this chore?",
      [
        { text: "Cancle", style: "cancel" },
        {
          text: "Yes",
          onPress: () => {
            const taskRef = ref(db, `chores/${taskId}`);
            remove(taskRef)
              .then(() => {
                Toast.show({
                  type: "success",
                  text1: "Succes",
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

  const toggleStatus = (taskId, currentStatus) => {
    const newStatus = !currentStatus; // Toggle mellem false og true
    const taskRef = ref(db, `chores/${taskId}`);
    update(taskRef, { completed: newStatus })
      .then(() => {
        Toast.show({
          type: "success",
          text1: "Succes",
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
          <Text style={[styles.taskTitle, item.completed && styles.taskDone]}>
            {item.name}
          </Text>
          <Text style={styles.taskDeadline}>Deadline: {item.deadline}</Text>
          <Text style={styles.taskAssigned}>
            Assigned to: {getUserName(item.assignedTo)}
          </Text>
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
            <Text>Description:  </Text>
            <Text>{item.description}</Text>
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
  choreImage: {
    width: 125,
    height: 175,
    marginTop: 10,
    borderRadius: 8,
    objectFit:"contain",
  },
  enlargedImage: {
    width: 300,
    height: 400,
  },
});
