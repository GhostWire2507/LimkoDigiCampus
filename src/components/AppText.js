import { Text } from "react-native";
import { useTheme } from "../contexts/ThemeContext";

// Shared text component so typography and colors stay consistent everywhere.
export function AppText({ children, variant = "body", style, numberOfLines }) {
  const { theme } = useTheme();
  const fontFamily = "Inclusive Sans";

  const variants = {
    title: { fontSize: 28, fontWeight: "700", color: theme.text, fontFamily },
    heading: { fontSize: 20, fontWeight: "700", color: theme.text, fontFamily },
    subheading: { fontSize: 16, fontWeight: "600", color: theme.text, fontFamily },
    body: { fontSize: 14, fontWeight: "400", color: theme.text, fontFamily },
    caption: { fontSize: 12, fontWeight: "400", color: theme.mutedText, fontFamily }
  };

  return (
    <Text numberOfLines={numberOfLines} style={[variants[variant], style]}>
      {children}
    </Text>
  );
}
