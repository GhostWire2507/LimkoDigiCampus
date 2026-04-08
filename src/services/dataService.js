import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where
} from "firebase/firestore";
import { mockAttendance, mockCourses, mockRatings, mockReports, mockUsers } from "../data/mockData";
import { auth, db, hasFirebaseConfig } from "../lib/firebase";
import { loadItem, saveItem } from "./storage";

const COLLECTIONS = {
  users: "users",
  courses: "courses",
  reports: "reports",
  ratings: "ratings",
  attendance: "attendance"
};

function isFirebaseReady() {
  return Boolean(hasFirebaseConfig && auth && db);
}

function mapDoc(entry) {
  return { id: entry.id, ...entry.data() };
}

function sortItems(items, field, direction = "desc") {
  return [...items].sort((left, right) => {
    const leftValue = left?.[field] || "";
    const rightValue = right?.[field] || "";

    if (leftValue === rightValue) {
      return 0;
    }

    if (direction === "asc") {
      return leftValue > rightValue ? 1 : -1;
    }

    return leftValue < rightValue ? 1 : -1;
  });
}

async function getUserProfile(uid) {
  try {
    const userRef = doc(db, COLLECTIONS.users, uid);
    const snapshot = await getDoc(userRef);

    if (!snapshot.exists()) {
      throw new Error("Your account exists in Firebase Auth, but the user profile is missing in Firestore.");
    }

    return { id: snapshot.id, ...snapshot.data() };
  } catch (error) {
    if (error?.code === "permission-denied") {
      throw new Error("Firestore denied access to the user profile. Update your Firestore rules in Firebase Console and try again.");
    }

    throw error;
  }
}

async function getCollectionItems(name, options = {}) {
  try {
    const constraints = [];

    if (options.where) {
      constraints.push(where(options.where.field, options.where.operator || "==", options.where.value));
    }

    if (options.orderBy) {
      constraints.push(orderBy(options.orderBy.field, options.orderBy.direction || "desc"));
    }

    const target = collection(db, name);
    const snapshot = constraints.length ? await getDocs(query(target, ...constraints)) : await getDocs(target);
    return snapshot.docs.map(mapDoc);
  } catch (error) {
    if (error?.code === "permission-denied") {
      throw new Error(`Firestore denied access to the ${name} collection. Update your Firestore rules in Firebase Console and try again.`);
    }

    throw error;
  }
}

