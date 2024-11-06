import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons'; 
import { useEffect, useState } from "react";
import { getApps, initializeApp } from "firebase/app"; 
import { getDatabase } from "firebase/database";  

//importer komponenter
import Home from './components/home'; 
import ChoreList from './components/choreList';
import TaskList from './components/taskList';
import People from './components/people';
import Settings from './components/settings'; 
import CalendarScreen from './components/calendar'; 

//firebase konfiguration
const firebaseConfig = {
  apiKey: "AIzaSyDB41ewpxTSTir14RDqVKKxpi4YMRxUox8",
  authDomain: "godkendelsesopgave-2-e168c.firebaseapp.com",
  databaseURL: "https://godkendelsesopgave-2-e168c-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "godkendelsesopgave-2-e168c",
  storageBucket: "godkendelsesopgave-2-e168c.appspot.com",
  messagingSenderId: "727843143579",
  appId: "1:727843143579:web:2113ec3671d192f00c6b3e"
};

const Tab = createBottomTabNavigator(); // Opret en bundfanenavigator

// App-komponenten er den primære komponent, der indeholder bundfanenavigationen
export default function App() {
  const [databaseInstance, setDatabaseInstance] = useState(null);

  useEffect(() => { // Initialiser Firebase og opret en databaseforbindelse
    if (getApps().length === 0) {
      const app = initializeApp(firebaseConfig);
      console.log("Firebase initialized!");
    }
    const db = getDatabase();
    setDatabaseInstance(db); 
  }, []);

  return ( // Returner bundfanenavigationen med de forskellige skærme og ikoner
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color, size }) => {
            let iconName;
            if (route.name === 'Home') {
              iconName = 'home-outline';
            } else if (route.name === 'Calendar') {
              iconName = 'calendar-outline'; 
            } else if (route.name === 'Chore List') {
              iconName = 'list-outline';
            } else if (route.name === 'People') {
              iconName = 'people-outline';
            } else if (route.name === 'Settings') {
              iconName = 'settings-outline'; 
            }
            else if (route.name === 'Task List') {
              iconName = 'camera'; 
            }
            return <Icon name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: 'lightblue',
          tabBarInactiveTintColor: 'gray',
        })}
      >
      
    
        <Tab.Screen name="Home" component={Home} />
        <Tab.Screen name="Calendar">
          {props => <CalendarScreen {...props} database={databaseInstance} />}
        </Tab.Screen>
  
        <Tab.Screen name="Chore List">
          {props => <ChoreList {...props} database={databaseInstance} />}
          
        </Tab.Screen>
        <Tab.Screen name="Task List" component={TaskList} />
        <Tab.Screen name="People" component={People} />
        <Tab.Screen name="Settings" component={Settings} />
    

      </Tab.Navigator>
    </NavigationContainer>
  );
}
