import { useState } from "react";
import { Alert, ScrollView, View } from "react-native";
import { Link, useRouter } from "expo-router";
import { AppButton } from "../src/components/AppButton";
import { AppText } from "../src/components/AppText";
import { Card } from "../src/components/Card";
import { TextField } from "../src/components/FormFields";
import { ScreenWrapper } from "../src/components/ScreenWrapper";
import { useAuth } from "../src/contexts/AuthContext";
import { hasFirebaseConfig } from "../src/lib/firebase";

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
          <AppText variant="title">LimkoDigiCampus</AppText>
          <AppText variant="caption" style={{ marginTop: 8 }}>
            Faculty reporting and monitoring platform for LUCT.
          </AppText>
        </View>

        <Card>
          <TextField label="Email" value={email} onChangeText={setEmail} placeholder="name@email.com" />
          <TextField label="Password" value={password} onChangeText={setPassword} placeholder="Your password" />
          <AppButton title="Login" onPress={handleLogin} />
          <AppText variant="caption" style={{ marginTop: 16 }}>
            {hasFirebaseConfig
              ? "Use an email and password that already exist in Firebase Auth for this project, or create one first."
              : "Demo accounts: lecturer@limko.com, student@limko.com, prl@limko.com, pl@limko.com"}
          </AppText>
        </Card>

        <Link href="/register" asChild>
          <AppButton title="Create Account" variant="secondary" />
        </Link>
      </ScrollView>
    </ScreenWrapper>
  );
}
