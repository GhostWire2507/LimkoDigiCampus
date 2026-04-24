import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";
import {
  mockAttendance,
  mockClasses,
  mockFaculties,
  mockProgrammes,
  mockRatings,
  mockReports,
  mockUsers
} from "../data/mockData";
import { auth, db, hasFirebaseConfig } from "../lib/firebase";
import { hashPassword, verifyPassword } from "../utils/auth";
import {
  createDocument,
  deleteDocumentById,
  findFirstDocument,
  getDocument,
  isFirebaseAvailable,
  listDocuments,
  updateDocument,
  upsertDocument
} from "./firebaseCrud";
import { loadItem, saveItem } from "./storage";
import { average, getAttendanceRate } from "../utils/helpers";

const COLLECTIONS = {
  users: "users",
  faculties: "faculties",
  programmes: "programmes",
  classes: "classes",
  reports: "reports",
  ratings: "ratings",
  attendance: "attendance"
};

const DATA_VERSION = 4;
const dataCache = new Map();

function getModeCacheKey() {
  return isFirebaseReady() ? "firebase" : "local";
}

function getScopedCacheKey(scope, user = null) {
  return `${getModeCacheKey()}:${scope}:${user?.role || "guest"}:${user?.id || "anonymous"}`;
}

function readThroughCache(key, loader) {
  const cached = dataCache.get(key);

  if (cached?.value !== undefined) {
    return Promise.resolve(cached.value);
  }

  if (cached?.promise) {
    return cached.promise;
  }

  const promise = loader()
    .then((value) => {
      dataCache.set(key, { value, promise: Promise.resolve(value) });
      return value;
    })
    .catch((error) => {
      dataCache.delete(key);
      throw error;
    });

  dataCache.set(key, { promise });
  return promise;
}

export function clearDataCaches() {
  dataCache.clear();
}

export function peekCachedData(scope, user = null, fallback = []) {
  return dataCache.get(getScopedCacheKey(scope, user))?.value || fallback;
}

function isFirebaseReady() {
  return Boolean(hasFirebaseConfig && auth && db && isFirebaseAvailable());
}

function sortItems(items, field, direction = "asc") {
  return [...items].sort((left, right) => {
    const leftValue = left?.[field] || "";
    const rightValue = right?.[field] || "";

    if (leftValue === rightValue) {
      return 0;
    }

    if (direction === "desc") {
      return leftValue < rightValue ? 1 : -1;
    }

    return leftValue > rightValue ? 1 : -1;
  });
}

function toFirebaseErrorMessage(error) {
  switch (error?.code) {
    case "auth/invalid-api-key":
      return "Firebase rejected the API key. Recheck your Expo env values and restart the app with a cleared cache.";
    case "auth/network-request-failed":
      return "Firebase could not reach the authentication service. Check your internet connection and try again.";
    case "auth/invalid-credential":
      return "The email or password is not valid for a Firebase account in this project.";
    case "auth/user-not-found":
      return "No Firebase Auth user exists for that email yet. Register first, then sign in.";
    case "auth/wrong-password":
      return "The password is incorrect for this Firebase account.";
    case "auth/invalid-email":
      return "The email address format is invalid.";
    case "auth/email-already-in-use":
      return "That email is already registered in Firebase Auth. Try signing in instead.";
    case "auth/operation-not-allowed":
      return "Email and password sign-in is not enabled in Firebase Authentication.";
    default:
      return error?.message || "Something went wrong while talking to Firebase Auth.";
  }
}

async function getUserProfile(uid) {
  const userProfile = await getDocument(COLLECTIONS.users, uid);

  if (userProfile) {
    return userProfile;
  }

  const emailMatchedProfile = auth?.currentUser?.email
    ? await findFirstDocument(COLLECTIONS.users, "email", auth.currentUser.email.toLowerCase())
    : null;

  if (emailMatchedProfile) {
    return emailMatchedProfile;
  }

  throw new Error("Your account exists in Firebase Auth, but the user profile is missing in Firestore.");
}

