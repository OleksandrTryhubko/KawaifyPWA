import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCwWgP29aXwEZfiyNCrBi-VymlaVgjUA", 
  authDomain: "kawaify-pwa.firebaseapp.com",
  databaseURL: "https://kawaify-pwa-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "kawaify-pwa",
  storageBucket: "kawaify-pwa.appspot.com",
  messagingSenderId: "524559814085",
  appId: "1:524559814085:web:40761634eef5b3d6d6973c",
  measurementId: "G-4D5KB6BG7E"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const auth = getAuth(app);

export { database, auth };