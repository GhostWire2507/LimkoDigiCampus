import { useRouter } from "expo-router";
import { ScrollView, View } from "react-native";
import { AppButton } from "../components/AppButton";
import { AppHeader, GreetingHeader } from "../components/AppHeader";
import { AppText } from "../components/AppText";
import { Card } from "../components/Card";
import { EmptyState } from "../components/EmptyState";
import { RolePill } from "../components/RolePill";
import { ScreenWrapper } from "../components/ScreenWrapper";
import { StatCard } from "../components/StatCard";
import { useAuth } from "../contexts/AuthContext";
import {
  getAttendanceForRole,
  getClassesForRole,
  getFacultiesForRole,
  peekCachedData,
  getProgrammesForRole,
  getRatingsForRole,
  getReportsForRole
} from "../services/dataService";
import { average, formatRole } from "../utils/helpers";
import { useLoad } from "../shared/useLoad";

const quickActions = {
  student: [
    { title: "Open Classes", href: "/classes" },
    { title: "Open Attendance", href: "/attendance" },
    { title: "Submit Feedback", href: "/ratings" }
  ],
  lecturer: [
    { title: "Open Classes", href: "/classes" },
    { title: "Open Reports", href: "/reports" },
    { title: "Open Monitoring", href: "/monitoring" }
  ],
  prl: [
    { title: "Open Classes", href: "/classes" },
    { title: "Open Reports", href: "/reports" },
    { title: "Open Monitoring", href: "/monitoring" }
  ],
  pl: [
    { title: "Open Classes", href: "/classes" },
    { title: "Open Programmes", href: "/programmes" },
    { title: "Open Monitoring", href: "/monitoring" }
  ],
  fmg: [
    { title: "Open Faculties", href: "/faculties" },
    { title: "Open Reports", href: "/reports" },
    { title: "Open Monitoring", href: "/monitoring" }
  ]
};

function DashboardScreen() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [classes] = useLoad(() => getClassesForRole(user), user, peekCachedData("classes", user));
  const [reports] = useLoad(() => getReportsForRole(user), user, peekCachedData("reports", user));
  const [ratings] = useLoad(() => getRatingsForRole(user), user, peekCachedData("ratings", user));
  const [attendance] = useLoad(() => getAttendanceForRole(user), user, peekCachedData("attendance", user));
  const [programmes] = useLoad(() => getProgrammesForRole(user), user, peekCachedData("programmes", user));
  const [faculties] = useLoad(() => getFacultiesForRole(user), user, peekCachedData("faculties", user));

  const handleLogout = async () => {
    await signOut();
    router.replace("/login");
  };

  if (!user) {
    return (
      <ScrollView showsVerticalScrollIndicator={false}>
        <AppHeader title="Dashboard" subtitle="Sign in to load your workspace." />
        <EmptyState title="Profile unavailable" description="Your account data could not be loaded yet." />
      </ScrollView>
    );
  }

  const attendanceAverage = average(attendance.map((item) => item.attendanceRate));
  const averageRating = average(ratings.map((item) => item.rating));
  const nextClass = classes[0];
  const summaryCards =
    user.role === "student"
      ? [
          { label: "Classes Today", value: classes.length, helper: "Visible in your workspace" },
          { label: "Attendance Rate", value: `${attendanceAverage}%`, helper: "Average recorded presence" },
          { label: "Feedback Score", value: averageRating ? `${averageRating}/5` : "0", helper: "Your visible lecturer ratings" }
        ]
      : [
          { label: "Classes Today", value: classes.length, helper: "Visible in your workspace" },
          { label: "Pending Reports", value: reports.filter((report) => report.reviewStatus === "submitted").length, helper: "Awaiting review" },
          { label: "Attendance Rate", value: `${attendanceAverage}%`, helper: "Average recorded presence" },
          { label: "Feedback Score", value: averageRating ? `${averageRating}/5` : "0", helper: "Average student feedback" }
        ];

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <GreetingHeader user={user} />
      <AppButton title="Logout" variant="secondary" onPress={handleLogout} style={{ alignSelf: "flex-start", marginBottom: 12 }} />
      <RolePill label={`${formatRole(user.role)} Portal`} />

      <View style={{ gap: 12, marginTop: 16, marginBottom: 16 }}>
        <View style={{ flexDirection: "row", gap: 12 }}>
          {summaryCards.slice(0, 2).map((card) => (
            <StatCard key={card.label} label={card.label} value={card.value} helper={card.helper} />
          ))}
        </View>
        {summaryCards.length > 2 ? (
          <View style={{ flexDirection: "row", gap: 12 }}>
            {summaryCards.slice(2).map((card) => (
              <StatCard key={card.label} label={card.label} value={card.value} helper={card.helper} />
            ))}
          </View>
        ) : null}
      </View>

      {nextClass ? (
        <Card>
          <AppText variant="caption">Current focus</AppText>
          <AppText variant="heading" style={{ marginTop: 6 }}>
            {nextClass.displayName}
          </AppText>
          <AppText variant="body" style={{ marginTop: 8 }}>
            {nextClass.courseName}
          </AppText>
          <AppText variant="caption" style={{ marginTop: 6 }}>
            {nextClass.scheduleDay} • {nextClass.scheduleTime} • {nextClass.venue}
          </AppText>
        </Card>
      ) : (
        <EmptyState title="No classes assigned yet" description="Your dashboard will update once your academic scope is linked." />
      )}

      <Card>
        <AppText variant="heading">Quick actions</AppText>
        <View style={{ gap: 12, marginTop: 14 }}>
          {(quickActions[user.role] || quickActions.student).map((action) => (
            <AppButton key={action.title} title={action.title} onPress={() => router.push(action.href)} />
          ))}
        </View>
      </Card>

      <Card>
        <AppText variant="heading">Scope summary</AppText>
        <AppText variant="body" style={{ marginTop: 12 }}>
          Faculties: {faculties.length}
        </AppText>
        <AppText variant="body" style={{ marginTop: 6 }}>
          Programmes: {programmes.length}
        </AppText>
        <AppText variant="body" style={{ marginTop: 6 }}>
          Reports in scope: {reports.length}
        </AppText>
      </Card>
    </ScrollView>
  );
}

export default function HomeScreen() {
  return (
    <ScreenWrapper>
      <DashboardScreen />
    </ScreenWrapper>
  );
}