async function getCollectionItems(name, orderField) {
  return listDocuments(name, orderField ? { orderField, orderDirection: "asc" } : {});
}

async function getLocalDataset() {
  return readThroughCache("local:dataset", async () => {
    const [users, faculties, programmes, classes, reports, ratings, attendance] = await Promise.all([
      loadItem("users", mockUsers),
      loadItem("faculties", mockFaculties),
      loadItem("programmes", mockProgrammes),
      loadItem("classes", mockClasses),
      loadItem("reports", mockReports),
      loadItem("ratings", mockRatings),
      loadItem("attendance", mockAttendance)
    ]);

    return { users, faculties, programmes, classes, reports, ratings, attendance };
  });
}

async function getDataset() {
  if (!isFirebaseReady()) {
    return getLocalDataset();
  }

  return readThroughCache("firebase:dataset", async () => {
    const [users, faculties, programmes, classes, reports, ratings, attendance] = await Promise.all([
      getCollectionItems(COLLECTIONS.users),
      getCollectionItems(COLLECTIONS.faculties, "name"),
      getCollectionItems(COLLECTIONS.programmes, "name"),
      getCollectionItems(COLLECTIONS.classes, "displayName"),
      getCollectionItems(COLLECTIONS.reports),
      getCollectionItems(COLLECTIONS.ratings),
      getCollectionItems(COLLECTIONS.attendance)
    ]);

    return { users, faculties, programmes, classes, reports, ratings, attendance };
  });
}

function canSeeFaculty(user, facultyId) {
  if (!user) return false;
  if (user.role === "fmg") return true;
  if (user.role === "student" || user.role === "lecturer" || user.role === "prl" || user.role === "pl") {
    return user.facultyId === facultyId;
  }

  return false;
}

function canSeeProgramme(user, programmeId) {
  if (!user) return false;
  if (user.role === "fmg") return true;
  if (user.role === "student" || user.role === "lecturer" || user.role === "prl" || user.role === "pl") {
    return (user.programmeIds || []).includes(programmeId);
  }

  return false;
}

function canSeeClass(user, classItem) {
  if (!user || !classItem) return false;

  if (user.role === "fmg") return true;
  if (user.role === "student" || user.role === "lecturer") {
    return (user.assignedClassIds || []).includes(classItem.id);
  }

  if (user.role === "prl") {
    return classItem.prlId === user.id || (user.programmeIds || []).includes(classItem.programmeId);
  }

  if (user.role === "pl") {
    return classItem.plId === user.id || (user.programmeIds || []).includes(classItem.programmeId);
  }

  return false;
}

function enrichClass(classItem, dataset) {
  const faculty = dataset.faculties.find((item) => item.id === classItem.facultyId);
  const programme = dataset.programmes.find((item) => item.id === classItem.programmeId);
  const lecturer = dataset.users.find((item) => item.id === classItem.lecturerId);
  const seniorLecturer = dataset.users.find((item) => item.id === classItem.prlId);
  const programmeLeader = dataset.users.find((item) => item.id === classItem.plId);

  return {
    ...classItem,
    facultyName: faculty?.name || "",
    programmeName: programme?.name || "",
    lecturerName: lecturer?.fullName || "Unassigned lecturer",
    seniorLecturerName: seniorLecturer?.fullName || "Not assigned",
    programmeLeaderName: programmeLeader?.fullName || "Not assigned"
  };
}

function enrichReport(report, dataset) {
  const classItem = dataset.classes.find((item) => item.id === report.classId);
  const enrichedClass = classItem ? enrichClass(classItem, dataset) : null;

  return {
    ...report,
    facultyName: enrichedClass?.facultyName || "",
    programmeName: enrichedClass?.programmeName || "",
    classDisplayName: enrichedClass?.displayName || report.classDisplayName || "",
    courseName: enrichedClass?.courseName || report.courseName || "",
    lecturerName: report.lecturerName || enrichedClass?.lecturerName || "",
    attendanceRate: getAttendanceRate(report.attendancePresent, report.attendanceTotal)
  };
}

