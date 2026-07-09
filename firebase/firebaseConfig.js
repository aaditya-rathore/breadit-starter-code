// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCEoOClcA1edgWy9h-Mp5GDUvXET3NYTlw",
  authDomain: "reddit-clone-91662.firebaseapp.com",
  projectId: "reddit-clone-91662",
  storageBucket: "reddit-clone-91662.firebasestorage.app",
  messagingSenderId: "539264882425",
  appId: "1:539264882425:web:b40662db74df74f6493428",
  measurementId: "G-ZS0CMJGFJW"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
