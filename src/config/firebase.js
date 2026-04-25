import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

/**
 * Firebase configuration for CrisisChain AI
 */
const firebaseConfig = {
  apiKey: "AIzaSyBb9UxYiPApAjXYS8Pr5ezon7AwdzbrscY",
  authDomain: "crisi-ai.firebaseapp.com",
  projectId: "crisi-ai",
  storageBucket: "crisi-ai.firebasestorage.app",
  messagingSenderId: "317474587056",
  appId: "1:317474587056:web:84d8022d9f473fb9a89675",
  measurementId: "G-BKJTD4KZJZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Services
export const db = getFirestore(app);
export const auth = getAuth(app);

// Ensure a valid session for Firestore writes
import { signInAnonymously } from "firebase/auth";
signInAnonymously(auth).catch(err => console.error("Auth failed:", err));
export const storage = getStorage(app);

let analytics = null;
try {
  if (typeof window !== 'undefined') {
    analytics = getAnalytics(app);
  }
} catch (e) {
  console.warn("Analytics blocked or failed to load");
}
export { analytics };
export const googleProvider = new GoogleAuthProvider();

export default app;
