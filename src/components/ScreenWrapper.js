import { Redirect, usePathname } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ActivityIndicator, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { AppTabBar } from "./AppTabBar";

// Adds the shared page background, auth redirects, and bottom tab bar.
export function ScreenWrapper({ children }) {
  const pathname = usePathname();
  const { user, loading } = useAuth();
  const { theme, mode } = useTheme();
  const gradientColors =
    mode === "dark"
      ? ["#121317", "#1a1c21", "#2c2d35"]
      : ["#f0f1f2", "#f8fafc", "#dadbdf"];
  const authRoutes = ["/login", "/register"];

  // Protected screens wait for auth before deciding whether to render or redirect.
  if (loading && !authRoutes.includes(pathname)) {
    return (
      <LinearGradient colors={gradientColors} style={{ flex: 1 }}>
        <SafeAreaView style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator size="large" color={theme.text} />
        </SafeAreaView>
      </LinearGradient>
    );
  }

  if (!loading && !user && !authRoutes.includes(pathname)) {
    return <Redirect href="/login" />;
  }

  if (!loading && user && authRoutes.includes(pathname)) {
    return <Redirect href="/home" />;
  }

  return (
    <LinearGradient colors={gradientColors} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={{ flex: 1, paddingHorizontal: 20, paddingTop: 12 }}>
          <View style={{ flex: 1 }}>{children}</View>
          {!authRoutes.includes(pathname) ? <AppTabBar /> : null}
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}
