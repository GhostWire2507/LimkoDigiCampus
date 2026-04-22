import { ScrollView, View } from "react-native";
import { AppHeader } from "../components/AppHeader";
import { AppText } from "../components/AppText";
import { Card } from "../components/Card";
import { EmptyState } from "../components/EmptyState";
import { ScreenWrapper } from "../components/ScreenWrapper";
import { StatCard } from "../components/StatCard";
import { useAuth } from "../contexts/AuthContext";
import { getMonitoringForRole } from "../services/dataService";
import { average } from "../utils/helpers";
import { LeadershipGate } from "../shared/LeadershipGate";
import { titleCaseStatus } from "../shared/helpers";
import { useLoad } from "../shared/useLoad";

function MonitoringScreen() {
  const { user } = useAuth();
  const [monitoring] = useLoad(() => getMonitoringForRole(user), user);
  const overallAttendance = average(monitoring.map((item) => item.attendanceAverage));
  const overallRating = average(monitoring.map((item) => item.averageRating));
  const reportCompletion = monitoring.filter((item) => item.reportsSubmitted > 0).length;

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <AppHeader title="Monitoring" subtitle="Attendance, reporting, and feedback combined into one performance view." showBack />
      <LeadershipGate user={user}>
        <>
          <View style={{ flexDirection: "row", gap: 12, marginBottom: 16 }}>
            <StatCard label="Attendance %" value={`${overallAttendance}%`} helper="Average across visible classes" />
            <StatCard label="Average Rating" value={overallRating ? `${overallRating}/5` : "0"} helper="Average student rating" />
          </View>
          <StatCard label="Report Completion" value={`${reportCompletion}/${monitoring.length}`} helper="Classes with at least one report" />

          {monitoring.length ? (
            monitoring.map((item) => (
              <Card key={item.id}>
                <AppText variant="heading">{item.displayName}</AppText>
                <AppText variant="body" style={{ marginTop: 8 }}>
                  {item.courseName}
                </AppText>
                <AppText variant="caption" style={{ marginTop: 8 }}>
                  {item.programmeName} • {item.lecturerName}
                </AppText>
                <AppText variant="body" style={{ marginTop: 10 }}>
                  Attendance average: {item.attendanceAverage}%
                </AppText>
                <AppText variant="body" style={{ marginTop: 6 }}>
                  Reports submitted: {item.reportsSubmitted}
                </AppText>
                <AppText variant="body" style={{ marginTop: 6 }}>
                  Feedback average: {item.averageRating || 0}/5
                </AppText>
                <AppText variant="caption" style={{ marginTop: 8 }}>
                  Latest report status: {titleCaseStatus(item.latestReportStatus)}
                </AppText>
              </Card>
            ))
          ) : (
            <EmptyState title="No monitoring data yet" description="Data will appear here after classes start reporting." />
          )}
        </>
      </LeadershipGate>
    </ScrollView>
  );
}

export default function MonitoringRoute() {
  return (
    <ScreenWrapper>
      <MonitoringScreen />
    </ScreenWrapper>
  );
}
