// App.js
import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import Ionicons from "react-native-vector-icons/Ionicons";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "./firebase";
import Toast from "react-native-toast-message";

// Importerer komponenter
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

const Tab = createBottomTabNavigator(); // Opretter en tab-navigator til bunden
const Stack = createStackNavigator(); // Opretter en stack-navigator til navigation mellem skærme

export default function App() {
  const [user, setUser] = useState(null); // Holder styr på den aktuelle bruger
  const [loading, setLoading] = useState(true); // Viser en loading-tilstand mens appen loader

  useEffect(() => {
    // Overvåger ændringer i brugerens autentifikationstilstand
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser); // Opdaterer brugeren hvis der logges ind/ud
      setLoading(false); // Stopper loading-tilstand når tilstanden er kendt
    });
    return unsubscribe; // Rydder op i listeneren når komponenten fjernes
  }, []);

  if (loading) return null; // Returnerer intet hvis appen stadig loader
 
  return (
    <NavigationContainer>
       {/* Viser enten appens hovedindhold eller login-skærme afhængigt af brugerens tilstand */}
      {user ? <AppStackNavigator /> : <AuthStackNavigator />}
      <Toast />
    </NavigationContainer>
  );
}

// Auth Stack Navigator håndterer login og registrering
function AuthStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
    </Stack.Navigator>
  );
}

// Håndtering af hovedindholdet af appen
function AppStackNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Main"
        component={MainTabNavigator}
        options={{ headerShown: false }}
      />
      {/* Navigerer til en specifik husholdningsdetaljeskærm */}
      <Stack.Screen
        name="HouseholdDetail"
        component={HouseholdDetail}
        options={({ route }) => ({ title: route.params.householdName })} // Dynamisk titel baseret på rute
      />
      {/* Navigerer til betalingsskærmen */}
      <Stack.Screen
        name="PaymentWebView"
        component={PaymentWebView}
        options={{ title: "Remove Ads" }}
      />
    </Stack.Navigator>
  );
}

// Håndterer bundnavigationen
function MainTabNavigator() {
  const [activeTab, setActiveTab] = useState(""); // Holder styr på den aktive fane

  return (
    <>
      {/* Viser banneret med dynamisk position afhængigt af den aktive fane */}
      <Banner
        style={
          activeTab === "Chat Bot"
            ? { top: 50, bottom: undefined } // Move banner to the top
            : { bottom: 80 } // Default position at the bottom
        }
      />
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color, size }) => {
            let iconName;
            if (route.name === "Chores") {
              iconName = "checkbox-outline";
            } else if (route.name === "Calendar") {
              iconName = "calendar-outline";
            } else if (route.name === "New Chore") {
              iconName = "list-outline";
            } else if (route.name === "Chat Bot") {
              iconName = "chatbubble-ellipses-outline";
            } else if (route.name === "Households") {
              iconName = "home-outline";
            } else if (route.name === "Settings") {
              iconName = "settings-outline";
            }
            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: "lightblue",
          tabBarInactiveTintColor: "gray",
          headerTitle: auth.currentUser.displayName || "App",
        })}
        screenListeners={{
          state: (e) => {
            const route = e.data.state.routes[e.data.state.index];
            setActiveTab(route.name); // Opdaterer den aktive fane
          },
        }}
      >
        {/* Tabs til hver skærm i appen */}
        <Tab.Screen name="Chores" component={Home} />
        <Tab.Screen name="Calendar">
          {(props) => <CalendarScreen {...props} database={db} />}
        </Tab.Screen>
        <Tab.Screen name="New Chore">
          {(props) => <ChoreList {...props} database={db} />}
        </Tab.Screen>
        <Tab.Screen name="Chat Bot" component={ChatScreen} />
        <Tab.Screen name="Households" component={HouseholdList} />
        <Tab.Screen name="Settings" component={Settings} />
      </Tab.Navigator>
    </>
  );
}
