import { useState } from "react";
import { Pressable, TextInput, View } from "react-native";
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

export function SelectField({ label, value, options, onChange, placeholder = "Select an option" }) {
  const { theme } = useTheme();

  return (
    <View style={{ marginBottom: 14 }}>
      <AppText variant="subheading" style={{ marginBottom: 8 }}>
        {label}
      </AppText>

      <View
        style={{
          borderRadius: 18,
          borderWidth: 1,
          borderColor: theme.border,
          backgroundColor: theme.cardStrong,
          padding: 10,
          gap: 10,
          shadowColor: theme.shadow,
          shadowOpacity: 0.12,
          shadowRadius: 10,
          shadowOffset: { width: 0, height: 6 },
          elevation: 2
        }}
      >
        <AppText variant="caption" style={{ paddingHorizontal: 6 }}>
          {placeholder}
        </AppText>

        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
          {options.map((option) => {
            const active = value === option.value;

            return (
              <Pressable
                key={option.value}
                onPress={() => onChange(option.value)}
                style={{
                  minWidth: "47%",
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: active ? theme.primary : theme.border,
                  backgroundColor: active ? theme.primary : "transparent",
                  paddingHorizontal: 14,
                  paddingVertical: 12
                }}
              >
                <AppText
                  variant="body"
                  style={{
                    color: active ? theme.primaryText : theme.text,
                    fontWeight: active ? "700" : "600"
                  }}
                >
                  {option.label}
                </AppText>
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}
