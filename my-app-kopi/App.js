import * as React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import Icon from "react-native-vector-icons/Ionicons";
import { useEffect, useState } from "react";
import { getApps, initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth, onAuthStateChanged } from "firebase/auth";

import Home from "./components/home";
import ChoreList from "./components/choreList";
import TaskList from "./components/taskList";
import People from "./components/people";
import Settings from "./components/settings";
import CalendarScreen from "./components/calendar";
import ChatScreen from "./components/ChatScreen";

import LoginScreen from "./components/LoginScreen"; // Login screen
import SignUpScreen from "./components/SignUpScreen"; // Sign up screen

const firebaseConfig = {
  apiKey: "AIzaSyDLiVNtD57xdlD8jLqrZphGtTvXVLDvN4k",
  authDomain: "innt-database.firebaseapp.com",
  databaseURL:
    "https://innt-database-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "innt-database",
  storageBucket: "innt-database.firebasestorage.app",
  messagingSenderId: "877962403858",
  appId: "1:877962403858:web:3a9e7bb284068836bb78cb",
};

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

export default function App() {
  const [databaseInstance, setDatabaseInstance] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (getApps().length === 0) {
      const app = initializeApp(firebaseConfig);
      console.log("Firebase initialized!");
    }
    const db = getDatabase();
    setDatabaseInstance(db);

    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  if (loading) {
    return null; // Vis evt. en ActivityIndicator
  }

  if (!user) {
    // Hvis ingen bruger, vis login/opret bruger flow
    return (
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="SignUp" component={SignUpScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    );
  }

  function LoggedInView() {
    return (
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarIcon: ({ color, size }) => {
              let iconName;
              if (route.name === "Home") {
                iconName = "home-outline";
              } else if (route.name === "Calendar") {
                iconName = "calendar-outline";
              } else if (route.name === "Chore List") {
                iconName = "list-outline";
              } else if (route.name === "People") {
                iconName = "people-outline";
              } else if (route.name === "Settings") {
                iconName = "settings-outline";
              } else if (route.name === "Chat Bot") {
                iconName = "chatbubble-ellipses";
              } else if (route.name === "Task List") {
                iconName = "camera";
              }
              return <Icon name={iconName} size={size} color={color} />;
            },
            tabBarActiveTintColor: "lightblue",
            tabBarInactiveTintColor: "gray",
            headerTitle: user && user.displayName ? user.displayName : "App",
          })}
        >
          <Tab.Screen name="Home" component={Home} />
          <Tab.Screen name="Calendar">
            {(props) => (
              <CalendarScreen {...props} database={databaseInstance} />
            )}
          </Tab.Screen>
          <Tab.Screen name="Chore List">
            {(props) => <ChoreList {...props} database={databaseInstance} />}
          </Tab.Screen>
          <Tab.Screen name="Chat Bot" component={ChatScreen} />
          <Tab.Screen name="Task List" component={TaskList} />
          <Tab.Screen name="People" component={People} />
          <Tab.Screen name="Settings" component={Settings} />
        </Tab.Navigator>
      </NavigationContainer>
    );
  }

  return <LoggedInView />;
}
