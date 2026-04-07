export const mockUsers = [
  {
    id: "lecturer-1",
    fullName: "John Mokoena",
    email: "lecturer@limko.com",
    password: "123456",
    role: "lecturer",
    facultyName: "Faculty of Information Communication Technology"
  },
  {
    id: "student-1",
    fullName: "Palesa Nthoi",
    email: "student@limko.com",
    password: "123456",
    role: "student",
    facultyName: "Faculty of Information Communication Technology"
  },
  {
    id: "prl-1",
    fullName: "Mpho Letsie",
    email: "prl@limko.com",
    password: "123456",
    role: "prl",
    facultyName: "Faculty of Information Communication Technology"
  },
  {
    id: "pl-1",
    fullName: "Nthabiseng Khati",
    email: "pl@limko.com",
    password: "123456",
    role: "pl",
    facultyName: "Faculty of Information Communication Technology"
  }
];

export const mockCourses = [
  {
    id: "course-1",
    facultyName: "Faculty of Information Communication Technology",
    className: "BSCSMY3S2",
    courseName: "Mobile Application Development",
    courseCode: "SEM302",
    lecturerId: "lecturer-1",
    principalLecturerId: "prl-1",
    totalRegisteredStudents: 42,
    venue: "Lab 3",
    scheduledLectureTime: "08:00 - 10:00",
    stream: "Software Engineering with Multimedia",
    day: "Tuesday"
  },
  {
    id: "course-2",
    facultyName: "Faculty of Information Communication Technology",
    className: "BSCSMY3S2",
    courseName: "Human Computer Interaction",
    courseCode: "SEM304",
    lecturerId: "lecturer-1",
    principalLecturerId: "prl-1",
    totalRegisteredStudents: 39,
    venue: "Room B12",
    scheduledLectureTime: "11:00 - 13:00",
    stream: "Software Engineering with Multimedia",
    day: "Thursday"
  }
];

export const mockReports = [
  {
    id: "report-1",
    facultyName: "Faculty of Information Communication Technology",
    className: "BSCSMY3S2",
    weekOfReporting: "Week 6",
    dateOfLecture: "2026-04-02",
    courseId: "course-1",
    courseName: "Mobile Application Development",
    courseCode: "SEM302",
    lecturerId: "lecturer-1",
    lecturerName: "John Mokoena",
    actualStudentsPresent: 36,
    totalRegisteredStudents: 42,
    venue: "Lab 3",
    scheduledLectureTime: "08:00 - 10:00",
    topicTaught: "Expo routing and state management",
    learningOutcomes: "Students can structure screens and navigate using Expo Router.",
    lecturerRecommendations: "Need more lab time for practical exercises.",
    prlFeedback: "Good progress. Add one more hands-on activity next week.",
    reviewStatus: "reviewed",
    submittedAt: "2026-04-02T09:45:00.000Z"
  }
];

export const mockAttendance = [
  {
    id: "attendance-1",
    courseId: "course-1",
    lectureDate: "2026-04-02",
    lecturerId: "lecturer-1",
    totalPresent: 36
  },
  {
    id: "attendance-2",
    courseId: "course-2",
    lectureDate: "2026-04-03",
    lecturerId: "lecturer-1",
    totalPresent: 31
  }
];

export const mockRatings = [
  {
    id: "rating-1",
    courseId: "course-1",
    lecturerId: "lecturer-1",
    studentId: "student-1",
    rating: 4,
    comment: "Clear explanations and good pace.",
    createdAt: "2026-04-03T10:00:00.000Z"
  }
];
