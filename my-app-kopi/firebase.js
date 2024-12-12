// firebase.js
import { initializeApp, getApps, getApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage"; // Sørg for at have installeret dette

const firebaseConfig = {
  apiKey: "AIzaSyCueWm2L7Ri18xA9zM5bHn-9TaTNsF8Xxc",
  authDomain: "innt-chore.firebaseapp.com",
  databaseURL:
    "https://innt-chore-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "innt-chore",
  storageBucket: "innt-chore.firebasestorage.app",
  messagingSenderId: "1014946859893",
  appId: "1:1014946859893:web:34fd5f1807cac9266de13c",
};

// Initialiser Firebase App kun én gang
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialiser Auth med AsyncStorage persistence
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

// Initialiser Database
const db = getDatabase(app);

// Eksporter auth og db for at bruge dem i dine komponenter
export { auth, db };
