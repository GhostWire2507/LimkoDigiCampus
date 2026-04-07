import { mockAttendance, mockCourses, mockRatings, mockReports, mockUsers } from "../data/mockData";
import { auth, db, hasFirebaseConfig } from "../lib/firebase";
import { loadItem, saveItem } from "./storage";

function withFallback(value, fallback) {
  return value === undefined || value === null || value === "" ? fallback : value;
}

export async function bootstrapLocalData() {
  const reports = await loadItem("reports", null);
  const ratings = await loadItem("ratings", null);
  const courses = await loadItem("courses", null);
  const attendance = await loadItem("attendance", null);

  if (!reports) await saveItem("reports", mockReports);
  if (!ratings) await saveItem("ratings", mockRatings);
  if (!courses) await saveItem("courses", mockCourses);
  if (!attendance) await saveItem("attendance", mockAttendance);
}

export async function loginUser(email, password) {
  if (hasFirebaseConfig && auth && db) {
    throw new Error("Firebase auth flow is ready for integration. Add the production Firebase auth calls in dataService.js.");
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
  return {
    id: `user-${Date.now()}`,
    facultyName: "Faculty of Information Communication Technology",
    ...payload
  };
}

export async function getCoursesForRole(user) {
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
  const storedReports = await loadItem("reports", mockReports);

  if (user.role === "lecturer") {
    return storedReports.filter((report) => report.lecturerId === user.id);
  }

  return storedReports;
}

export async function getRatingsForRole(user) {
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
  const storedAttendance = await loadItem("attendance", mockAttendance);

  if (user.role === "lecturer") {
    return storedAttendance.filter((item) => item.lecturerId === user.id);
  }

  return storedAttendance;
}

export async function saveReport(report) {
  const storedReports = await loadItem("reports", mockReports);
  const nextReports = [{ id: `report-${Date.now()}`, ...report }, ...storedReports];
  await saveItem("reports", nextReports);
  return nextReports;
}

export async function saveRating(rating) {
  const storedRatings = await loadItem("ratings", mockRatings);
  const nextRatings = [{ id: `rating-${Date.now()}`, ...rating }, ...storedRatings];
  await saveItem("ratings", nextRatings);
  return nextRatings;
}

export async function saveAttendance(record) {
  const storedAttendance = await loadItem("attendance", mockAttendance);
  const nextAttendance = [{ id: `attendance-${Date.now()}`, ...record }, ...storedAttendance];
  await saveItem("attendance", nextAttendance);
  return nextAttendance;
}

export async function updateReportFeedback(reportId, prlFeedback, reviewStatus = "reviewed") {
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
