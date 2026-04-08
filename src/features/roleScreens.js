import { useEffect, useState } from "react";
import { Alert, ScrollView, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { AppButton } from "../components/AppButton";
import { AppHeader, GreetingHeader } from "../components/AppHeader";
import { AppText } from "../components/AppText";
import { Card } from "../components/Card";
import { EmptyState } from "../components/EmptyState";
import { TextField } from "../components/FormFields";
import { RolePill } from "../components/RolePill";
import { SearchBar } from "../components/SearchBar";
import { StatCard } from "../components/StatCard";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import {
  buildReportFromCourse,
  getAttendanceForRole,
  getCoursesForRole,
  getRatingsForRole,
  getReportsForRole,
  saveAttendance,
  saveCourse,
  saveRating,
  saveReport,
  updateReportFeedback
} from "../services/dataService";
import { exportReportsToCsv } from "../services/exportService";
import { filterByQuery, formatRole, getAttendanceRate } from "../utils/helpers";

export function DashboardScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [courses, setCourses] = useState([]);
  const [reports, setReports] = useState([]);
  const [ratings, setRatings] = useState([]);
  const [attendance, setAttendance] = useState([]);

  useEffect(() => {
    if (!user) {
      return;
    }

    Promise.all([
      getCoursesForRole(user),
      getReportsForRole(user),
      getRatingsForRole(user),
      getAttendanceForRole(user)
    ]).then(([coursesResult, reportsResult, ratingsResult, attendanceResult]) => {
      setCourses(coursesResult);
      setReports(reportsResult);
      setRatings(ratingsResult);
      setAttendance(attendanceResult);
    });
  }, [user]);

  if (!user) {
    return (
      <ScrollView showsVerticalScrollIndicator={false}>
        <AppHeader title="Dashboard" subtitle="Sign in to load your workspace." />
        <EmptyState title="Profile unavailable" description="Your account data could not be loaded yet. Sign in again after confirming Firestore access." />
      </ScrollView>
    );
  }

  const nextCourse = courses[0];
  const totalPresent = attendance.reduce((sum, item) => sum + Number(item.totalPresent || 0), 0);
  const totalCapacity = courses.reduce((sum, item) => sum + Number(item.totalRegisteredStudents || 0), 0);
  const attendanceRate = getAttendanceRate(totalPresent, totalCapacity);

  const quickActions = {
    student: [
      { title: "View Classes", href: "/classes" },
      { title: "Rate Lecturer", href: "/ratings" }
    ],
    lecturer: [
      { title: "Add Report", href: "/reports" },
      { title: "Take Attendance", href: "/attendance" }
    ],
    prl: [
      { title: "Review Reports", href: "/reports" },
      { title: "View Courses", href: "/classes" }
    ],
    pl: [
      { title: "Manage Courses", href: "/classes" },
      { title: "Reports Overview", href: "/reports" }
    ]
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <GreetingHeader user={user} />
      <RolePill label={`${formatRole(user.role)} Portal`} />

      <View style={{ flexDirection: "row", gap: 12, marginTop: 16, marginBottom: 16 }}>
        <StatCard label="Attendance" value={`${attendanceRate}%`} helper="Average class presence" />
        <StatCard label="Active Classes" value={courses.length} helper="Assigned to your account" />
      </View>

      {nextCourse ? (
        <Card>
          <AppText variant="caption">Upcoming class</AppText>
          <AppText variant="heading" style={{ marginTop: 6 }}>
            {nextCourse.courseName}
          </AppText>
          <AppText variant="body" style={{ marginTop: 8 }}>
            {nextCourse.className} • {nextCourse.venue}
          </AppText>
          <AppText variant="caption" style={{ marginTop: 4 }}>
            {nextCourse.day} • {nextCourse.scheduledLectureTime}
          </AppText>
        </Card>
      ) : (
        <EmptyState title="No classes assigned yet" description="Your dashboard cards will update as soon as courses are linked to your account." />
      )}

      <Card>
        <AppText variant="heading">Quick actions</AppText>
        <View style={{ gap: 12, marginTop: 14 }}>
          {quickActions[user.role].map((action) => (
            <AppButton key={action.title} title={action.title} onPress={() => router.push(action.href)} />
          ))}
        </View>
      </Card>

      <Card>
        <AppText variant="heading">Live summary</AppText>
        <AppText variant="body" style={{ marginTop: 12 }}>
          Reports: {reports.length}
        </AppText>
        <AppText variant="body" style={{ marginTop: 6 }}>
          Ratings: {ratings.length}
        </AppText>
      </Card>
    </ScrollView>
  );
}

