// src/firebase/firebase.ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDogObwtOpFjDblszjkCTCBKE_drZdV8Gk",
  authDomain: "personal-finance-tracker-32ba7.firebaseapp.com",
  projectId: "personal-finance-tracker-32ba7",
  storageBucket: "personal-finance-tracker-32ba7.firebasestorage.app",
  messagingSenderId: "605457171949",
  appId: "1:605457171949:web:4fd5ce23cbccab350953e4",
  measurementId: "G-D0HX0W4NVK",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
