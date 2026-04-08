import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import { createCsvContent } from "../utils/helpers";

export async function exportReportsToCsv(reports) {
  const rows = reports.map((report) => ({
    facultyName: report.facultyName,
    className: report.className,
    weekOfReporting: report.weekOfReporting,
    dateOfLecture: report.dateOfLecture,
    courseName: report.courseName,
    courseCode: report.courseCode,
    lecturerName: report.lecturerName,
    actualStudentsPresent: report.actualStudentsPresent,
    totalRegisteredStudents: report.totalRegisteredStudents,
    venue: report.venue,
    scheduledLectureTime: report.scheduledLectureTime,
    topicTaught: report.topicTaught,
    learningOutcomes: report.learningOutcomes,
    lecturerRecommendations: report.lecturerRecommendations,
    prlFeedback: report.prlFeedback || "",
    reviewStatus: report.reviewStatus
  }));

  const content = createCsvContent(rows);
  const path = `${FileSystem.cacheDirectory}limko-reports.csv`;

  await FileSystem.writeAsStringAsync(path, content, {
    encoding: FileSystem.EncodingType.UTF8
  });

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(path);
  }

  return path;
}
