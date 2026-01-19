// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAVby5rnhnDDKcl0BbQozJGYNB21pl5Wv8",
    authDomain: "login-364f3.firebaseapp.com",
    projectId: "login-364f3",
    storageBucket: "login-364f3.firebasestorage.app",
    messagingSenderId: "904408388609",
    appId: "1:904408388609:web:8ef6949aff6caa02325c00",
    measurementId: "G-HPPBPKEX2X"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { auth, provider };