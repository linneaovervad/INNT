// firebase.js
import { initializeApp, getApps, getApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage"; // Sørg for at have installeret dette

// Din Firebase-konfiguration
const firebaseConfig = {
  apiKey: "AIzaSyDLiVNtD57xdlD8jLqrZphGtTvXVLDvN4k",
  authDomain: "innt-database.firebaseapp.com",
  databaseURL: "https://innt-database-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "innt-database",
  storageBucket: "innt-database.firebasestorage.app",
  messagingSenderId: "877962403858",
  appId: "1:877962403858:web:3a9e7bb284068836bb78cb",
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
