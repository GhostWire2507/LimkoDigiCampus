import { useMemo, useRef, useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { AppButton } from "../components/AppButton";
import { AppText } from "../components/AppText";
import { Card } from "../components/Card";
import { MultiSelectField, SelectField } from "../components/FormFields";
import { roles } from "../constants/roles";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { getRegistrationOptions, peekCachedData } from "../services/dataService";
import { useLoad } from "../shared/useLoad";

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Lets a student choose a faculty, then narrows programmes and classes from that choice.
export default function RegisterScreen() {
  const router = useRouter();
  const { signUp, isSubmitting } = useAuth();
  const { theme } = useTheme();
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const [showPassword, setShowPassword] = useState(false);
  const cachedOptions = useMemo(() => peekCachedData("registration-options", null, { faculties: [], programmes: [], classes: [] }), []);
  const [options] = useLoad(() => getRegistrationOptions(), "registration-options", cachedOptions);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    role: "student",
    facultyId: "fict",
    facultyName: "Information & Communication Technology",
    programmeIds: [],
    assignedClassIds: []
  });
  const [errors, setErrors] = useState({});

  const facultyOptions = useMemo(
    () => options.faculties.map((faculty) => ({ label: faculty.name, value: faculty.id })),
    [options.faculties]
  );
  const programmeOptions = useMemo(
    () =>
      options.programmes
        .filter((programme) => programme.facultyId === form.facultyId)
        .map((programme) => ({ label: programme.name, value: programme.id })),
    [form.facultyId, options.programmes]
  );
  const classOptions = useMemo(() => {
    const allowedClasses = options.classes.filter((classItem) => {
      if (classItem.facultyId !== form.facultyId) {
        return false;
      }
      if (!form.programmeIds.length) {
        return true;
      }
      return form.programmeIds.includes(classItem.programmeId);
    });
    return allowedClasses.map((classItem) => ({
      label: `${classItem.courseName} • ${classItem.displayName}`,
      value: classItem.id
    }));
  }, [form.facultyId, form.programmeIds, options.classes]);

  const update = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
    if (errors[key]) {
      setErrors((current) => ({ ...current, [key]: null }));
    }
  };

  const updateFaculty = (facultyId) => {
    const selectedFaculty = options.faculties.find((faculty) => faculty.id === facultyId);
    setForm((current) => ({
      ...current,
      facultyId,
      facultyName: selectedFaculty?.name || current.facultyName,
      programmeIds: [],
      assignedClassIds: []
    }));
    setErrors((current) => ({
      ...current,
      programmeIds: null,
      assignedClassIds: null
    }));
  };

  const validate = () => {
    const nextErrors = {};

    if (!form.fullName.trim()) {
      nextErrors.fullName = "Full name is required";
    } else if (form.fullName.trim().length < 2) {
      nextErrors.fullName = "Full name must be at least 2 characters";
    }

    if (!form.email.trim()) {
      nextErrors.email = "Email is required";
    } else if (!validateEmail(form.email.trim())) {
      nextErrors.email = "Please enter a valid email address";
    }

    if (!form.password) {
      nextErrors.password = "Password is required";
    } else if (form.password.length < 4) {
      nextErrors.password = "Password must be at least 4 characters";
    }

    if (!form.assignedClassIds.length) {
      nextErrors.assignedClassIds = "Please select at least one class";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;

    const selectedClasses = options.classes.filter((classItem) => form.assignedClassIds.includes(classItem.id));
    const selectedProgrammeIds = [...new Set(selectedClasses.map((classItem) => classItem.programmeId))];

    if (!selectedClasses.length) {
      Alert.alert("Registration incomplete", "Choose at least one class before registering.");
      return;
    }

    try {
      await signUp({
        ...form,
        programmeIds: selectedProgrammeIds.length ? selectedProgrammeIds : form.programmeIds
      });
      router.replace("/home");
    } catch (error) {
      const message = error?.message || "Registration failed. Please try again.";
      Alert.alert("Registration failed", message);
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
            <AppButton
              title="Back to Login"
              variant="secondary"
              onPress={() => (typeof router.canGoBack === "function" && router.canGoBack() ? router.back() : router.replace("/login"))}
              style={{ alignSelf: "flex-start", paddingVertical: 8, paddingHorizontal: 12, borderRadius: 12, marginBottom: 12 }}
              disabled={isSubmitting}
            />
            <AppText variant="title">Create Account</AppText>
            <AppText variant="caption" style={{ marginTop: 8 }}>
              Register a role-based academic monitoring profile.
            </AppText>
          </View>

          <Card>
            <AppText variant="subheading" style={{ marginBottom: 8 }}>
              Full Name
            </AppText>
            <View
              style={{
                borderRadius: 18,
                borderWidth: 1,
                borderColor: errors.fullName ? theme.error || "#ff4444" : theme.border,
                backgroundColor: theme.cardStrong,
                minHeight: 52,
                paddingHorizontal: 16,
                justifyContent: "center",
                marginBottom: errors.fullName ? 4 : 14
              }}
            >
              <TextInput
                value={form.fullName}
                onChangeText={(value) => update("fullName", value)}
                placeholder="Your name"
                placeholderTextColor={theme.mutedText}
                autoCapitalize="words"
                autoCorrect={false}
                returnKeyType="next"
                blurOnSubmit={false}
                editable={!isSubmitting}
                onSubmitEditing={() => emailRef.current?.focus()}
                style={{ color: theme.text, minHeight: 52 }}
              />
            </View>
            {errors.fullName ? (
              <AppText variant="caption" style={{ color: theme.error || "#ff4444", marginBottom: 10 }}>
                {errors.fullName}
              </AppText>
            ) : null}

            <AppText variant="subheading" style={{ marginBottom: 8 }}>
              Email
            </AppText>
            <View
              style={{
                borderRadius: 18,
                borderWidth: 1,
                borderColor: errors.email ? theme.error || "#ff4444" : theme.border,
                backgroundColor: theme.cardStrong,
                minHeight: 52,
                paddingHorizontal: 16,
                justifyContent: "center",
                marginBottom: errors.email ? 4 : 14
              }}
            >
              <TextInput
                ref={emailRef}
                value={form.email}
                onChangeText={(value) => update("email", value)}
                placeholder="name@email.com"
                placeholderTextColor={theme.mutedText}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                textContentType="username"
                returnKeyType="next"
                blurOnSubmit={false}
                editable={!isSubmitting}
                onSubmitEditing={() => passwordRef.current?.focus()}
                style={{ color: theme.text, minHeight: 52 }}
              />
            </View>
            {errors.email ? (
              <AppText variant="caption" style={{ color: theme.error || "#ff4444", marginBottom: 10 }}>
                {errors.email}
              </AppText>
            ) : null}

            <AppText variant="subheading" style={{ marginBottom: 8 }}>
              Password
            </AppText>
            <View
              style={{
                borderRadius: 18,
                borderWidth: 1,
                borderColor: errors.password ? theme.error || "#ff4444" : theme.border,
                backgroundColor: theme.cardStrong,
                minHeight: 52,
                paddingHorizontal: 16,
                flexDirection: "row",
                alignItems: "center",
                marginBottom: errors.password ? 4 : 14
              }}
            >
              <TextInput
                ref={passwordRef}
                value={form.password}
                onChangeText={(value) => update("password", value)}
                placeholder="Password"
                placeholderTextColor={theme.mutedText}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                textContentType="password"
                returnKeyType="done"
                editable={!isSubmitting}
                onSubmitEditing={handleRegister}
                style={{ flex: 1, color: theme.text, minHeight: 52 }}
              />
              <Pressable onPress={() => setShowPassword((current) => !current)} style={{ paddingLeft: 12, paddingVertical: 10 }}>
                <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color={theme.mutedText} />
              </Pressable>
            </View>
            {errors.password ? (
              <AppText variant="caption" style={{ color: theme.error || "#ff4444", marginBottom: 10 }}>
                {errors.password}
              </AppText>
            ) : null}

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
              onChange={updateFaculty}
              options={facultyOptions}
              placeholder="Choose the faculty"
            />
            <MultiSelectField
              label="Programmes"
              values={form.programmeIds}
              onChange={(value) => {
                setForm((current) => ({ ...current, programmeIds: value, assignedClassIds: [] }));
                setErrors((current) => ({ ...current, assignedClassIds: null }));
              }}
              options={programmeOptions}
              placeholder="Choose the programmes you want to register for"
            />
            <MultiSelectField
              label="Classes"
              values={form.assignedClassIds}
              onChange={(value) => update("assignedClassIds", value)}
              options={classOptions}
              placeholder="Choose the classes that match your registration"
            />
            {errors.assignedClassIds ? (
              <AppText variant="caption" style={{ color: theme.error || "#ff4444", marginBottom: 10 }}>
                {errors.assignedClassIds}
              </AppText>
            ) : null}

            <AppButton
              title="Register"
              onPress={handleRegister}
              loading={isSubmitting}
            />
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

