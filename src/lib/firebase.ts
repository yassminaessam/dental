// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getStorage, connectStorageEmulator } from "firebase/storage";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAyhz89y2Y9ucaB2xi5xFAcALhkMH-HBIY",
  authDomain: "dental-a627d.firebaseapp.com",
  projectId: "dental-a627d",
  storageBucket: "dental-a627d.firebasestorage.app",
  messagingSenderId: "61708021549",
  appId: "1:61708021549:web:682cd642b856c0f35f2da4",
  measurementId: "G-KZZD0JR71E"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);

// Configure CORS for development
if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
  console.log('Running in development mode with localhost');
}

// Debug Firebase initialization
console.log('Firebase initialized:', {
  app: app.name,
  storageBucket: firebaseConfig.storageBucket,
  projectId: firebaseConfig.projectId
});

export { app, db, storage, auth };
