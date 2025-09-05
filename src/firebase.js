// src/firebase.js

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// DİKKAT: Bu bilgileri doğrudan koda yazmak güvensizdir. .env dosyası kullanacağız.
const firebaseConfig = {
  apiKey: "AIzaSyCLv1II_gP0gTwcx013RhPtL74VbaYUfKc",
  authDomain: "finanstakip-app.firebaseapp.com",
  projectId: "finanstakip-app",
  storageBucket: "finanstakip-app.firebasestorage.app",
  messagingSenderId: "63257641178",
  appId: "1:63257641178:web:8e84667094c4b589aaa5e3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Diğer dosyalarda kullanmak için servisleri export edelim
export const auth = getAuth(app);
export const db = getFirestore(app);