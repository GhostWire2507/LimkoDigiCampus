import { BlurView } from "expo-blur";
import { Platform, View } from "react-native";
import { useTheme } from "../contexts/ThemeContext";

// Reusable glass-style container used for most dashboard sections and forms.
export function Card({ children, style, disableBlur = false }) {
  const { theme, mode } = useTheme();
  const shouldUsePlainView = disableBlur || Platform.OS === "android";
  const containerStyles = [
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
      elevation: 6,
      backgroundColor: shouldUsePlainView ? theme.card : undefined
    },
    style
  ];
  const content = (
    <View
      style={{
        backgroundColor: shouldUsePlainView ? "transparent" : theme.card,
        padding: 16
      }}
    >
      {children}
    </View>
  );

  if (shouldUsePlainView) {
    return <View style={containerStyles}>{content}</View>;
  }

  return (
    <BlurView
      intensity={mode === "dark" ? 20 : 32}
      tint={mode === "dark" ? "dark" : "light"}
      style={containerStyles}
    >
      {content}
    </BlurView>
  );
}
