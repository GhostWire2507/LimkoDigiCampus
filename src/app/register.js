import { useMemo, useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";
import { useRouter } from "expo-router";
import { AppButton } from "../components/AppButton";
import { AppText } from "../components/AppText";
import { Card } from "../components/Card";
import { MultiSelectField, SelectField, TextField } from "../components/FormFields";
import { ScreenWrapper } from "../components/ScreenWrapper";
import { roles } from "../constants/roles";
import { useAuth } from "../contexts/AuthContext";
import { getRegistrationOptions, peekCachedData } from "../services/dataService";
import { useLoad } from "../shared/useLoad";

// Lets a student choose a faculty, then narrows programmes and classes from that choice.
export default function RegisterScreen() {
  const router = useRouter();
  const { signUp } = useAuth();
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
    // Only show classes that belong to the selected faculty and programmes.
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

  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  // Changing faculty resets the lower-level choices so the hierarchy stays valid.
  const updateFaculty = (facultyId) => {
    const selectedFaculty = options.faculties.find((faculty) => faculty.id === facultyId);

    setForm((current) => ({
      ...current,
      facultyId,
      facultyName: selectedFaculty?.name || current.facultyName,
      programmeIds: [],
      assignedClassIds: []
    }));
  };

  const handleRegister = async () => {
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
            <AppButton
              title="Back to Login"
              variant="secondary"
              onPress={() => (typeof router.canGoBack === "function" && router.canGoBack() ? router.back() : router.replace("/login"))}
              style={{ alignSelf: "flex-start", paddingVertical: 8, paddingHorizontal: 12, borderRadius: 12, marginBottom: 12 }}
            />
            <AppText variant="title">Create Account</AppText>
            <AppText variant="caption" style={{ marginTop: 8 }}>
              Register a role-based academic monitoring profile.
            </AppText>
          </View>

          <Card>
            <TextField label="Full Name" value={form.fullName} onChangeText={(value) => update("fullName", value)} placeholder="Your name" />
            <TextField label="Email" value={form.email} onChangeText={(value) => update("email", value)} placeholder="name@email.com" />
            <TextField
              label="Password"
              value={form.password}
              onChangeText={(value) => update("password", value)}
              placeholder="Password"
              secureTextEntry
            />
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
              onChange={(value) => setForm((current) => ({ ...current, programmeIds: value, assignedClassIds: [] }))}
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
            <AppButton title="Register" onPress={handleRegister} />
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
}