function enrichAttendance(record, dataset) {
  const classItem = dataset.classes.find((item) => item.id === record.classId);
  const enrichedClass = classItem ? enrichClass(classItem, dataset) : null;

  return {
    ...record,
    classDisplayName: enrichedClass?.displayName || "",
    courseName: enrichedClass?.courseName || "",
    facultyName: enrichedClass?.facultyName || "",
    programmeName: enrichedClass?.programmeName || "",
    attendanceRate: getAttendanceRate(record.totalPresent, classItem?.studentCount)
  };
}

function enrichRating(rating, dataset) {
  const classItem = dataset.classes.find((item) => item.id === rating.classId);
  const student = dataset.users.find((item) => item.id === rating.studentId);
  const lecturer = dataset.users.find((item) => item.id === rating.lecturerId);
  const enrichedClass = classItem ? enrichClass(classItem, dataset) : null;

  return {
    ...rating,
    studentName: student?.fullName || "Student",
    lecturerName: lecturer?.fullName || "Lecturer",
    classDisplayName: enrichedClass?.displayName || "",
    courseName: enrichedClass?.courseName || ""
  };
}

function buildMonitoringRows(user, dataset) {
  const classes = dataset.classes.filter((item) => canSeeClass(user, item)).map((item) => enrichClass(item, dataset));
  const reports = dataset.reports.filter((item) => classes.some((classItem) => classItem.id === item.classId));
  const attendance = dataset.attendance.filter((item) => classes.some((classItem) => classItem.id === item.classId));
  const ratings = dataset.ratings.filter((item) => classes.some((classItem) => classItem.id === item.classId));

  return classes.map((classItem) => {
    const classReports = reports.filter((report) => report.classId === classItem.id);
    const classAttendance = attendance.filter((record) => record.classId === classItem.id);
    const classRatings = ratings.filter((rating) => rating.classId === classItem.id);
    const attendanceAverage = average(
      classAttendance.map((record) => getAttendanceRate(record.totalPresent, classItem.studentCount))
    );

    return {
      ...classItem,
      reportsSubmitted: classReports.length,
      attendanceAverage,
      averageRating: average(classRatings.map((rating) => rating.rating)),
      latestReportStatus: classReports[0]?.reviewStatus || "pending"
    };
  });
}

export async function bootstrapLocalData() {
  if (isFirebaseReady()) {
    return;
  }

  const version = await loadItem("dataVersion", null);

  if (version === DATA_VERSION) {
    return;
  }

  await Promise.all([
    saveItem("dataVersion", DATA_VERSION),
    saveItem("users", mockUsers),
    saveItem("faculties", mockFaculties),
    saveItem("programmes", mockProgrammes),
    saveItem("classes", mockClasses),
    saveItem("reports", mockReports),
    saveItem("ratings", mockRatings),
    saveItem("attendance", mockAttendance)
  ]);

  clearDataCaches();
}

export async function restoreUserSession() {
  if (isFirebaseReady()) {
    if (!auth.currentUser) {
      return null;
    }

    return getUserProfile(auth.currentUser.uid);
  }

  const currentUser = await loadItem("currentUser", null);

  if (currentUser?.password && !currentUser.passwordHash) {
    return {
      ...currentUser,
      passwordHash: hashPassword(currentUser.password)
    };
  }

  return currentUser;
}

export async function loginUser(email, password) {
  if (isFirebaseReady()) {
    try {
      const credentials = await signInWithEmailAndPassword(auth, email.trim(), password);
      return getUserProfile(credentials.user.uid);
    } catch (error) {
      throw new Error(toFirebaseErrorMessage(error));
    }
  }

  const users = await loadItem("users", mockUsers);
  const matchedUser = users.find(
    (user) =>
      user.email.toLowerCase() === email.toLowerCase() &&
      (verifyPassword(password, user.passwordHash) || (!user.passwordHash && user.password === password))
  );

  if (!matchedUser) {
    throw new Error("Invalid email or password.");
  }

  return matchedUser;
}