function withFallback(value, fallback) {
  return value === undefined || value === null || value === "" ? fallback : value;
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

export async function bootstrapLocalData() {
  if (isFirebaseReady()) {
    return;
  }

  const reports = await loadItem("reports", null);
  const ratings = await loadItem("ratings", null);
  const courses = await loadItem("courses", null);
  const attendance = await loadItem("attendance", null);

  if (!reports) await saveItem("reports", mockReports);
  if (!ratings) await saveItem("ratings", mockRatings);
  if (!courses) await saveItem("courses", mockCourses);
  if (!attendance) await saveItem("attendance", mockAttendance);
}

export async function restoreUserSession() {
  if (isFirebaseReady()) {
    if (!auth.currentUser) {
      return null;
    }

    return getUserProfile(auth.currentUser.uid);
  }

  return loadItem("currentUser", null);
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

  const matchedUser = mockUsers.find(
    (user) => user.email.toLowerCase() === email.toLowerCase() && user.password === password
  );

  if (!matchedUser) {
    throw new Error("Invalid email or password.");
  }

  return matchedUser;
}

export async function registerUser(payload) {
  if (isFirebaseReady()) {
    try {
      const credentials = await createUserWithEmailAndPassword(auth, payload.email.trim(), payload.password);
      const nextUser = {
        id: credentials.user.uid,
        fullName: payload.fullName,
        email: payload.email.trim().toLowerCase(),
        role: payload.role,
        facultyName: payload.facultyName || "Faculty of Information Communication Technology",
        projectId: "limkodigicampus",
        projectNumber: "823990853810",
        createdAt: new Date().toISOString()
      };

      await setDoc(doc(db, COLLECTIONS.users, credentials.user.uid), {
        ...nextUser,
        createdAt: serverTimestamp()
      });

      return nextUser;
    } catch (error) {
      throw new Error(toFirebaseErrorMessage(error));
    }
  }

  return {
    id: `user-${Date.now()}`,
    facultyName: "Faculty of Information Communication Technology",
    ...payload
  };
}

export async function getCoursesForRole(user) {
  if (isFirebaseReady()) {
    if (user.role === "lecturer") {
      return sortItems(
        await getCollectionItems(COLLECTIONS.courses, {
          where: { field: "lecturerId", value: user.id }
        }),
        "courseName",
        "asc"
      );
    }

    if (user.role === "prl") {
      return sortItems(
        await getCollectionItems(COLLECTIONS.courses, {
          where: { field: "principalLecturerId", value: user.id }
        }),
        "courseName",
        "asc"
      );
    }

    return getCollectionItems(COLLECTIONS.courses, {
      orderBy: { field: "courseName", direction: "asc" }
    });
  }

  const storedCourses = await loadItem("courses", mockCourses);

  if (user.role === "lecturer") {
    return storedCourses.filter((course) => course.lecturerId === user.id);
  }

  if (user.role === "prl") {
    return storedCourses.filter((course) => course.principalLecturerId === user.id);
  }

  return storedCourses;
}

export async function getReportsForRole(user) {
  if (isFirebaseReady()) {
    if (user.role === "lecturer") {
      return sortItems(
        await getCollectionItems(COLLECTIONS.reports, {
          where: { field: "lecturerId", value: user.id }
        }),
        "submittedAt",
        "desc"
      );
    }

    return getCollectionItems(COLLECTIONS.reports, {
      orderBy: { field: "submittedAt", direction: "desc" }
    });
  }

  const storedReports = await loadItem("reports", mockReports);

  if (user.role === "lecturer") {
    return storedReports.filter((report) => report.lecturerId === user.id);
  }

  return storedReports;
}

export async function getRatingsForRole(user) {
  if (isFirebaseReady()) {
    if (user.role === "student") {
      return sortItems(
        await getCollectionItems(COLLECTIONS.ratings, {
          where: { field: "studentId", value: user.id }
        }),
        "createdAt",
        "desc"
      );
    }

    if (user.role === "lecturer") {
      return sortItems(
        await getCollectionItems(COLLECTIONS.ratings, {
          where: { field: "lecturerId", value: user.id }
        }),
        "createdAt",
        "desc"
      );
    }

    return getCollectionItems(COLLECTIONS.ratings, {
      orderBy: { field: "createdAt", direction: "desc" }
    });
  }

  const storedRatings = await loadItem("ratings", mockRatings);

  if (user.role === "student") {
    return storedRatings.filter((rating) => rating.studentId === user.id);
  }

  if (user.role === "lecturer") {
    return storedRatings.filter((rating) => rating.lecturerId === user.id);
  }

  return storedRatings;
}

export async function getAttendanceForRole(user) {
  if (isFirebaseReady()) {
    if (user.role === "lecturer") {
      return sortItems(
        await getCollectionItems(COLLECTIONS.attendance, {
          where: { field: "lecturerId", value: user.id }
        }),
        "lectureDate",
        "desc"
      );
    }

    return getCollectionItems(COLLECTIONS.attendance, {
      orderBy: { field: "lectureDate", direction: "desc" }
    });
  }

  const storedAttendance = await loadItem("attendance", mockAttendance);

  if (user.role === "lecturer") {
    return storedAttendance.filter((item) => item.lecturerId === user.id);
  }

  return storedAttendance;
}

export async function saveReport(report) {
  if (isFirebaseReady()) {
    const payload = {
      ...report,
      submittedAt: report.submittedAt || new Date().toISOString(),
      createdAt: serverTimestamp()
    };
    const snapshot = await addDoc(collection(db, COLLECTIONS.reports), payload);
    return { id: snapshot.id, ...payload };
  }

  const storedReports = await loadItem("reports", mockReports);
  const nextReports = [{ id: `report-${Date.now()}`, ...report }, ...storedReports];
  await saveItem("reports", nextReports);
  return nextReports;
}

export async function saveRating(rating) {
  if (isFirebaseReady()) {
    const payload = {
      ...rating,
      createdAt: rating.createdAt || new Date().toISOString()
    };
    await addDoc(collection(db, COLLECTIONS.ratings), payload);
    return getRatingsForRole({ id: rating.studentId, role: "student" });
  }

  const storedRatings = await loadItem("ratings", mockRatings);
  const nextRatings = [{ id: `rating-${Date.now()}`, ...rating }, ...storedRatings];
  await saveItem("ratings", nextRatings);
  return nextRatings;
}

export async function saveAttendance(record) {
  if (isFirebaseReady()) {
    const payload = {
      ...record,
      createdAt: serverTimestamp()
    };
    await addDoc(collection(db, COLLECTIONS.attendance), payload);
    return getAttendanceForRole({ id: record.lecturerId, role: "lecturer" });
  }

  const storedAttendance = await loadItem("attendance", mockAttendance);
  const nextAttendance = [{ id: `attendance-${Date.now()}`, ...record }, ...storedAttendance];
  await saveItem("attendance", nextAttendance);
  return nextAttendance;
}

export async function updateReportFeedback(reportId, prlFeedback, reviewStatus = "reviewed") {
  if (isFirebaseReady()) {
    await updateDoc(doc(db, COLLECTIONS.reports, reportId), {
      prlFeedback,
      reviewStatus,
      reviewedAt: new Date().toISOString()
    });

    return getCollectionItems(COLLECTIONS.reports, {
      orderBy: { field: "submittedAt", direction: "desc" }
    });
  }

  const storedReports = await loadItem("reports", mockReports);
  const nextReports = storedReports.map((report) =>
    report.id === reportId
      ? {
          ...report,
          prlFeedback,
          reviewStatus,
          reviewedAt: new Date().toISOString()
        }
      : report
  );

  await saveItem("reports", nextReports);
  return nextReports;
}

export async function saveCourse(course) {
  if (isFirebaseReady()) {
    if (course.id) {
      const { id, ...payload } = course;
      await setDoc(doc(db, COLLECTIONS.courses, id), payload, { merge: true });
      return getCollectionItems(COLLECTIONS.courses, {
        orderBy: { field: "courseName", direction: "asc" }
      });
    }

    await addDoc(collection(db, COLLECTIONS.courses), {
      ...course,
      createdAt: serverTimestamp()
    });

    return getCollectionItems(COLLECTIONS.courses, {
      orderBy: { field: "courseName", direction: "asc" }
    });
  }

  const storedCourses = await loadItem("courses", mockCourses);
  const index = storedCourses.findIndex((item) => item.id === course.id);
  let nextCourses = storedCourses;

  if (index >= 0) {
    nextCourses = storedCourses.map((item) => (item.id === course.id ? { ...item, ...course } : item));
  } else {
    nextCourses = [{ id: `course-${Date.now()}`, ...course }, ...storedCourses];
  }

  await saveItem("courses", nextCourses);
  return nextCourses;
}

export async function signOutUser() {
  if (isFirebaseReady()) {
    await signOut(auth);
  }
}

export function buildReportFromCourse(course, values, user) {
  return {
    facultyName: values.facultyName || course.facultyName,
    className: values.className || course.className,
    weekOfReporting: values.weekOfReporting,
    dateOfLecture: values.dateOfLecture,
    courseId: course.id,
    courseName: values.courseName || course.courseName,
    courseCode: values.courseCode || course.courseCode,
    lecturerId: user.id,
    lecturerName: user.fullName,
    actualStudentsPresent: Number(values.actualStudentsPresent),
    totalRegisteredStudents: Number(withFallback(values.totalRegisteredStudents, course.totalRegisteredStudents)),
    venue: values.venue || course.venue,
    scheduledLectureTime: values.scheduledLectureTime || course.scheduledLectureTime,
    topicTaught: values.topicTaught,
    learningOutcomes: values.learningOutcomes,
    lecturerRecommendations: values.lecturerRecommendations,
    reviewStatus: "submitted",
    submittedAt: new Date().toISOString()
  };
}
