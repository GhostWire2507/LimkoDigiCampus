import { initializeApp, getApps } from "firebase/app";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getAuth, getReactNativePersistence, initializeAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

export const firebaseProject = {
  name: "LimkoDigiCampus",
  projectId: "limkodigicampus",
  projectNumber: "823990853810"
};

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || "",
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || `${firebaseProject.projectId}.firebaseapp.com`,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || firebaseProject.projectId,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || firebaseProject.projectNumber,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || "",
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID || ""
};

export const hasFirebaseConfig = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);

let appInstance = null;
let authInstance = null;
let dbInstance = null;

if (hasFirebaseConfig) {
  appInstance = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

  try {
    authInstance = initializeAuth(appInstance, {
      persistence: getReactNativePersistence(AsyncStorage)
    });
  } catch {
    authInstance = getAuth(appInstance);
  }

  dbInstance = getFirestore(appInstance);
}

export const app = appInstance;
export const auth = authInstance;
export const db = dbInstance;