export async function registerUser(payload) {
  const nextUser = {
    id: `user-${Date.now()}`,
    fullName: payload.fullName,
    email: payload.email.trim().toLowerCase(),
    passwordHash: hashPassword(payload.password),
    role: payload.role,
    facultyId: payload.facultyId || "fict",
    facultyName: payload.facultyName || "Information & Communication Technology",
    programmeIds: payload.programmeIds || [],
    assignedClassIds: payload.assignedClassIds || [],
    createdAt: new Date().toISOString()
  };

  if (isFirebaseReady()) {
    try {
      const credentials = await createUserWithEmailAndPassword(auth, payload.email.trim(), payload.password);
      const firebaseUser = {
        ...nextUser,
        id: credentials.user.uid
      };
      delete firebaseUser.passwordHash;
      await createDocument(COLLECTIONS.users, firebaseUser, { id: credentials.user.uid });
      return getUserProfile(credentials.user.uid);
    } catch (error) {
      throw new Error(toFirebaseErrorMessage(error));
    }
  }

  const users = await loadItem("users", mockUsers);
  await saveItem("users", [nextUser, ...users]);
  clearDataCaches();
  return nextUser;
}

export async function getFacultiesForRole(user) {
  const cacheKey = getScopedCacheKey("faculties", user);

  return readThroughCache(cacheKey, async () => {
    const dataset = await getDataset();
    return dataset.faculties
      .filter((faculty) => canSeeFaculty(user, faculty.id))
      .map((faculty) => ({
        ...faculty,
        programmeCount: dataset.programmes.filter((programme) => programme.facultyId === faculty.id).length,
        classCount: dataset.classes.filter((classItem) => classItem.facultyId === faculty.id).length
      }));
  });
}

export async function getProgrammesForRole(user) {
  const cacheKey = getScopedCacheKey("programmes", user);

  return readThroughCache(cacheKey, async () => {
    const dataset = await getDataset();

    return dataset.programmes
      .filter((programme) => canSeeProgramme(user, programme.id) || canSeeFaculty(user, programme.facultyId))
      .map((programme) => {
        const faculty = dataset.faculties.find((item) => item.id === programme.facultyId);
        const programmeClasses = dataset.classes.filter((classItem) => classItem.programmeId === programme.id);
        return {
          ...programme,
          facultyName: faculty?.name || "",
          classCount: programmeClasses.length
        };
      });
  });
}

export async function getClassesForRole(user) {
  const cacheKey = getScopedCacheKey("classes", user);

  return readThroughCache(cacheKey, async () => {
    const dataset = await getDataset();
    return sortItems(
      dataset.classes.filter((classItem) => canSeeClass(user, classItem)).map((classItem) => enrichClass(classItem, dataset)),
      "displayName",
      "asc"
    );
  });
}

export async function getReportsForRole(user) {
  const cacheKey = getScopedCacheKey("reports", user);

  return readThroughCache(cacheKey, async () => {
    const dataset = await getDataset();
    const visibleClassIds = dataset.classes.filter((classItem) => canSeeClass(user, classItem)).map((classItem) => classItem.id);

    return sortItems(
      dataset.reports
        .filter((report) => visibleClassIds.includes(report.classId))
        .map((report) => enrichReport(report, dataset)),
      "submittedAt",
      "desc"
    );
  });
}

export async function getRatingsForRole(user) {
  const cacheKey = getScopedCacheKey("ratings", user);

  return readThroughCache(cacheKey, async () => {
    const dataset = await getDataset();
    const visibleClassIds = dataset.classes.filter((classItem) => canSeeClass(user, classItem)).map((classItem) => classItem.id);

    return sortItems(
      dataset.ratings
        .filter((rating) => {
          if (user.role === "student") {
            return rating.studentId === user.id;
          }

          return visibleClassIds.includes(rating.classId);
        })
        .map((rating) => enrichRating(rating, dataset)),
      "createdAt",
      "desc"
    );
  });
}

