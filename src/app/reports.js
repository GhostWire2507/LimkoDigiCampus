import { useState } from "react";
import { Alert, ScrollView, View } from "react-native";
import { AppButton } from "../components/AppButton";
import { AppHeader } from "../components/AppHeader";
import { AppText } from "../components/AppText";
import { Card } from "../components/Card";
import { EmptyState } from "../components/EmptyState";
import { TextField } from "../components/FormFields";
import { ScreenWrapper } from "../components/ScreenWrapper";
import { SearchBar } from "../components/SearchBar";
import { useAuth } from "../contexts/AuthContext";
import { exportReportsToCsv, shareReportsCsv } from "../services/exportService";
import { deleteReport, getReportsForRole, updateReportFeedback } from "../services/dataService";
import { filterByQuery } from "../utils/helpers";
import { titleCaseStatus } from "../shared/helpers";
import { useLoad } from "../shared/useLoad";

// Lets PRLs review reports while other roles browse and manage visible submissions.
function SeniorLecturerFeedbackForm({ report, onSaved }) {
  const { user } = useAuth();
  const [feedback, setFeedback] = useState(report.seniorLecturerFeedback || "");

  const handleSave = async () => {
    const nextReports = await updateReportFeedback(report.id, feedback, "reviewed", user);
    onSaved(nextReports);
    Alert.alert("Feedback saved", "The lecture report has been reviewed.");
  };

  return (
    <View style={{ marginTop: 16 }}>
      <TextField label="Senior Lecturer Feedback" value={feedback} onChangeText={setFeedback} placeholder="Add guidance for the lecturer" multiline />
      <AppButton title="Save Feedback" onPress={handleSave} />
    </View>
  );
}

// Shows report history, exports, and leadership review actions in one place.
function ReportsScreen() {
  const { user } = useAuth();
  const [reports, setReports] = useLoad(() => getReportsForRole(user), user);
  const [query, setQuery] = useState("");
  const filteredReports = filterByQuery(reports, query, [
    "classDisplayName",
    "courseName",
    "lecturerName",
    "weekLabel",
    "reviewStatus"
  ]);

  const handleDownload = async () => {
    const result = await exportReportsToCsv(filteredReports);
    Alert.alert("CSV saved", `The report file was downloaded or saved as ${result.filename}.`);
  };

  const handleShare = async () => {
    await shareReportsCsv(filteredReports);
    Alert.alert("Share ready", "The report file was generated and opened in the share sheet.");
  };

  const canDeleteReport = (report) =>
    user.role === "fmg" || user.role === "pl" || user.role === "prl" || report.lecturerId === user.id;

  const handleDeleteReport = (report) => {
    Alert.alert("Delete report", "This will permanently remove the report entry. Continue?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          const nextReports = await deleteReport(report.id, user);
          setReports(nextReports);
          Alert.alert("Report deleted", "The report has been removed.");
        }
      }
    ]);
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <AppHeader title="Lecture Reports" subtitle="Track reporting flow from lecturer submission to leadership review." showBack />
      <SearchBar value={query} onChangeText={setQuery} placeholder="Search by class, course, lecturer, week, or status" />
      <View style={{ flexDirection: "row", gap: 10, marginBottom: 16 }}>
        <AppButton title="Download CSV" variant="secondary" onPress={handleDownload} style={{ flex: 1 }} />
        <AppButton title="Share CSV" variant="secondary" onPress={handleShare} style={{ flex: 1 }} />
      </View>

      {filteredReports.length ? (
        filteredReports.map((report) => (
          <Card key={report.id}>
            <AppText variant="heading">{report.classDisplayName}</AppText>
            <AppText variant="body" style={{ marginTop: 8 }}>
              {report.courseName}
            </AppText>
            <AppText variant="caption" style={{ marginTop: 8 }}>
              {report.weekLabel} • {report.lectureDate} • {report.lecturerName}
            </AppText>
            <AppText variant="body" style={{ marginTop: 10 }}>
              Attendance: {report.attendancePresent}/{report.attendanceTotal} ({report.attendanceRate}%)
            </AppText>
            <AppText variant="body" style={{ marginTop: 8 }}>
              Topic: {report.topic}
            </AppText>
            <AppText variant="caption" style={{ marginTop: 8 }}>
              Status: {titleCaseStatus(report.reviewStatus)}
            </AppText>

            {user.role === "prl" ? <SeniorLecturerFeedbackForm report={report} onSaved={setReports} /> : null}

            {canDeleteReport(report) ? (
              <AppButton
                title="Delete Report"
                variant="secondary"
                onPress={() => handleDeleteReport(report)}
                style={{ marginTop: 12 }}
              />
            ) : null}

            {report.seniorLecturerFeedback ? (
              <View style={{ marginTop: 12 }}>
                <AppText variant="subheading">Senior Lecturer feedback</AppText>
                <AppText variant="caption" style={{ marginTop: 6 }}>
                  {report.seniorLecturerFeedback}
                </AppText>
              </View>
            ) : null}
          </Card>
        ))
      ) : (
        <EmptyState title="No reports found" description="Lecture reports will appear here as lecturers submit them." />
      )}
    </ScrollView>
  );
}

export default function ReportsRoute() {
  return (
    <ScreenWrapper>
      <ReportsScreen />
    </ScreenWrapper>
  );
}
