import { Ionicons } from "@expo/vector-icons";
import { usePathname, useRouter } from "expo-router";
import { Pressable, View } from "react-native";
import { roleTabs } from "../navigation/roleTabs";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { AppText } from "./AppText";
import { Card } from "./Card";

// Renders the role-specific bottom navigation for signed-in users.
export function AppTabBar() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const router = useRouter();
  const pathname = usePathname();

  if (!user) {
    return null;
  }

  const tabs = roleTabs[user.role] || roleTabs.student;

  return (
    <Card style={{ marginBottom: 0 }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        {tabs.map((tab) => {
          // Highlight the tab that matches the current route.
          const active = pathname === tab.href;

          return (
            <Pressable
              key={tab.href}
              onPress={() => router.push(tab.href)}
              style={{
                flex: 1,
                alignItems: "center",
                gap: 6,
                paddingVertical: 6,
                borderRadius: 16,
                backgroundColor: active ? theme.cardStrong : "transparent"
              }}
            >
              <Ionicons name={active ? tab.icon.replace("-outline", "") : tab.icon} size={18} color={active ? theme.text : theme.mutedText} />
              <AppText variant="caption" style={{ color: active ? theme.text : theme.mutedText }}>
                {tab.label}
              </AppText>
            </Pressable>
          );
        })}
      </View>
    </Card>
  );
}
