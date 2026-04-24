import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { initializeApp } from "firebase/app";
import { doc, getFirestore, writeBatch } from "firebase/firestore";

// Resolve project-relative paths once so the script can read .env and mock data reliably.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");
const envPath = path.join(projectRoot, ".env");
const mockDataPath = path.join(projectRoot, "src", "data", "mockData.js");

const COLLECTIONS = {
  faculties: "faculties",
  programmes: "programmes",
  users: "users",
  classes: "classes",
  reports: "reports",
  ratings: "ratings",
  attendance: "attendance"
};

const DRY_RUN = process.argv.includes("--dry-run");
const WITH_AUTH = process.argv.includes("--with-auth");

// Loads local .env values without needing an extra dependency in the seed script.
function loadEnvFile() {
  if (!existsSync(envPath)) {
    return;
  }

  const content = readFileSync(envPath, "utf8");

  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();

    if (!line || line.startsWith("#")) {
      continue;
    }

    const separatorIndex = line.indexOf("=");

    if (separatorIndex === -1) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    let value = line.slice(separatorIndex + 1).trim();

    if ((value.startsWith("\"") && value.endsWith("\"")) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }

    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

// Fails early when required Firebase values are missing.
function requireEnv(name) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing ${name}. Add it to .env before seeding Firebase.`);
  }

  return value;
}

// Evaluates the mock data module so the script can reuse the same records as the app.
function loadMockData() {
  const source = readFileSync(mockDataPath, "utf8");
  const exportNames = [...source.matchAll(/export const (\w+)\s*=/g)].map((match) => match[1]);

  if (!exportNames.length) {
    throw new Error("No exported mock data collections were found in src/data/mockData.js.");
  }

  const executableSource = source.replace(/export const /g, "const ");
  const factory = new Function(`${executableSource}\nreturn { ${exportNames.join(", ")} };`);
  return factory();
}

// Defines the Firestore collections that are seeded from the mock data file.
function getSeedPlan(mockData) {
  return [
    [COLLECTIONS.faculties, mockData.mockFaculties],
    [COLLECTIONS.programmes, mockData.mockProgrammes],
    [COLLECTIONS.users, mockData.mockUsers],
    [COLLECTIONS.classes, mockData.mockClasses],
    [COLLECTIONS.reports, mockData.mockReports],
    [COLLECTIONS.ratings, mockData.mockRatings],
    [COLLECTIONS.attendance, mockData.mockAttendance]
  ];
}

// Writes records in chunks so the script stays within Firestore batch limits.
async function seedCollection(db, collectionName, records) {
  if (!records.length) {
    return 0;
  }

  let committed = 0;

  for (let index = 0; index < records.length; index += 400) {
    const batch = writeBatch(db);
    const chunk = records.slice(index, index + 400);

    for (const record of chunk) {
      if (!record?.id) {
        throw new Error(`Every ${collectionName} record must include an id. A record is missing one.`);
      }

      batch.set(doc(db, collectionName, record.id), record, { merge: true });
    }

    await batch.commit();
    committed += chunk.length;
  }

  return committed;
}

// Auth seeding uses a simpler list because Firestore user docs do not store raw passwords anymore.
function getAuthSeedUsers(mockUsers) {
  return mockUsers.filter((user) => user?.email && user?.password);
}

// Creates one Firebase Auth email/password account from a seed record.
async function createAuthUser(apiKey, user) {
  const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${apiKey}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      email: user.email,
      password: user.password,
      returnSecureToken: false
    })
  });

  const payload = await response.json().catch(() => ({}));

  if (response.ok) {
    return { status: "created" };
  }

  const errorMessage = payload?.error?.message || "UNKNOWN";

  if (errorMessage === "EMAIL_EXISTS") {
    return { status: "exists" };
  }

  throw new Error(`Failed to create Firebase Auth user ${user.email}: ${errorMessage}`);
}

// Runs auth seeding one user at a time and prints a simple summary.
async function seedAuthUsers(apiKey, users) {
  const summary = {
    created: 0,
    existing: 0
  };

  for (const user of users) {
    const result = await createAuthUser(apiKey, user);

    if (result.status === "created") {
      summary.created += 1;
      console.log(`- auth user created: ${user.email}`);
      continue;
    }

    summary.existing += 1;
    console.log(`- auth user already exists: ${user.email}`);
  }

  return summary;
}

// Entry point: load config, build a plan, then seed Firestore and optionally Auth.
async function main() {
  loadEnvFile();

  const firebaseConfig = {
    apiKey: requireEnv("EXPO_PUBLIC_FIREBASE_API_KEY"),
    authDomain: requireEnv("EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN"),
    projectId: requireEnv("EXPO_PUBLIC_FIREBASE_PROJECT_ID"),
    storageBucket: requireEnv("EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET"),
    messagingSenderId: requireEnv("EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID"),
    appId: requireEnv("EXPO_PUBLIC_FIREBASE_APP_ID"),
    measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID || ""
  };

  const mockData = loadMockData();
  const seedPlan = getSeedPlan(mockData);
  const authSeedUsers = getAuthSeedUsers(mockData.mockAuthSeedUsers || mockData.mockUsers || []);

  if (DRY_RUN) {
    console.log("Dry run only. Planned Firestore writes:");

    for (const [collectionName, records] of seedPlan) {
      console.log(`- ${collectionName}: ${records.length} documents`);
    }

    if (WITH_AUTH) {
      console.log(`- auth users: ${authSeedUsers.length} email/password accounts`);
    }

    return;
  }

  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);

  console.log(`Seeding Firestore project "${firebaseConfig.projectId}"...`);

  for (const [collectionName, records] of seedPlan) {
    const count = await seedCollection(db, collectionName, records);
    console.log(`- ${collectionName}: ${count} documents upserted`);
  }

  console.log("Firebase seed completed.");

  if (WITH_AUTH) {
    console.log("Seeding Firebase Auth users...");
    const authSummary = await seedAuthUsers(firebaseConfig.apiKey, authSeedUsers);
    console.log(`Firebase Auth seed completed. ${authSummary.created} created, ${authSummary.existing} already existed.`);
  } else {
    console.log("Note: this script seeded Firestore collections only. Run with --with-auth to also create Firebase Auth users for email/password sign-in.");
  }
}

main().catch((error) => {
  console.error("Firebase seed failed.");
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
