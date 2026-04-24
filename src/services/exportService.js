import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import { Platform } from "react-native";
import { createCsvContent } from "../utils/helpers";

const CSV_FILE_NAME = "limko-monitoring-reports.csv";

// Converts the current report list into plain CSV row data.
function createReportRows(reports) {
  return reports.map((report) => ({
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
}

// Saves a CSV file locally and triggers a browser download on web.
export async function exportReportsToCsv(reports) {
  const rows = createReportRows(reports);
  const content = createCsvContent(rows);

  if (Platform.OS === "web" && typeof document !== "undefined") {
    const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", CSV_FILE_NAME);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    return { filename: CSV_FILE_NAME, path: CSV_FILE_NAME };
  }

  const path = `${FileSystem.documentDirectory}${CSV_FILE_NAME}`;

  await FileSystem.writeAsStringAsync(path, content, {
    encoding: FileSystem.EncodingType.UTF8
  });

  return { filename: CSV_FILE_NAME, path };
}

// Opens the native share sheet for the generated CSV file when supported.
export async function shareReportsCsv(reports) {
  const rows = createReportRows(reports);
  const content = createCsvContent(rows);
  const path = `${FileSystem.cacheDirectory}${CSV_FILE_NAME}`;

  await FileSystem.writeAsStringAsync(path, content, {
    encoding: FileSystem.EncodingType.UTF8
  });

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(path);
  }

  return { filename: CSV_FILE_NAME, path };
}
