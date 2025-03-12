// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDDsjXdoMLL3S9n5pajOOId8aNs8L8uwJM",
  authDomain: "dzamillatyminska-a174f.firebaseapp.com",
  projectId: "dzamillatyminska-a174f",
  storageBucket: "dzamillatyminska-a174f.firebasestorage.app",
  messagingSenderId: "30696111457",
  appId: "1:30696111457:web:5412aacd36ed57b0d1d920",
  measurementId: "G-Y8GL0J805P",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
export const storage = getStorage(app);
export const db = getFirestore(app);
export const auth = getAuth(app);