export async function getAttendanceForRole(user) {
  const cacheKey = getScopedCacheKey("attendance", user);

  return readThroughCache(cacheKey, async () => {
    const dataset = await getDataset();
    const visibleClassIds = dataset.classes.filter((classItem) => canSeeClass(user, classItem)).map((classItem) => classItem.id);

    return sortItems(
      dataset.attendance
        .filter((record) => visibleClassIds.includes(record.classId))
        .map((record) => enrichAttendance(record, dataset)),
      "lectureDate",
      "desc"
    );
  });
}

export async function getMonitoringForRole(user) {
  const cacheKey = getScopedCacheKey("monitoring", user);

  return readThroughCache(cacheKey, async () => {
    const dataset = await getDataset();
    return sortItems(buildMonitoringRows(user, dataset), "attendanceAverage", "desc");
  });
}

export async function getUserDirectory(user) {
  const cacheKey = getScopedCacheKey("directory", user);

  return readThroughCache(cacheKey, async () => {
    const dataset = await getDataset();

    return dataset.users.filter((entry) => {
      if (user.role === "fmg") return true;
      if (user.role === "pl" || user.role === "prl") {
        return entry.facultyId === user.facultyId;
      }

      return entry.id === user.id;
    });
  });
}

export async function getRegistrationOptions() {
  const cacheKey = getScopedCacheKey("registration-options");

  return readThroughCache(cacheKey, async () => {
    const dataset = await getDataset();

    return {
      faculties: sortItems(dataset.faculties, "name", "asc"),
      programmes: sortItems(dataset.programmes, "name", "asc"),
      classes: sortItems(dataset.classes.map((classItem) => enrichClass(classItem, dataset)), "displayName", "asc")
    };
  });
}

export function preloadWorkspaceData(user) {
  if (!user) {
    return Promise.resolve();
  }

  return Promise.all([
    getFacultiesForRole(user),
    getProgrammesForRole(user),
    getClassesForRole(user),
    getReportsForRole(user),
    getRatingsForRole(user),
    getAttendanceForRole(user),
    getMonitoringForRole(user)
  ]);
}

export async function saveReport(report) {
  if (isFirebaseReady()) {
    const created = await createDocument(COLLECTIONS.reports, report);
    clearDataCaches();
    return created;
  }

  const reports = await loadItem("reports", mockReports);
  const nextReports = [{ id: `report-${Date.now()}`, ...report }, ...reports];
  await saveItem("reports", nextReports);
  clearDataCaches();
  return nextReports;
}

export async function saveRating(rating) {
  if (isFirebaseReady()) {
    const created = await createDocument(COLLECTIONS.ratings, {
      ...rating,
      createdAt: rating.createdAt || new Date().toISOString()
    });
    clearDataCaches();
    return created;
  }

  const ratings = await loadItem("ratings", mockRatings);
  const nextRatings = [{ id: `rating-${Date.now()}`, ...rating }, ...ratings];
  await saveItem("ratings", nextRatings);
  clearDataCaches();
  return nextRatings;
}

export async function saveAttendance(record) {
  if (isFirebaseReady()) {
    const created = await createDocument(COLLECTIONS.attendance, record);
    clearDataCaches();
    return created;
  }

  const attendance = await loadItem("attendance", mockAttendance);
  const nextAttendance = [{ id: `attendance-${Date.now()}`, ...record }, ...attendance];
  await saveItem("attendance", nextAttendance);
  clearDataCaches();
  return nextAttendance;
}

