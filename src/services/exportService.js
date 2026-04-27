import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { Platform } from "react-native";
import { createCsvContent } from "../utils/helpers";

const CSV_FILE_NAME = "limko-monitoring-reports.csv";
const BOM = "\ufeff";

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

function buildCsv(reports) {
  const rows = createReportRows(reports);
  return BOM + createCsvContent(rows);
}

function triggerWebDownload(content, filename) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  link.style.display = "none";
  document.body.appendChild(link);

  // Try multiple strategies to trigger the download reliably
  if (typeof link.click === "function") {
    link.click();
  }
  link.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, view: window }));

  // Cleanup
  setTimeout(() => {
    if (link.parentNode) {
      document.body.removeChild(link);
    }
    URL.revokeObjectURL(url);
  }, 200);
}

// Saves a CSV file locally and triggers a browser download on web.
export async function exportReportsToCsv(reports) {
  if (!reports || !reports.length) {
    throw new Error("No reports available to export.");
  }

  const content = buildCsv(reports);

  // Web: trigger actual browser download
  if (Platform.OS === "web") {
    try {
      triggerWebDownload(content, CSV_FILE_NAME);
      return { filename: CSV_FILE_NAME, path: CSV_FILE_NAME, success: true };
    } catch (error) {
      throw new Error("Browser download failed. Please try the Share option instead.");
    }
  }

  // Native: write to file system and open share sheet so the user can save it
  try {
    const path = `${FileSystem.documentDirectory}${CSV_FILE_NAME}`;
    await FileSystem.writeAsStringAsync(path, content, {
      encoding: FileSystem.EncodingType.UTF8
    });

    const isAvailable = await Sharing.isAvailableAsync();
    if (isAvailable) {
      await Sharing.shareAsync(path, {
        mimeType: "text/csv",
        dialogTitle: "Save Reports CSV",
        UTI: "public.comma-separated-values-text"
      });
    }

    return { filename: CSV_FILE_NAME, path, success: true };
  } catch (error) {
    throw new Error(`Failed to save file: ${error?.message || "Unknown error"}`);
  }
}

// Opens the native share sheet for the generated CSV file when supported.
export async function shareReportsCsv(reports) {
  if (!reports || !reports.length) {
    throw new Error("No reports available to share.");
  }

  const content = buildCsv(reports);

  // Web: fallback to clipboard or direct download
  if (Platform.OS === "web") {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(content);
        return { filename: CSV_FILE_NAME, success: true, copiedToClipboard: true };
      }
    } catch {
      // Fallback below
    }
    triggerWebDownload(content, CSV_FILE_NAME);
    return { filename: CSV_FILE_NAME, success: true };
  }

  // Native: write to cache and share
  try {
    const path = `${FileSystem.cacheDirectory}${CSV_FILE_NAME}`;
    await FileSystem.writeAsStringAsync(path, content, {
      encoding: FileSystem.EncodingType.UTF8
    });

    const isAvailable = await Sharing.isAvailableAsync();
    if (isAvailable) {
      await Sharing.shareAsync(path, {
        mimeType: "text/csv",
        dialogTitle: "Share Reports CSV",
        UTI: "public.comma-separated-values-text"
      });
    } else {
      throw new Error("Sharing is not available on this device.");
    }

    return { filename: CSV_FILE_NAME, path, success: true };
  } catch (error) {
    throw new Error(`Failed to share file: ${error?.message || "Unknown error"}`);
  }
}

