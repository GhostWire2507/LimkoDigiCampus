import { TextInput, View } from "react-native";
import { AppText } from "./AppText";
import { useTheme } from "../contexts/ThemeContext";

export function TextField({ label, value, onChangeText, placeholder, multiline, keyboardType = "default" }) {
  const { theme } = useTheme();

  return (
    <View style={{ marginBottom: 14 }}>
      <AppText variant="subheading" style={{ marginBottom: 8 }}>
        {label}
      </AppText>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.mutedText}
        multiline={multiline}
        keyboardType={keyboardType}
        style={{
          borderRadius: 18,
          borderWidth: 1,
          borderColor: theme.border,
          backgroundColor: theme.cardStrong,
          color: theme.text,
          minHeight: multiline ? 120 : 52,
          textAlignVertical: multiline ? "top" : "center",
          paddingHorizontal: 16,
          paddingVertical: 14
        }}
      />
    </View>
  );
}
