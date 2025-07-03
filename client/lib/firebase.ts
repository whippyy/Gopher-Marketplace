import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyA3NJqx1EfvJ-0SG9TaBhGio4q-mOhbYnI",
  authDomain: "gopher-marketplace-255c2.firebaseapp.com",
  projectId: "gopher-marketplace-255c2",
  storageBucket: "gopher-marketplace-255c2.firebasestorage.app",
  messagingSenderId: "628980440330",
  appId: "1:628980440330:web:d2e3ef8257e001dfa12ef3",
  measurementId: "G-B3YDZ019G8"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider(); 