export function ClassesScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [courses, setCourses] = useState([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    getCoursesForRole(user).then(setCourses);
  }, [user]);

  const filteredCourses = filterByQuery(courses, query, ["courseName", "courseCode", "className", "venue"]);

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <AppHeader title="Classes" subtitle="Search, view, and manage course sessions." />
      <SearchBar value={query} onChangeText={setQuery} placeholder="Search by course, code, class, or venue" />

      {user.role === "pl" ? (
        <AppButton title="Add New Course" onPress={() => router.push("/course-form")} style={{ marginBottom: 16 }} />
      ) : null}

      {filteredCourses.length ? (
        filteredCourses.map((course) => (
          <Card key={course.id}>
            <AppText variant="heading">{course.courseName}</AppText>
            <AppText variant="body" style={{ marginTop: 8 }}>
              {course.courseCode} • {course.className}
            </AppText>
            <AppText variant="caption" style={{ marginTop: 8 }}>
              {course.venue} • {course.scheduledLectureTime}
            </AppText>
            <View style={{ flexDirection: "row", gap: 10, marginTop: 16 }}>
              <AppButton title="View" variant="secondary" style={{ flex: 1 }} onPress={() => router.push({ pathname: "/class-detail", params: { courseId: course.id } })} />
              {user.role === "lecturer" ? (
                <AppButton title="Add Report" style={{ flex: 1 }} onPress={() => router.push({ pathname: "/report-form", params: { courseId: course.id } })} />
              ) : null}
            </View>
          </Card>
        ))
      ) : (
        <EmptyState title="No class matches" description="Try a different search term or add the first course in the management module." />
      )}
    </ScrollView>
  );
}

function PrlFeedbackForm({ report, onSaved }) {
  const [feedback, setFeedback] = useState(report.prlFeedback || "");

  const handleSave = async () => {
    const nextReports = await updateReportFeedback(report.id, feedback, "reviewed");
    onSaved(nextReports);
    Alert.alert("Feedback saved", "The report has been reviewed successfully.");
  };

  return (
    <View style={{ marginTop: 16 }}>
      <TextField label="PRL Feedback" value={feedback} onChangeText={setFeedback} placeholder="Add guidance for the lecturer" multiline />
      <AppButton title="Save Feedback" onPress={handleSave} />
    </View>
  );
}

