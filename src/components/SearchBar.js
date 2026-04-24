import { Ionicons } from "@expo/vector-icons";
import { View, TextInput } from "react-native";
import { useTheme } from "../contexts/ThemeContext";

// Shared inline search input used by list screens.
export function SearchBar({ value, onChangeText, placeholder = "Search..." }) {
  const { theme } = useTheme();

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: theme.border,
        backgroundColor: theme.cardStrong,
        paddingHorizontal: 16,
        paddingVertical: 12,
        marginBottom: 16,
        shadowColor: theme.shadow,
        shadowOpacity: 1,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 8 },
        elevation: 4
      }}
    >
      <Ionicons name="search-outline" size={18} color={theme.mutedText} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.mutedText}
        style={{ flex: 1, color: theme.text }}
      />
    </View>
  );
}
