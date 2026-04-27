import { useMemo } from "react";
import { useLocalSearchParams } from "expo-router";
import { ScrollView } from "react-native";
import { AppHeader } from "../components/AppHeader";
import { AppText } from "../components/AppText";
import { Card } from "../components/Card";
import { EmptyState } from "../components/EmptyState";
import { ScreenWrapper } from "../components/ScreenWrapper";
import { useAuth } from "../contexts/AuthContext";
import { getClassesForRole, getReportsForRole } from "../services/dataService";
import { titleCaseStatus } from "../shared/helpers";
import { useLoad } from "../shared/useLoad";

// Shows one class plus the most recent report tied to it.
function ClassDetailScreen() {
  const { user } = useAuth();
  const { classId } = useLocalSearchParams();

  if (!user) {
    return null;
  }

  const [classes] = useLoad(() => getClassesForRole(user), user);
  const [reports] = useLoad(() => getReportsForRole(user), user);
  const classItem = useMemo(() => classes.find((item) => item.id === classId) || null, [classes, classId]);
  const latestReport = useMemo(() => reports.find((report) => report.classId === classId) || null, [reports, classId]);

  if (!classItem) {
    return (
      <ScrollView showsVerticalScrollIndicator={false}>
        <AppHeader title="Class Details" subtitle="Academic class information" showBack backHref="/classes" />
        <EmptyState title="Class not found" description="The selected class could not be loaded." />
      </ScrollView>
    );
  }

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <AppHeader title={classItem.displayName} subtitle={classItem.courseName} showBack backHref="/classes" />
      <Card>
        <AppText variant="body">Faculty: {classItem.facultyName}</AppText>
        <AppText variant="body" style={{ marginTop: 10 }}>
          Programme: {classItem.programmeName}
        </AppText>
        <AppText variant="body" style={{ marginTop: 10 }}>
          Lecturer: {classItem.lecturerName}
        </AppText>
        <AppText variant="body" style={{ marginTop: 10 }}>
          Senior Lecturer: {classItem.seniorLecturerName}
        </AppText>
        <AppText variant="body" style={{ marginTop: 10 }}>
          Venue: {classItem.venue}
        </AppText>
        <AppText variant="body" style={{ marginTop: 10 }}>
          Time: {classItem.scheduleDay} • {classItem.scheduleTime}
        </AppText>
        <AppText variant="body" style={{ marginTop: 10 }}>
          Registered Students: {classItem.studentCount}
        </AppText>
      </Card>

      {latestReport ? (
        <Card>
          <AppText variant="heading">Latest report</AppText>
          <AppText variant="body" style={{ marginTop: 10 }}>
            {latestReport.weekLabel} • {latestReport.lectureDate}
          </AppText>
          <AppText variant="body" style={{ marginTop: 8 }}>
            Topic: {latestReport.topic}
          </AppText>
          <AppText variant="caption" style={{ marginTop: 8 }}>
            Status: {titleCaseStatus(latestReport.reviewStatus)}
          </AppText>
        </Card>
      ) : null}
    </ScrollView>
  );
}

export default function ClassDetailRoute() {
  return (
    <ScreenWrapper>
      <ClassDetailScreen />
    </ScreenWrapper>
  );
}
