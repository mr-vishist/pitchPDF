// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDWBNMvcuS7CjBiKBMISR0qWYclXoOIE5s",
    authDomain: "pitchpdf-9bd30.firebaseapp.com",
    projectId: "pitchpdf-9bd30",
    storageBucket: "pitchpdf-9bd30.firebasestorage.app",
    messagingSenderId: "346968130855",
    appId: "1:346968130855:web:b6e4237bce8f763ea4d502"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth
export const auth = getAuth(app);
export default app;