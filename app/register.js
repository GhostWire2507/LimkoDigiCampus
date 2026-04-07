import { useState } from "react";
import { Alert, ScrollView, View } from "react-native";
import { useRouter } from "expo-router";
import { AppButton } from "../src/components/AppButton";
import { AppText } from "../src/components/AppText";
import { Card } from "../src/components/Card";
import { TextField } from "../src/components/FormFields";
import { ScreenWrapper } from "../src/components/ScreenWrapper";
import { roles } from "../src/constants/roles";
import { useAuth } from "../src/contexts/AuthContext";

export default function RegisterScreen() {
  const router = useRouter();
  const { signUp } = useAuth();
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    role: "student"
  });

  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const handleRegister = async () => {
    try {
      await signUp(form);
      router.replace("/home");
    } catch (error) {
      Alert.alert("Registration failed", error.message);
    }
  };

  return (
    <ScreenWrapper>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={{ marginBottom: 20 }}>
          <AppText variant="title">Create Account</AppText>
          <AppText variant="caption" style={{ marginTop: 8 }}>
            Register a role-based profile for the assignment workflow.
          </AppText>
        </View>

        <Card>
          <TextField label="Full Name" value={form.fullName} onChangeText={(value) => update("fullName", value)} placeholder="Your name" />
          <TextField label="Email" value={form.email} onChangeText={(value) => update("email", value)} placeholder="name@email.com" />
          <TextField label="Password" value={form.password} onChangeText={(value) => update("password", value)} placeholder="Password" />
          <TextField label="Role" value={form.role} onChangeText={(value) => update("role", value)} placeholder={roles.map((role) => role.value).join(", ")} />
          <AppButton title="Register" onPress={handleRegister} />
        </Card>
      </ScrollView>
    </ScreenWrapper>
  );
}
