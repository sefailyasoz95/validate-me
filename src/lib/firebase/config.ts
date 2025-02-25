import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";

// Include all required configuration values for client-side Firebase Analytics
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
let app = undefined as any;
try {
  app = initializeApp(firebaseConfig);
} catch (error) {
  console.error("Firebase initialization error", error);
}

// Initialize Analytics and export it
export const initializeAnalytics = async () => {
  if (!app || typeof window === "undefined") return null;

  try {
    const isAnalyticsSupported = await isSupported();
    if (isAnalyticsSupported) {
      return getAnalytics(app);
    }
  } catch (error) {
    console.error("Analytics initialization error", error);
  }
  return null;
};

export default app;
