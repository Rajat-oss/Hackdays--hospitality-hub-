import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBV6GcSviWUZvEuJE4BPK3Io_gWSo2a8s0",
  authDomain: "hrms-b30e2.firebaseapp.com",
  projectId: "hrms-b30e2",
  storageBucket: "hrms-b30e2.firebasestorage.app",
  messagingSenderId: "285005197944",
  appId: "1:285005197944:web:3e4f6798019fbce04af38d",
  measurementId: "G-YH3Y35ME4B"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