export async function updateReportFeedback(reportId, seniorLecturerFeedback, reviewStatus = "reviewed", user = null) {
  if (isFirebaseReady()) {
    await updateDocument(COLLECTIONS.reports, reportId, {
      seniorLecturerFeedback,
      reviewStatus,
      reviewedAt: new Date().toISOString()
    });
  } else {
    const reports = await loadItem("reports", mockReports);
    const nextReports = reports.map((report) =>
      report.id === reportId
        ? {
            ...report,
            seniorLecturerFeedback,
            reviewStatus,
            reviewedAt: new Date().toISOString()
          }
        : report
    );

    await saveItem("reports", nextReports);
  }

  clearDataCaches();

  if (user) {
    return getReportsForRole(user);
  }

  return getReportsForRole({ id: "fmg-1", role: "fmg" });
}

export async function saveClassAssignment(classItem) {
  if (isFirebaseReady()) {
    if (classItem.id) {
      const { id, ...payload } = classItem;
      await upsertDocument(COLLECTIONS.classes, id, payload);
    } else {
      await createDocument(COLLECTIONS.classes, classItem);
    }
  } else {
    const classes = await loadItem("classes", mockClasses);
    const index = classes.findIndex((item) => item.id === classItem.id);
    const nextClasses =
      index >= 0
        ? classes.map((item) => (item.id === classItem.id ? { ...item, ...classItem } : item))
        : [{ id: classItem.id || `class-${Date.now()}`, ...classItem }, ...classes];

    await saveItem("classes", nextClasses);
  }

  clearDataCaches();

  return getClassesForRole({ id: "fmg-1", role: "fmg" });
}

async function removeFromLocalCollection(storageKey, fallback, itemId) {
  const items = await loadItem(storageKey, fallback);
  const nextItems = items.filter((item) => item.id !== itemId);
  await saveItem(storageKey, nextItems);
  return nextItems;
}

export async function deleteReport(reportId, user = { id: "fmg-1", role: "fmg" }) {
  if (isFirebaseReady()) {
    await deleteDocumentById(COLLECTIONS.reports, reportId);
  } else {
    await removeFromLocalCollection("reports", mockReports, reportId);
  }

  clearDataCaches();

  return getReportsForRole(user);
}

export async function deleteRating(ratingId, user = { id: "fmg-1", role: "fmg" }) {
  if (isFirebaseReady()) {
    await deleteDocumentById(COLLECTIONS.ratings, ratingId);
  } else {
    await removeFromLocalCollection("ratings", mockRatings, ratingId);
  }

  clearDataCaches();

  return getRatingsForRole(user);
}

export async function deleteAttendance(attendanceId, user = { id: "fmg-1", role: "fmg" }) {
  if (isFirebaseReady()) {
    await deleteDocumentById(COLLECTIONS.attendance, attendanceId);
  } else {
    await removeFromLocalCollection("attendance", mockAttendance, attendanceId);
  }

  clearDataCaches();

  return getAttendanceForRole(user);
}

export async function deleteClassAssignment(classId, user = { id: "fmg-1", role: "fmg" }) {
  if (isFirebaseReady()) {
    await deleteDocumentById(COLLECTIONS.classes, classId);
  } else {
    await removeFromLocalCollection("classes", mockClasses, classId);
  }

  clearDataCaches();

  return getClassesForRole(user);
}

export async function signOutUser() {
  if (isFirebaseReady()) {
    await signOut(auth);
  }

  clearDataCaches();
}

export function buildReportFromClass(classItem, values, user) {
  return {
    classId: classItem.id,
    facultyId: classItem.facultyId,
    programmeId: classItem.programmeId,
    lecturerId: user.id,
    lecturerName: user.fullName,
    classDisplayName: classItem.displayName,
    courseName: classItem.courseName,
    lectureDate: values.lectureDate,
    weekLabel: values.weekLabel,
    attendancePresent: Number(values.attendancePresent),
    attendanceTotal: Number(values.attendanceTotal || classItem.studentCount),
    topic: values.topic,
    outcomes: values.outcomes,
    recommendations: values.recommendations,
    reviewStatus: "submitted",
    seniorLecturerFeedback: "",
    submittedAt: new Date().toISOString()
  };
}
