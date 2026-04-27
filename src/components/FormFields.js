import { forwardRef, memo, useMemo, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, TextInput, View } from "react-native";
import { AppText } from "./AppText";
import { useTheme } from "../contexts/ThemeContext";

// Reusable text input with optional password reveal support.
const TextFieldComponent = forwardRef(function TextField(
  {
    label,
    value,
    onChangeText,
    placeholder,
    multiline,
    keyboardType = "default",
    secureTextEntry = false,
    autoCapitalize = "sentences",
    autoCorrect = true,
    textContentType,
    returnKeyType,
    onSubmitEditing,
    blurOnSubmit
  },
  ref
) {
  const { theme } = useTheme();
  const [revealed, setRevealed] = useState(false);
  const shouldHide = secureTextEntry && !revealed;

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
          minHeight: multiline ? 120 : 52,
          paddingHorizontal: 16,
          paddingVertical: multiline ? 14 : 0,
          flexDirection: "row",
          alignItems: multiline ? "flex-start" : "center"
        }}
      >
        <TextInput
          ref={ref}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={theme.mutedText}
          multiline={multiline}
          keyboardType={keyboardType}
          secureTextEntry={shouldHide}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
          textContentType={textContentType}
          returnKeyType={returnKeyType}
          onSubmitEditing={onSubmitEditing}
          blurOnSubmit={blurOnSubmit}
          style={{
            flex: 1,
            color: theme.text,
            minHeight: multiline ? 92 : 52,
            textAlignVertical: multiline ? "top" : "center",
            paddingVertical: multiline ? 0 : 14
          }}
        />
        {secureTextEntry ? (
          <Pressable
            onPress={() => setRevealed((current) => !current)}
            style={{ paddingLeft: 12, paddingVertical: 10, alignSelf: multiline ? "flex-start" : "center" }}
          >
            <Ionicons name={revealed ? "eye-off-outline" : "eye-outline"} size={20} color={theme.mutedText} />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
});

export const TextField = TextFieldComponent;

// Simple chip-style single-select field used for short option lists.
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

// Similar to SelectField, but allows more than one choice at a time.
export function MultiSelectField({ label, values = [], options, onChange, placeholder = "Select one or more options" }) {
  const { theme } = useTheme();
  const selectedValues = useMemo(() => new Set(values), [values]);

  const toggle = (value) => {
    if (selectedValues.has(value)) {
      onChange(values.filter((entry) => entry !== value));
      return;
    }

    onChange([...values, value]);
  };

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

        <View style={{ gap: 10 }}>
          {options.map((option) => {
            const active = selectedValues.has(option.value);

            return (
              <Pressable
                key={option.value}
                onPress={() => toggle(option.value)}
                style={{
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