export function ReportsScreen() {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    getReportsForRole(user).then(setReports);
  }, [user]);

  const filteredReports = filterByQuery(reports, query, [
    "courseName",
    "courseCode",
    "lecturerName",
    "weekOfReporting",
    "reviewStatus"
  ]);

  const handleExport = async () => {
    await exportReportsToCsv(filteredReports);
    Alert.alert("Export ready", "The report file was generated and shared as CSV.");
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <AppHeader title="Reports" subtitle="Track submitted lecture reports and feedback." />
      <SearchBar value={query} onChangeText={setQuery} placeholder="Search by course, lecturer, week, or status" />
      <AppButton title="Export CSV" variant="secondary" onPress={handleExport} style={{ marginBottom: 16 }} />

      {filteredReports.length ? (
        filteredReports.map((report) => (
          <Card key={report.id}>
            <AppText variant="heading">{report.courseName}</AppText>
            <AppText variant="caption" style={{ marginTop: 8 }}>
              {report.weekOfReporting} • {report.dateOfLecture}
            </AppText>
            <AppText variant="body" style={{ marginTop: 10 }}>
              Attendance: {report.actualStudentsPresent}/{report.totalRegisteredStudents}
            </AppText>
            <AppText variant="body" style={{ marginTop: 6 }}>
              Topic: {report.topicTaught}
            </AppText>
            <AppText variant="caption" style={{ marginTop: 10 }}>
              Status: {report.reviewStatus}
            </AppText>

            {user.role === "prl" ? <PrlFeedbackForm report={report} onSaved={setReports} /> : null}

            {report.prlFeedback ? (
              <View style={{ marginTop: 12 }}>
                <AppText variant="subheading">PRL feedback</AppText>
                <AppText variant="caption" style={{ marginTop: 6 }}>
                  {report.prlFeedback}
                </AppText>
              </View>
            ) : null}
          </Card>
        ))
      ) : (
        <EmptyState title="No reports found" description="Submitted reports will appear here and can be searched by course, lecturer, or week." />
      )}
    </ScrollView>
  );
}

export function AttendanceScreen() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [totalPresent, setTotalPresent] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

  useEffect(() => {
    Promise.all([getCoursesForRole(user), getAttendanceForRole(user)]).then(([coursesResult, attendanceResult]) => {
      setCourses(coursesResult);
      setAttendance(attendanceResult);
      if (coursesResult[0]) {
        setSelectedCourseId(coursesResult[0].id);
      }
    });
  }, [user]);

  const submitAttendance = async () => {
    if (!selectedCourseId || !totalPresent) {
      Alert.alert("Missing values", "Choose a class and enter the number of students present.");
      return;
    }

    const next = await saveAttendance({
      courseId: selectedCourseId,
      lectureDate: date,
      lecturerId: user.id,
      totalPresent: Number(totalPresent)
    });
    setAttendance(next);
    setTotalPresent("");
    Alert.alert("Attendance saved", "Student attendance has been recorded.");
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <AppHeader title="Attendance" subtitle="Track class presence and monitor student participation." />

      {user.role === "lecturer" ? (
        <Card>
          <AppText variant="heading">Take attendance</AppText>
          <TextField label="Course ID" value={selectedCourseId} onChangeText={setSelectedCourseId} placeholder="course-1" />
          <TextField label="Lecture Date" value={date} onChangeText={setDate} placeholder="YYYY-MM-DD" />
          <TextField label="Students Present" value={totalPresent} onChangeText={setTotalPresent} placeholder="36" keyboardType="numeric" />
          <AppButton title="Save Attendance" onPress={submitAttendance} />
        </Card>
      ) : null}

      {attendance.length ? (
        attendance.map((item) => {
          const course = courses.find((entry) => entry.id === item.courseId) || {};
          const percentage = getAttendanceRate(item.totalPresent, course.totalRegisteredStudents);
          return (
            <Card key={item.id}>
              <AppText variant="heading">{course.courseName || "Class attendance"}</AppText>
              <AppText variant="body" style={{ marginTop: 8 }}>
                Present: {item.totalPresent}/{course.totalRegisteredStudents || "-"}
              </AppText>
              <AppText variant="caption" style={{ marginTop: 8 }}>
                {item.lectureDate} • {percentage}% attendance
              </AppText>
            </Card>
          );
        })
      ) : (
        <EmptyState title="No attendance yet" description="Start by recording the students present for a class session." />
      )}
    </ScrollView>
  );
}

