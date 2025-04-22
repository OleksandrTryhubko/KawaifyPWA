import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCwKWP92aXwYEZfiyNCrBi-VyjmalvgjUA",
  authDomain: "kawaify-pwa.firebaseapp.com",
  projectId: "kawaify-pwa",
  storageBucket: "kawaify-pwa.firebasestorage.app",
  messagingSenderId: "524559814005",
  appId: "1:524559814005:web:297d61634eef5b3d66973c",
  measurementId: "G-4D5KBGG7XE",
  databaseURL: "https://kawaify-pwa-default-rtdb.europe-west1.firebasedatabase.app",
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const auth = getAuth(app);
const db = getFirestore(app);

export { database, auth, db };