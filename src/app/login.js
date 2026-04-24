import { useRef, useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { AppButton } from "../components/AppButton";
import { AppText } from "../components/AppText";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { hasFirebaseConfig } from "../lib/firebase";

// Handles sign-in and keeps the login keyboard flow stable on mobile.
export default function LoginScreen() {
  const router = useRouter();
  const { signIn } = useAuth();
  const { theme } = useTheme();
  const passwordRef = useRef(null);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    email: "",
    password: ""
  });

  // Merge updates so typing in one field never clears the other one.
  const updateField = (key, value) => {
    setForm((current) => ({
      ...current,
      [key]: value
    }));
  };

  const handleLogin = async () => {
    try {
      await signIn(form.email, form.password);
      router.replace("/home");
    } catch (error) {
      Alert.alert("Login failed", error.message);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 24 : 0}
      >
        <ScrollView
          keyboardShouldPersistTaps="always"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 20, paddingTop: 48, paddingBottom: 32 }}
        >
          <View style={{ marginBottom: 20 }}>
            <AppText variant="title">LUCT Academic System</AppText>
            <AppText variant="caption" style={{ marginTop: 8 }}>
              Welcome back Creative, Please login to your account
            </AppText>
          </View>

          <View
            style={{
              borderRadius: 22,
              borderWidth: 1,
              borderColor: theme.border,
              backgroundColor: theme.card,
              padding: 16,
              marginBottom: 16
            }}
          >
            <AppText variant="subheading" style={{ marginBottom: 8 }}>
              Email
            </AppText>
            <View
              style={{
                borderRadius: 18,
                borderWidth: 1,
                borderColor: theme.border,
                backgroundColor: theme.cardStrong,
                minHeight: 52,
                paddingHorizontal: 16,
                justifyContent: "center",
                marginBottom: 14
              }}
            >
              <TextInput
                value={form.email}
                onChangeText={(value) => updateField("email", value)}
                placeholder="name@email.com"
                placeholderTextColor={theme.mutedText}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                textContentType="username"
                returnKeyType="next"
                blurOnSubmit={false}
                onSubmitEditing={() => passwordRef.current?.focus()}
                style={{ color: theme.text, minHeight: 52 }}
              />
            </View>

            <AppText variant="subheading" style={{ marginBottom: 8 }}>
              Password
            </AppText>
            <View
              style={{
                borderRadius: 18,
                borderWidth: 1,
                borderColor: theme.border,
                backgroundColor: theme.cardStrong,
                minHeight: 52,
                paddingHorizontal: 16,
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 14
              }}
            >
              <TextInput
                ref={passwordRef}
                value={form.password}
                onChangeText={(value) => updateField("password", value)}
                placeholder="Your password"
                placeholderTextColor={theme.mutedText}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                textContentType="password"
                returnKeyType="done"
                onSubmitEditing={handleLogin}
                style={{ flex: 1, color: theme.text, minHeight: 52 }}
              />
              <Pressable onPress={() => setShowPassword((current) => !current)} style={{ paddingLeft: 12, paddingVertical: 10 }}>
                <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color={theme.mutedText} />
              </Pressable>
            </View>
            <AppButton title="Login" onPress={handleLogin} />
            <AppText variant="caption" style={{ marginTop: 16 }}>
              {hasFirebaseConfig
                ? "example acounts: Student - student@limko.com, Lecturer - lecturer@limko.com, PRL - prl@limko.com, PL - khopotso.molati@limko.com, FMG - fmg@limko.com."
                : "Demo accounts: lecturer@limko.com, student@limko.com, prl@limko.com, pl@limko.com, fmg@limko.com"}
            </AppText>
          </View>

          <AppButton title="Register (Students only)" variant="secondary" onPress={() => router.push("/register")} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
