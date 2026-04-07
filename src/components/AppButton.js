import { Pressable, Text } from "react-native";
import { useTheme } from "../contexts/ThemeContext";

export function AppButton({ title, onPress, variant = "primary", style, disabled }) {
  const { theme } = useTheme();

  const baseStyles = {
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center"
  };

  const variants = {
    primary: {
      backgroundColor: theme.primary,
      borderWidth: 0
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
      disabled={disabled}
      style={({ pressed }) => [
        baseStyles,
        variants[variant],
        { opacity: disabled ? 0.5 : pressed ? 0.88 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] },
        style
      ]}
    >
      <Text style={{ color: textColor, fontSize: 15, fontWeight: "700" }}>{title}</Text>
    </Pressable>
  );
}
