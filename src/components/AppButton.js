import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { useTheme } from "../contexts/ThemeContext";

// Shared button component that keeps styling consistent across the app.
export function AppButton({ title, onPress, variant = "primary", style, disabled, loading }) {
  const { theme } = useTheme();

  const baseStyles = {
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8
  };

  const variants = {
    primary: {
      backgroundColor: theme.primary,
      borderWidth: 0,
      shadowColor: theme.shadow,
      shadowOpacity: 1,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 8 },
      elevation: 4
    },
    secondary: {
      backgroundColor: "transparent",
      borderWidth: 1,
      borderColor: theme.border
    },
    ghost: {
      backgroundColor: "transparent"
    }
  };

  const textColor = variant === "primary" ? theme.primaryText : theme.text;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        baseStyles,
        variants[variant],
        { opacity: disabled || loading ? 0.5 : pressed ? 0.9 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] },
        style
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={textColor} />
      ) : null}
      <Text style={{ color: textColor, fontSize: 15, fontWeight: variant === "ghost" ? "600" : "700" }}>{title}</Text>
    </Pressable>
  );
}
