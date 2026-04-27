import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { Alert, ScrollView, View } from "react-native";
import { AppButton } from "../components/AppButton";
import { AppHeader } from "../components/AppHeader";
import { Card } from "../components/Card";
import { SelectField, TextField } from "../components/FormFields";
import { ScreenWrapper } from "../components/ScreenWrapper";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { getProgrammesForRole, getUserDirectory, saveClassAssignment } from "../services/dataService";
import { useLoad } from "../shared/useLoad";

// Used by leadership roles to create the class-to-programme teaching structure.
function CourseFormScreen() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const router = useRouter();

  if (!user) {
    return null;
  }

  const [programmes] = useLoad(() => getProgrammesForRole(user), user);
  const [directory] = useLoad(() => getUserDirectory(user), user);
  const [saving, setSaving] = useState(false);
  const [values, setValues] = useState({
    programmeId: "",
    displayName: "",
    code: "",
    year: "",
    section: "A",
    courseName: "",
    lecturerId: "",
    prlId: "",
    studentCount: "",
    venue: "",
    scheduleDay: "",
    scheduleTime: ""
  });

  useEffect(() => {
    if (programmes[0] && !values.programmeId) {
      setValues((current) => ({ ...current, programmeId: programmes[0].id }));
    }
  }, [programmes, values.programmeId]);

  const lecturerOptions = directory
    .filter((entry) => entry.role === "lecturer")
    .map((entry) => ({ label: entry.fullName, value: entry.id }));

  const seniorLecturerOptions = directory
    .filter((entry) => entry.role === "prl")
    .map((entry) => ({ label: entry.fullName, value: entry.id }));

  const programmeOptions = programmes.map((programme) => ({
    label: programme.name,
    value: programme.id
  }));

  const selectedProgramme = programmes.find((programme) => programme.id === values.programmeId);
  const update = (key, value) => setValues((current) => ({ ...current, [key]: value }));

  const validate = () => {
    if (!values.programmeId) {
      Alert.alert("Programme required", "Choose a programme before saving.");
      return false;
    }
    if (!values.displayName.trim()) {
      Alert.alert("Display name required", "Please enter a class display name.");
      return false;
    }
    if (!values.code.trim()) {
      Alert.alert("Code required", "Please enter a class code.");
      return false;
    }
    if (!values.year.trim() || isNaN(Number(values.year))) {
      Alert.alert("Year required", "Please enter a valid year number.");
      return false;
    }
    if (!values.courseName.trim()) {
      Alert.alert("Course name required", "Please enter a course name.");
      return false;
    }
    if (!values.lecturerId) {
      Alert.alert("Lecturer required", "Please assign a lecturer to this class.");
      return false;
    }
    if (!values.studentCount.trim() || isNaN(Number(values.studentCount))) {
      Alert.alert("Student count required", "Please enter a valid student count.");
      return false;
    }
    return true;
  };

  // Saves a single class mapping that links programme, lecturer, PRL, and schedule data.
  const handleSave = async () => {
    if (!validate()) return;

    if (!selectedProgramme) {
      Alert.alert("Programme missing", "Choose a programme before saving the class mapping.");
      return;
    }

    setSaving(true);
    try {
      await saveClassAssignment({
        id: `${values.programmeId}-${values.year}${values.section}-${values.courseName}`.toLowerCase().replace(/\s+/g, "-"),
        facultyId: selectedProgramme.facultyId,
        programmeId: values.programmeId,
        plId: user.id,
        prlId: values.prlId,
        lecturerId: values.lecturerId,
        code: values.code,
        year: Number(values.year),
        section: values.section,
        displayName: values.displayName,
        courseName: values.courseName,
        studentCount: Number(values.studentCount),
        venue: values.venue,
        scheduleDay: values.scheduleDay,
        scheduleTime: values.scheduleTime
      });

      Alert.alert("Class saved", "The class mapping has been added.");
      router.replace("/classes");
    } catch (error) {
      Alert.alert("Save failed", error?.message || "Failed to save class mapping. Please try again.");
      setSaving(false);
    }
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <AppHeader title="Class Management" subtitle="Map programmes, lecturers, and classes for monitoring." showBack backHref="/classes" />
      <Card>
        <SelectField label="Programme" value={values.programmeId} onChange={(value) => update("programmeId", value)} options={programmeOptions} placeholder="Choose a programme" />
        <TextField label="Class Display Name" value={values.displayName} onChangeText={(value) => update("displayName", value)} placeholder="Software Engineering - Year 2 (Class A)" />
        <TextField label="Class Code" value={values.code} onChangeText={(value) => update("code", value)} placeholder="SE 2A" />
        <TextField label="Year" value={values.year} onChangeText={(value) => update("year", value)} placeholder="2" keyboardType="numeric" />
        <TextField label="Section" value={values.section} onChangeText={(value) => update("section", value)} placeholder="A" />
        <TextField label="Course Name" value={values.courseName} onChangeText={(value) => update("courseName", value)} placeholder="Data Structures" />
        <SelectField label="Lecturer" value={values.lecturerId} onChange={(value) => update("lecturerId", value)} options={lecturerOptions} placeholder="Choose a lecturer" />
        <SelectField
          label="Senior Lecturer"
          value={values.prlId}
          onChange={(value) => update("prlId", value)}
          options={seniorLecturerOptions}
          placeholder="Choose a senior lecturer"
        />
        <TextField label="Student Count" value={values.studentCount} onChangeText={(value) => update("studentCount", value)} placeholder="42" keyboardType="numeric" />
        <TextField label="Venue" value={values.venue} onChangeText={(value) => update("venue", value)} placeholder="Lab 3" />
        <TextField label="Schedule Day" value={values.scheduleDay} onChangeText={(value) => update("scheduleDay", value)} placeholder="Tuesday" />
        <TextField label="Schedule Time" value={values.scheduleTime} onChangeText={(value) => update("scheduleTime", value)} placeholder="08:00 - 10:00" />
        <AppButton title="Save Class Mapping" onPress={handleSave} loading={saving} />
      </Card>
    </ScrollView>
  );
}

export default function CourseFormRoute() {
  return (
    <ScreenWrapper>
      <CourseFormScreen />
    </ScreenWrapper>
  );
}

