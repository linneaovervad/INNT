// App.js
import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import Ionicons from "react-native-vector-icons/Ionicons";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "./firebase"; // Importer auth og db fra firebase.js
import Toast from 'react-native-toast-message'; // Importer Toast

// Importer dine komponenter
import Home from "./components/Home";
import ChoreList from "./components/ChoreList";
import TaskList from "./components/TaskList";
import Settings from "./components/Settings";
import CalendarScreen from "./components/Calendar";
import ChatScreen from "./components/ChatScreen";
import HouseholdList from "./components/HouseholdList"; // Importer HouseholdList
import HouseholdDetail from "./components/HouseholdDetail"; // Importer HouseholdDetail

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
        <Toast ref={(ref) => Toast.setRef(ref)} />
      </NavigationContainer>
    );
  }

  function LoggedInView() {
    return (
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen name="Main" component={MainTabNavigator} options={{ headerShown: false }} />
          <Stack.Screen name="HouseholdDetail" component={HouseholdDetail} options={({ route }) => ({ title: route.params.householdName })} />
        </Stack.Navigator>
        <Toast/>
      </NavigationContainer>
    );
  }

  return <LoggedInView />;
}

// Definer MainTabNavigator
function MainTabNavigator() {
  return (
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
          } else if (route.name === "Chat Bot") {
            iconName = "chatbubble-ellipses-outline";
          } else if (route.name === "Task List") {
            iconName = "people-outline";
          } else if (route.name === "Settings") {
            iconName = "settings-outline";
          } else if (route.name === "Households") {
            iconName = "home-sharp";
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "lightblue",
        tabBarInactiveTintColor: "gray",
        headerTitle: auth.currentUser.displayName ? auth.currentUser.displayName : "App",
      })}
    >
      <Tab.Screen name="Home" component={Home} />
      <Tab.Screen name="Calendar">
        {(props) => <CalendarScreen {...props} database={db} />}
      </Tab.Screen>
      <Tab.Screen name="Chore List">
        {(props) => <ChoreList {...props} database={db} />}
      </Tab.Screen>
      <Tab.Screen name="Chat Bot" component={ChatScreen} />
      <Tab.Screen name="Task List" component={TaskList} />
      <Tab.Screen name="Settings" component={Settings} />
      <Tab.Screen name="Households" component={HouseholdList} />
    </Tab.Navigator>
  );
}
