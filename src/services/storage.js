import AsyncStorage from "@react-native-async-storage/async-storage";

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

export async function saveItem(key, value) {
  await AsyncStorage.setItem(keys[key], JSON.stringify(value));
}

export async function loadItem(key, fallback) {
  const raw = await AsyncStorage.getItem(keys[key]);
  return raw ? JSON.parse(raw) : fallback;
}

export async function removeItem(key) {
  await AsyncStorage.removeItem(keys[key]);
}
