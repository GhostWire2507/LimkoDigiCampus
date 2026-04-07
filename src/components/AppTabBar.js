import { Ionicons } from "@expo/vector-icons";
import { usePathname, useRouter } from "expo-router";
import { Pressable, View } from "react-native";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { AppText } from "./AppText";
import { Card } from "./Card";

const roleTabs = {
  student: [
    { label: "Home", href: "/home", icon: "home-outline" },
    { label: "Classes", href: "/classes", icon: "book-outline" },
    { label: "Attendance", href: "/attendance", icon: "checkbox-outline" },
    { label: "Profile", href: "/profile", icon: "person-outline" }
  ],
  lecturer: [
    { label: "Home", href: "/home", icon: "home-outline" },
    { label: "Classes", href: "/classes", icon: "layers-outline" },
    { label: "Reports", href: "/reports", icon: "document-text-outline" },
    { label: "Profile", href: "/profile", icon: "person-outline" }
  ],
  prl: [
    { label: "Home", href: "/home", icon: "home-outline" },
    { label: "Courses", href: "/classes", icon: "library-outline" },
    { label: "Reports", href: "/reports", icon: "reader-outline" },
    { label: "Profile", href: "/profile", icon: "person-outline" }
  ],
  pl: [
    { label: "Home", href: "/home", icon: "home-outline" },
    { label: "Courses", href: "/classes", icon: "school-outline" },
    { label: "Reports", href: "/reports", icon: "analytics-outline" },
    { label: "Profile", href: "/profile", icon: "person-outline" }
  ]
};

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
