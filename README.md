# LimkoDigiCampus

Expo-based mobile reporting and monitoring app for the LUCT assignment.

## Stack

- React Native with Expo Router
- JavaScript only
- custom themed component styling
- Firebase-ready services with local demo fallback
- AsyncStorage for offline demo persistence

## Features Implemented

- role-based login and registration flow
- dashboards for Student, Lecturer, PRL, and PL
- lecturer class listing and multi-step lecture report form
- student attendance and lecturer rating modules
- PRL report review with feedback
- PL course management
- search on classes and reports
- CSV export for reports
- light and dark theme toggle

## Demo Accounts

- `lecturer@limko.com` / `123456`
- `student@limko.com` / `123456`
- `prl@limko.com` / `123456`
- `pl@limko.com` / `123456`

## Run

```bash
npm install
npx expo start
```

## Firebase Setup

Create a `.env` file and add:

```bash
EXPO_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

Firebase project alignment for this repo:

- Project name: `LimkoDigiCampus`
- Project ID: `limkodigicampus`
- Project number: `823990853810`

Get the remaining values from Firebase Console:

1. Open Project settings.
2. Register a Web app if one does not exist yet.
3. Copy the Firebase config values into `.env`.
4. Enable Authentication with Email/Password.
5. Create Firestore and add the collections `users`, `courses`, `reports`, `ratings`, and `attendance`.

Keep `.env` local only. The repo ignores `.env`, platform credential files, and common signing artifacts so live values do not get committed by mistake.

The app now supports both modes:

- Without Firebase env keys: local demo data in AsyncStorage
- With Firebase env keys: Firebase Auth + Firestore for login, registration, courses, reports, ratings, and attendance
