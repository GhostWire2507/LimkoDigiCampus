import { useRef, useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, View } from "react-native";
import { Link, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppButton } from "../components/AppButton";
import { AppText } from "../components/AppText";
import { TextField } from "../components/FormFields";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { hasFirebaseConfig } from "../lib/firebase";

// Handles sign-in and keeps the login keyboard flow stable on mobile.
export default function LoginScreen() {
  const router = useRouter();
  const { signIn } = useAuth();
  const { theme } = useTheme();
  const passwordRef = useRef(null);
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
        <View style={{ flex: 1, justifyContent: "center", paddingHorizontal: 20, paddingTop: 12 }}>
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
            <TextField
              label="Email"
              value={form.email}
              onChangeText={(value) => updateField("email", value)}
              placeholder="name@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              textContentType="username"
              returnKeyType="next"
              blurOnSubmit={false}
              onSubmitEditing={() => passwordRef.current?.focus()}
            />
            <TextField
              ref={passwordRef}
              label="Password"
              value={form.password}
              onChangeText={(value) => updateField("password", value)}
              placeholder="Your password"
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              textContentType="password"
              returnKeyType="done"
              onSubmitEditing={handleLogin}
            />
            <AppButton title="Login" onPress={handleLogin} />
            <AppText variant="caption" style={{ marginTop: 16 }}>
              {hasFirebaseConfig
                ? "example acounts: Student - student@limko.com, Lecturer - lecturer@limko.com, PRL - prl@limko.com, PL - khopotso.molati@limko.com, FMG - fmg@limko.com."
                : "Demo accounts: lecturer@limko.com, student@limko.com, prl@limko.com, pl@limko.com, fmg@limko.com"}
            </AppText>
          </View>

          <Link href="/register" asChild>
            <AppButton title="Register (Students only)" variant="secondary" />
          </Link>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
