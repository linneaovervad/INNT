// App.js
import * as React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import Icon from "react-native-vector-icons/Ionicons";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "./firebase"; // Importer auth og db fra firebase.js

// Importer dine komponenter
import Home from "./components/home";
import ChoreList from "./components/choreList";
import TaskList from "./components/taskList";
import People from "./components/people";
import Settings from "./components/settings";
import CalendarScreen from "./components/calendar";
import ChatScreen from "./components/ChatScreen";

import LoginScreen from "./components/LoginScreen"; // Login screen
import SignUpScreen from "./components/SignUpScreen"; // Sign up screen

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Overvåg Auth state ændringer
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  if (loading) {
    // Vis evt. en ActivityIndicator eller en loading screen
    return null;
  }

  if (!user) {
    // Hvis ingen bruger er logget ind, vis login/opret bruger flow
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
            headerTitle: user.displayName ? user.displayName : "App",
          })}
        >
          <Tab.Screen name="Home" component={Home} />
          <Tab.Screen name="Calendar">
            {(props) => (
              <CalendarScreen {...props} database={db} />
            )}
          </Tab.Screen>
          <Tab.Screen name="Chore List">
            {(props) => <ChoreList {...props} database={db} />}
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