export function RatingsScreen() {
  const { user } = useAuth();
  const [ratings, setRatings] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [rating, setRating] = useState("5");
  const [comment, setComment] = useState("");

  useEffect(() => {
    Promise.all([getRatingsForRole(user), getCoursesForRole(user)]).then(([ratingsResult, coursesResult]) => {
      setRatings(ratingsResult);
      setCourses(coursesResult);
      if (coursesResult[0]) {
        setSelectedCourseId(coursesResult[0].id);
      }
    });
  }, [user]);

  const submitRating = async () => {
    if (user.role !== "student") return;

    const selectedCourse = courses.find((course) => course.id === selectedCourseId) || {};
    const nextRatings = await saveRating({
      courseId: selectedCourseId,
      lecturerId: selectedCourse.lecturerId,
      studentId: user.id,
      rating: Number(rating),
      comment,
      createdAt: new Date().toISOString()
    });
    setRatings(nextRatings);
    setComment("");
    Alert.alert("Rating saved", "Your lecturer feedback has been submitted.");
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <AppHeader title="Ratings" subtitle="Capture feedback and monitor lecturer performance." />

      {user.role === "student" ? (
        <Card>
          <AppText variant="heading">Rate lecturer</AppText>
          <TextField label="Course ID" value={selectedCourseId} onChangeText={setSelectedCourseId} placeholder="course-1" />
          <TextField label="Rating (1-5)" value={rating} onChangeText={setRating} placeholder="5" keyboardType="numeric" />
          <TextField label="Comment" value={comment} onChangeText={setComment} placeholder="What went well?" multiline />
          <AppButton title="Submit Rating" onPress={submitRating} />
        </Card>
      ) : null}

      {ratings.length ? (
        ratings.map((item) => (
          <Card key={item.id}>
            <AppText variant="heading">Rating: {item.rating}/5</AppText>
            <AppText variant="caption" style={{ marginTop: 8 }}>
              Course ID: {item.courseId}
            </AppText>
            <AppText variant="body" style={{ marginTop: 10 }}>
              {item.comment || "No comment provided."}
            </AppText>
          </Card>
        ))
      ) : (
        <EmptyState title="No ratings yet" description="Students can submit lecturer ratings, and lecturers can monitor the feedback here." />
      )}
    </ScrollView>
  );
}

export function ProfileScreen() {
  const { user, signOut } = useAuth();
  const { mode, toggleTheme } = useTheme();

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <AppHeader title="Profile" subtitle="Theme, role details, and account actions." />
      <Card>
        <AppText variant="heading">{user.fullName}</AppText>
        <AppText variant="body" style={{ marginTop: 10 }}>
          {user.email}
        </AppText>
        <AppText variant="caption" style={{ marginTop: 6 }}>
          {formatRole(user.role)} • {user.facultyName}
        </AppText>
      </Card>

      <Card>
        <AppText variant="heading">Appearance</AppText>
        <AppText variant="body" style={{ marginTop: 10 }}>
          Current theme: {mode}
        </AppText>
        <AppButton title="Toggle Theme" variant="secondary" onPress={toggleTheme} style={{ marginTop: 14 }} />
      </Card>

      <AppButton title="Logout" onPress={signOut} />
    </ScrollView>
  );
}

