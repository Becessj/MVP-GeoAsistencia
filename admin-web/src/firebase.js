// src/firebase.js
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyBJwUD09-69FQ3NWcPOQu8smofKXvuwDek",
  authDomain: "geoflix-asistencia.firebaseapp.com",
  databaseURL: "https://geoflix-asistencia-default-rtdb.firebaseio.com",
  projectId: "geoflix-asistencia",
  storageBucket: "geoflix-asistencia.firebasestorage.app",
  messagingSenderId: "677586350027",
  appId: "1:677586350027:web:f726b101ee37dffab2d04e",
  measurementId: "G-E80HVPPBTR"
};

const app = initializeApp(firebaseConfig);

// Exporta la Realtime Database con el nombre "db"
export const db = getDatabase(app);
