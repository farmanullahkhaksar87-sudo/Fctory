import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBC_hHb1MZTUy-9zjMjrQx-Fq7aWOoUcN0",
  authDomain: "factory-b43a7.firebaseapp.com",
  projectId: "factory-b43a7",
  storageBucket: "factory-b43a7.firebasestorage.app",
  messagingSenderId: "759335174409",
  appId: "1:759335174409:web:3d5a758a89498cb23013d8"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