export function ReportFormScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const { courseId } = useLocalSearchParams();
  const [course, setCourse] = useState(null);
  const [step, setStep] = useState(1);
  const [values, setValues] = useState({
    facultyName: "",
    className: "",
    courseName: "",
    courseCode: "",
    weekOfReporting: "",
    dateOfLecture: new Date().toISOString().slice(0, 10),
    venue: "",
    scheduledLectureTime: "",
    actualStudentsPresent: "",
    totalRegisteredStudents: "",
    topicTaught: "",
    learningOutcomes: "",
    lecturerRecommendations: ""
  });

  useEffect(() => {
    getCoursesForRole(user).then((courses) => {
      const matchedCourse = courses.find((item) => item.id === courseId) || courses[0];
      setCourse(matchedCourse);
      if (matchedCourse) {
        setValues((current) => ({
          ...current,
          facultyName: matchedCourse.facultyName,
          className: matchedCourse.className,
          courseName: matchedCourse.courseName,
          courseCode: matchedCourse.courseCode,
          venue: matchedCourse.venue,
          scheduledLectureTime: matchedCourse.scheduledLectureTime,
          totalRegisteredStudents: String(matchedCourse.totalRegisteredStudents)
        }));
      }
    });
  }, [courseId, user]);

  const update = (key, value) => setValues((current) => ({ ...current, [key]: value }));

  const submit = async () => {
    if (!course) {
      Alert.alert("No class selected", "Please return to classes and choose a course before submitting.");
      return;
    }

    const report = buildReportFromCourse(course, values, user);
    await saveReport(report);
    Alert.alert("Report submitted", "The lecturer report has been saved successfully.");
    router.replace("/reports");
  };

  const stepContent = {
    1: (
      <>
        <TextField label="Faculty Name" value={values.facultyName} onChangeText={(value) => update("facultyName", value)} placeholder="Faculty name" />
        <TextField label="Class Name" value={values.className} onChangeText={(value) => update("className", value)} placeholder="Class name" />
        <TextField label="Course Name" value={values.courseName} onChangeText={(value) => update("courseName", value)} placeholder="Course name" />
        <TextField label="Course Code" value={values.courseCode} onChangeText={(value) => update("courseCode", value)} placeholder="Course code" />
      </>
    ),
    2: (
      <>
        <TextField label="Week of Reporting" value={values.weekOfReporting} onChangeText={(value) => update("weekOfReporting", value)} placeholder="Week 7" />
        <TextField label="Date of Lecture" value={values.dateOfLecture} onChangeText={(value) => update("dateOfLecture", value)} placeholder="YYYY-MM-DD" />
        <TextField label="Venue" value={values.venue} onChangeText={(value) => update("venue", value)} placeholder="Venue" />
        <TextField label="Scheduled Lecture Time" value={values.scheduledLectureTime} onChangeText={(value) => update("scheduledLectureTime", value)} placeholder="08:00 - 10:00" />
      </>
    ),
    3: (
      <>
        <TextField label="Actual Students Present" value={values.actualStudentsPresent} onChangeText={(value) => update("actualStudentsPresent", value)} placeholder="36" keyboardType="numeric" />
        <TextField label="Total Registered Students" value={values.totalRegisteredStudents} onChangeText={(value) => update("totalRegisteredStudents", value)} placeholder="42" keyboardType="numeric" />
      </>
    ),
    4: (
      <>
        <TextField label="Topic Taught" value={values.topicTaught} onChangeText={(value) => update("topicTaught", value)} placeholder="Topic taught" multiline />
        <TextField label="Learning Outcomes" value={values.learningOutcomes} onChangeText={(value) => update("learningOutcomes", value)} placeholder="Learning outcomes" multiline />
      </>
    ),
    5: (
      <TextField
        label="Lecturer Recommendations"
        value={values.lecturerRecommendations}
        onChangeText={(value) => update("lecturerRecommendations", value)}
        placeholder="Recommendations and notes"
        multiline
      />
    )
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <AppHeader title="Lecture Report" subtitle={`Step ${step} of 5`} />
      <Card>
        <AppText variant="caption">Course</AppText>
        <AppText variant="heading" style={{ marginTop: 8 }}>
          {course?.courseName || "Loading class..."}
        </AppText>
      </Card>
      <Card>{stepContent[step]}</Card>
      <View style={{ flexDirection: "row", gap: 12, marginBottom: 24 }}>
        <AppButton title="Back" variant="secondary" onPress={() => setStep((current) => Math.max(1, current - 1))} style={{ flex: 1 }} />
        {step < 5 ? (
          <AppButton title="Next" onPress={() => setStep((current) => Math.min(5, current + 1))} style={{ flex: 1 }} />
        ) : (
          <AppButton title="Submit" onPress={submit} style={{ flex: 1 }} />
        )}
      </View>
    </ScrollView>
  );
}

