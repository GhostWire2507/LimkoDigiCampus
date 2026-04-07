import { Text } from "react-native";
import { useTheme } from "../contexts/ThemeContext";

export function AppText({ children, variant = "body", style, numberOfLines }) {
  const { theme } = useTheme();

  const variants = {
    title: { fontSize: 28, fontWeight: "700", color: theme.text },
    heading: { fontSize: 20, fontWeight: "700", color: theme.text },
    subheading: { fontSize: 16, fontWeight: "600", color: theme.text },
    body: { fontSize: 14, fontWeight: "400", color: theme.text },
    caption: { fontSize: 12, fontWeight: "400", color: theme.mutedText }
  };

  return (
    <Text numberOfLines={numberOfLines} style={[variants[variant], style]}>
      {children}
    </Text>
  );
}
