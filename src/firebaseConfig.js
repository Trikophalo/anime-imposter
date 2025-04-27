// src/firebaseConfig.js

import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
    apiKey: "AIzaSyAbg9Z1xgLgxcuj9l8rmoTR3ucEV_uYS-0",
    authDomain: "anime-imopster-game.firebaseapp.com",
    databaseURL: "https://anime-imopster-game-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "anime-imopster-game",
    storageBucket: "anime-imopster-game.firebasestorage.app",
    messagingSenderId: "868034807681",
    appId: "1:868034807681:web:9f8fdd70cb642348dd4a80"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export { db };
