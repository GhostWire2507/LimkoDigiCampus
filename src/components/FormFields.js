import { useState } from "react";
import { TextInput, View } from "react-native";
import { AppText } from "./AppText";
import { useTheme } from "../contexts/ThemeContext";

export function TextField({ label, value, onChangeText, placeholder, multiline, keyboardType = "default" }) {
  const { theme } = useTheme();
  const [focused, setFocused] = useState(false);

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
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          borderRadius: 18,
          borderWidth: 1,
          borderColor: focused ? theme.mutedText : theme.border,
          backgroundColor: theme.cardStrong,
          color: theme.text,
          minHeight: multiline ? 120 : 52,
          textAlignVertical: multiline ? "top" : "center",
          paddingHorizontal: 16,
          paddingVertical: 14,
          shadowColor: focused ? theme.glow : "transparent",
          shadowOpacity: focused ? 1 : 0,
          shadowRadius: focused ? 10 : 0,
          shadowOffset: { width: 0, height: 6 },
          elevation: focused ? 3 : 0
        }}
      />
    </View>
  );
}
