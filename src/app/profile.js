import { useRouter } from "expo-router";
import { ScrollView } from "react-native";
import { AppButton } from "../components/AppButton";
import { AppHeader } from "../components/AppHeader";
import { AppText } from "../components/AppText";
import { Card } from "../components/Card";
import { ScreenWrapper } from "../components/ScreenWrapper";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { formatRole } from "../utils/helpers";

function ProfileScreen() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { mode, toggleTheme } = useTheme();

  const handleLogout = async () => {
    await signOut();
    router.replace("/login");
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <AppHeader title="Profile" subtitle="Theme, role details, and account actions." showBack />
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

      <AppButton title="Logout" onPress={handleLogout} />
    </ScrollView>
  );
}

export default function ProfileRoute() {
  return (
    <ScreenWrapper>
      <ProfileScreen />
    </ScreenWrapper>
  );
}
