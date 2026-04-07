import { BlurView } from "expo-blur";
import { View } from "react-native";
import { useTheme } from "../contexts/ThemeContext";

export function Card({ children, style }) {
  const { theme, mode } = useTheme();

  return (
    <BlurView
      intensity={mode === "dark" ? 18 : 30}
      tint={mode === "dark" ? "dark" : "light"}
      style={[
        {
          borderRadius: 24,
          overflow: "hidden",
          borderWidth: 1,
          borderColor: theme.border,
          marginBottom: 16
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
