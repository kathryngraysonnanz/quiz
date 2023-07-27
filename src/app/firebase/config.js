// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

databaseURL: "https://quiz-a65ee-default-rtdb.firebaseio.com/" 

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBenwuH1uqEVD96HuRweeAew_flf-AY35E",
  authDomain: "quiz-a65ee.firebaseapp.com",
  projectId: "quiz-a65ee",
  storageBucket: "quiz-a65ee.appspot.com",
  messagingSenderId: "219843196270",
  appId: "1:219843196270:web:c4736a325ac3772903fd7f"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Realtime Database and get a reference to the service
export const database = getDatabase(app);