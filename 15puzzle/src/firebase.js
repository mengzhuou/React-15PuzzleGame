// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCv7mRinQ_FiS9mx6Z5eeUpo8cto5Zo58U",
  authDomain: "nina-15puzzle.firebaseapp.com",
  projectId: "nina-15puzzle",
  storageBucket: "nina-15puzzle.appspot.com",
  messagingSenderId: "723432157461",
  appId: "1:723432157461:web:f59e4a8c200315c2f4b91c",
  measurementId: "G-EG15SBV9Y9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export default getFirestore();