import { View } from "react-native";
import { AppText } from "./AppText";
import { useTheme } from "../contexts/ThemeContext";

// Small badge used to show the current portal or role context.
export function RolePill({ label }) {
  const { theme } = useTheme();

  return (
    <View
      style={{
        alignSelf: "flex-start",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 999,
        backgroundColor: theme.cardStrong,
        borderWidth: 1,
        borderColor: theme.border
      }}
    >
      <AppText variant="caption">{label}</AppText>
    </View>
  );
}
