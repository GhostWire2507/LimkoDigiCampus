import { BlurView } from "expo-blur";
import { View } from "react-native";
import { useTheme } from "../contexts/ThemeContext";

// Reusable glass-style container used for most dashboard sections and forms.
export function Card({ children, style }) {
  const { theme, mode } = useTheme();

  return (
    <BlurView
      intensity={mode === "dark" ? 20 : 32}
      tint={mode === "dark" ? "dark" : "light"}
      style={[
        {
          borderRadius: 22,
          overflow: "hidden",
          borderWidth: 1,
          borderColor: theme.border,
          marginBottom: 16,
          shadowColor: theme.shadow,
          shadowOpacity: 1,
          shadowRadius: 16,
          shadowOffset: { width: 0, height: 10 },
          elevation: 6
        },
        style
      ]}
    >
      <View
        style={{
          backgroundColor: theme.card,
          padding: 16
        }}
      >
        {children}
      </View>
    </BlurView>
  );
}
