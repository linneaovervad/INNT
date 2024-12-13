// App.js
import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import Ionicons from "react-native-vector-icons/Ionicons";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "./firebase";
import Toast from "react-native-toast-message";

// Importer komponenter
import Home from "./components/Home";
import ChoreList from "./components/ChoreList";
import Settings from "./components/Settings";
import CalendarScreen from "./components/Calendar";
import ChatScreen from "./components/ChatScreen";
import HouseholdList from "./components/HouseholdList";
import HouseholdDetail from "./components/HouseholdDetail";
import LoginScreen from "./components/LoginScreen";
import SignUpScreen from "./components/SignUpScreen";
import PaymentWebView from "./components/PaymentWebView";
import Banner from "./components/Banner";

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

  return (
    <NavigationContainer>
      {user ? <AppStackNavigator /> : <AuthStackNavigator />}
      <Toast />
    </NavigationContainer>
  );
}

// Auth Stack Navigator
function AuthStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
    </Stack.Navigator>
  );
}

// App Stack Navigator
function AppStackNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Go back"
        component={MainTabNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="HouseholdDetail"
        component={HouseholdDetail}
        options={({ route }) => ({ title: route.params.householdName })}
      />
      <Stack.Screen
        name="PaymentWebView"
        component={PaymentWebView}
        options={{ title: "Remove Ads" }}
      />
    </Stack.Navigator>
  );
}

// Definer MainTabNavigator
function MainTabNavigator() {
  return (
    <>
    <Banner/>
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
        headerTitle: auth.currentUser.displayName
          ? auth.currentUser.displayName
          : "App",
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
      <Tab.Screen name="Households" component={HouseholdList} />
      <Tab.Screen name="Settings" component={Settings} />
    </Tab.Navigator></>
  );
}


