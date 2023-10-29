// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {getAuth} from 'firebase/auth';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBhEL6g5Pv47RnOkUjy7ybDLSj1wwSSuuo",
  authDomain: "community-chatbox.firebaseapp.com",
  databaseURL: "https://community-chatbox-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "community-chatbox",
  storageBucket: "community-chatbox.appspot.com",
  messagingSenderId: "405955236242",
  appId: "1:405955236242:web:8a19e1199126d6c3e5314b",
  measurementId: "G-1NECD6HREL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
export default app