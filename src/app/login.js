import { useRef, useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";
import { Link, useRouter } from "expo-router";
import { AppButton } from "../components/AppButton";
import { AppText } from "../components/AppText";
import { Card } from "../components/Card";
import { TextField } from "../components/FormFields";
import { ScreenWrapper } from "../components/ScreenWrapper";
import { useAuth } from "../contexts/AuthContext";
import { hasFirebaseConfig } from "../lib/firebase";

export default function LoginScreen() {
  const router = useRouter();
  const { signIn } = useAuth();
  const passwordRef = useRef(null);
  const [activeField, setActiveField] = useState(null);
  const [form, setForm] = useState({
    email: "",
    password: ""
  });

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
    <ScreenWrapper>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 24 : 0}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
        >
          <View style={{ marginBottom: 20 }}>
            <AppText variant="title">LUCT Academic System</AppText>
            <AppText variant="caption" style={{ marginTop: 8 }}>
              Welcome back Creative, Please login to your account
            </AppText>
          </View>

          <Card>
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
              isFocused={activeField === "email"}
              onFocus={() => setActiveField("email")}
              onBlur={() => setActiveField((current) => (current === "email" ? null : current))}
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
              isFocused={activeField === "password"}
              onFocus={() => setActiveField("password")}
              onBlur={() => setActiveField((current) => (current === "password" ? null : current))}
            />
            <AppButton title="Login" onPress={handleLogin} />
            <AppText variant="caption" style={{ marginTop: 16 }}>
              {hasFirebaseConfig
                ? "example acounts: Student - student@limko.com, Lecturer - lecturer@limko.com, PRL - prl@limko.com, PL - khopotso.molati@limko.com, FMG - fmg@limko.com."
                : "Demo accounts: lecturer@limko.com, student@limko.com, prl@limko.com, pl@limko.com, fmg@limko.com"}
            </AppText>
          </Card>

          <Link href="/register" asChild>
            <AppButton title="Register (Students only)" variant="secondary" />
          </Link>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
}
