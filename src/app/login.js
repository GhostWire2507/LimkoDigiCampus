import { useState } from "react";
import { Alert, ScrollView, View } from "react-native";
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
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      await signIn(email, password);
      router.replace("/home");
    } catch (error) {
      Alert.alert("Login failed", error.message);
    }
  };

  return (
    <ScreenWrapper>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}>
        <View style={{ marginBottom: 20 }}>
          <AppText variant="title">LUCT Academic System</AppText>
          <AppText variant="caption" style={{ marginTop: 8 }}>
            Lecture reporting, attendance tracking, and programme oversight in one academic workspace.
          </AppText>
        </View>

        <Card>
          <TextField label="Email" value={email} onChangeText={setEmail} placeholder="name@email.com" />
          <TextField label="Password" value={password} onChangeText={setPassword} placeholder="Your password" />
          <AppButton title="Login" onPress={handleLogin} />
          <AppText variant="caption" style={{ marginTop: 16 }}>
            {hasFirebaseConfig
              ? "Use a Firebase-authenticated account for this project."
              : "Demo accounts: lecturer@limko.com, student@limko.com, prl@limko.com, pl@limko.com, fmg@limko.com"}
          </AppText>
        </Card>

        <Link href="/register" asChild>
          <AppButton title="Register (Students only)" variant="secondary" />
        </Link>
      </ScrollView>
    </ScreenWrapper>
  );
}
