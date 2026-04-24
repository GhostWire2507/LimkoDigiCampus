import AsyncStorage from "@react-native-async-storage/async-storage";

// Keeps storage keys in one place so the rest of the app uses friendly names.
const keys = {
  themeMode: "limko_theme_mode",
  currentUser: "limko_current_user",
  dataVersion: "limko_data_version",
  users: "limko_users",
  faculties: "limko_faculties",
  programmes: "limko_programmes",
  classes: "limko_classes",
  reports: "limko_reports",
  ratings: "limko_ratings",
  attendance: "limko_attendance"
};

// Saves simple JSON data under one of the shared app storage keys.
export async function saveItem(key, value) {
  await AsyncStorage.setItem(keys[key], JSON.stringify(value));
}

// Reads JSON data and falls back when nothing has been stored yet.
export async function loadItem(key, fallback) {
  const raw = await AsyncStorage.getItem(keys[key]);
  return raw ? JSON.parse(raw) : fallback;
}

// Removes a stored value, usually during logout or data reset.
export async function removeItem(key) {
  await AsyncStorage.removeItem(keys[key]);
}
