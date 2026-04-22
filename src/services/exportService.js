import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import { createCsvContent } from "../utils/helpers";

export async function exportReportsToCsv(reports) {
  const rows = reports.map((report) => ({
    faculty: report.facultyName,
    programme: report.programmeName,
    className: report.classDisplayName,
    courseName: report.courseName,
    lecturer: report.lecturerName,
    week: report.weekLabel,
    lectureDate: report.lectureDate,
    attendancePresent: report.attendancePresent,
    attendanceTotal: report.attendanceTotal,
    attendanceRate: report.attendanceRate,
    topic: report.topic,
    outcomes: report.outcomes,
    recommendations: report.recommendations,
    seniorLecturerFeedback: report.seniorLecturerFeedback || "",
    status: report.reviewStatus
  }));

  const content = createCsvContent(rows);
  const path = `${FileSystem.cacheDirectory}limko-monitoring-reports.csv`;

  await FileSystem.writeAsStringAsync(path, content, {
    encoding: FileSystem.EncodingType.UTF8
  });

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(path);
  }

  return path;
}
