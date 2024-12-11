import * as React from 'react';
import { NavigationContainer} from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons'; 
import { useEffect, useState } from "react";
import { getApps, initializeApp } from "firebase/app"; 
import { getDatabase } from "firebase/database";  
import { StackNavigator } from '@react-navigation/stack';

//importer komponenter
import Home from './components/home'; 
import ChoreList from './components/choreList';
import TaskList from './components/taskList';
import People from './components/people';
import Settings from './components/settings'; 
import CalendarScreen from './components/calendar'; 

import ChatScreen from './components/ChatScreen';

//firebase konfiguration
const firebaseConfig = {
  apiKey: "AIzaSyDrVuiKoJ1R5IrJIBzFQxvNH5USGK7ECuY",
  authDomain: "innt-eksamen.firebaseapp.com",
  databaseURL: "https://innt-eksamen-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "innt-eksamen",
  storageBucket: "innt-eksamen.firebasestorage.app",
  messagingSenderId: "620504677187",
  appId: "1:620504677187:web:18666f1cf914cab8118df6"
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

  function LoggedInView() {
    return(
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
            } else if (route.name === 'Chat Bot') {
              iconName = 'chatbubble-ellipses'; 
            }
            else if (route.name === 'Task List') {
              iconName = 'camera'; 
            }
            return <Icon name={iconName} color={color} size={24} />;
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
        <Tab.Screen name="Chat Bot" component={ChatScreen} />
        <Tab.Screen name="Task List" component={TaskList} />
        <Tab.Screen name="People" component={People} />
        <Tab.Screen name="Settings" component={Settings} />
    

      </Tab.Navigator>
    </NavigationContainer>

    )

    function AuthView() {
      return(
        <NavigationContainer>
          <StackNavigator>
            
          </StackNavigator>

        </NavigationContainer>
      )
    }
  }

  return ( // Returner bundfanenavigationen med de forskellige skærme og ikoner
    <LoggedInView/>
  );
}