export function CourseFormScreen() {
  const router = useRouter();
  const [values, setValues] = useState({
    facultyName: "Faculty of Information Communication Technology",
    className: "BSCSMY3S2",
    courseName: "",
    courseCode: "",
    lecturerId: "lecturer-1",
    principalLecturerId: "prl-1",
    totalRegisteredStudents: "",
    venue: "",
    scheduledLectureTime: "",
    stream: "Software Engineering with Multimedia",
    day: ""
  });

  const update = (key, value) => setValues((current) => ({ ...current, [key]: value }));

  const handleSave = async () => {
    await saveCourse({
      ...values,
      totalRegisteredStudents: Number(values.totalRegisteredStudents)
    });
    Alert.alert("Course saved", "The course has been added to the management module.");
    router.replace("/classes");
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <AppHeader title="Course Management" subtitle="Add or assign course modules for the stream." />
      <Card>
        <TextField label="Faculty Name" value={values.facultyName} onChangeText={(value) => update("facultyName", value)} placeholder="Faculty" />
        <TextField label="Class Name" value={values.className} onChangeText={(value) => update("className", value)} placeholder="Class" />
        <TextField label="Course Name" value={values.courseName} onChangeText={(value) => update("courseName", value)} placeholder="Course name" />
        <TextField label="Course Code" value={values.courseCode} onChangeText={(value) => update("courseCode", value)} placeholder="Course code" />
        <TextField label="Lecturer ID" value={values.lecturerId} onChangeText={(value) => update("lecturerId", value)} placeholder="lecturer-1" />
        <TextField label="Principal Lecturer ID" value={values.principalLecturerId} onChangeText={(value) => update("principalLecturerId", value)} placeholder="prl-1" />
        <TextField label="Registered Students" value={values.totalRegisteredStudents} onChangeText={(value) => update("totalRegisteredStudents", value)} placeholder="42" keyboardType="numeric" />
        <TextField label="Venue" value={values.venue} onChangeText={(value) => update("venue", value)} placeholder="Lab 3" />
        <TextField label="Lecture Time" value={values.scheduledLectureTime} onChangeText={(value) => update("scheduledLectureTime", value)} placeholder="08:00 - 10:00" />
        <TextField label="Day" value={values.day} onChangeText={(value) => update("day", value)} placeholder="Tuesday" />
        <AppButton title="Save Course" onPress={handleSave} />
      </Card>
    </ScrollView>
  );
}

export function ClassDetailScreen() {
  const { user } = useAuth();
  const { courseId } = useLocalSearchParams();
  const [course, setCourse] = useState(null);

  useEffect(() => {
    getCoursesForRole(user).then((courses) => {
      setCourse(courses.find((item) => item.id === courseId) || null);
    });
  }, [courseId, user]);

  if (!course) {
    return (
      <ScrollView showsVerticalScrollIndicator={false}>
        <AppHeader title="Class Details" subtitle="Course information" />
        <EmptyState title="Course not found" description="The selected course could not be loaded." />
      </ScrollView>
    );
  }

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <AppHeader title={course.courseName} subtitle={course.courseCode} />
      <Card>
        <AppText variant="body">Class: {course.className}</AppText>
        <AppText variant="body" style={{ marginTop: 10 }}>
          Faculty: {course.facultyName}
        </AppText>
        <AppText variant="body" style={{ marginTop: 10 }}>
          Venue: {course.venue}
        </AppText>
        <AppText variant="body" style={{ marginTop: 10 }}>
          Time: {course.scheduledLectureTime}
        </AppText>
        <AppText variant="body" style={{ marginTop: 10 }}>
          Registered Students: {course.totalRegisteredStudents}
        </AppText>
      </Card>
    </ScrollView>
  );
}
