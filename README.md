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
EXPO_PUBLIC_FIREBASE_API_KEY=
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=
EXPO_PUBLIC_FIREBASE_PROJECT_ID=
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
EXPO_PUBLIC_FIREBASE_APP_ID=
```

The current app works with local demo data immediately. Once Firebase keys are added, replace the placeholder auth/data methods in `src/services/dataService.js` with Firestore reads and writes.
