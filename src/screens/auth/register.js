import { useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";
import { useRouter } from "expo-router";
import { AppButton } from "../../components/AppButton";
import { AppText } from "../../components/AppText";
import { Card } from "../../components/Card";
import { SelectField, TextField } from "../../components/FormFields";
import { ScreenWrapper } from "../../components/ScreenWrapper";
import { roles } from "../../constants/roles";
import { useAuth } from "../../contexts/AuthContext";

const facultyOptions = [{ label: "Information & Communication Technology", value: "fict" }];

export default function RegisterScreen() {
  const router = useRouter();
  const { signUp } = useAuth();
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    role: "student",
    facultyId: "fict",
    facultyName: "Information & Communication Technology"
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
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 24 : 0}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          automaticallyAdjustKeyboardInsets
          contentContainerStyle={{ paddingBottom: 32 }}
        >
          <View style={{ marginBottom: 20 }}>
            <AppText variant="title">Create Account</AppText>
            <AppText variant="caption" style={{ marginTop: 8 }}>
              Register a role-based academic monitoring profile.
            </AppText>
          </View>

          <Card>
            <TextField label="Full Name" value={form.fullName} onChangeText={(value) => update("fullName", value)} placeholder="Your name" />
            <TextField label="Email" value={form.email} onChangeText={(value) => update("email", value)} placeholder="name@email.com" />
            <TextField label="Password" value={form.password} onChangeText={(value) => update("password", value)} placeholder="Password" />
            <SelectField
              label="Role"
              value={form.role}
              onChange={(value) => update("role", value)}
              options={roles.filter((role) => role.value === "student")}
              placeholder="Choose the access role"
            />
            <SelectField
              label="Faculty"
              value={form.facultyId}
              onChange={(value) => update("facultyId", value)}
              options={facultyOptions}
              placeholder="Choose the faculty"
            />
            <AppButton title="Register" onPress={handleRegister} />
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
}
