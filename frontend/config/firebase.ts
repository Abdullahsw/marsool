import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { Platform } from 'react-native';

const firebaseConfig = {
  apiKey: "AIzaSyDeIuqW6k1vJnzVp786qnmsGroXlpKN89s",
  authDomain: "marsool-1d3a8.firebaseapp.com",
  projectId: "marsool-1d3a8",
  storageBucket: "marsool-1d3a8.firebasestorage.app",
  messagingSenderId: "832528016139",
  appId: Platform.select({
    ios: "1:832528016139:ios:b7f86d889dfcff3730f80e",
    android: "1:832528016139:android:a51cc9f4f81c5e0530f80e",
    default: "1:832528016139:android:a51cc9f4f81c5e0530f80e"
  })
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth
const auth = getAuth(app);

// Initialize Firestore
const db = getFirestore(app);

// Initialize Storage
const storage = getStorage(app);

export { app, auth, db, storage };
