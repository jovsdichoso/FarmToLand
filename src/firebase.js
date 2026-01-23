// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth"; // 1. Import getAuth

const firebaseConfig = {
    apiKey: "AIzaSyDKkucZtr8yc82GtWpHKazEJSvjFR6gcNA",
    authDomain: "farmtomarket-c1e28.firebaseapp.com",
    projectId: "farmtomarket-c1e28",
    storageBucket: "farmtomarket-c1e28.firebasestorage.app",
    messagingSenderId: "570089186986",
    appId: "1:570089186986:web:0a07648f2513dbbef7d2d3",
    measurementId: "G-V0D2BX2JXX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// --- EXPORTS ---
// You must export 'db' and 'auth' for other files to use them
export const db = getFirestore(app);
export const auth = getAuth(app); // <--- THIS LINE IS MISSING