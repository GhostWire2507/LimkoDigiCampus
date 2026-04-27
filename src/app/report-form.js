import { useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Alert, ScrollView, View } from "react-native";
import { AppButton } from "../components/AppButton";
import { AppHeader } from "../components/AppHeader";
import { AppText } from "../components/AppText";
import { Card } from "../components/Card";
import { SelectField, TextField } from "../components/FormFields";
import { ScreenWrapper } from "../components/ScreenWrapper";
import { useAuth } from "../contexts/AuthContext";
import { buildReportFromClass, getClassesForRole, saveReport } from "../services/dataService";
import { useLoad } from "../shared/useLoad";

// Walks lecturers through a short multi-step lecture report submission flow.
function ReportFormScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const { classId } = useLocalSearchParams();

  if (!user) {
    return null;
  }

  const [classes] = useLoad(() => getClassesForRole(user), user);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [step, setStep] = useState(1);
  const [values, setValues] = useState({
    weekLabel: "",
    lectureDate: new Date().toISOString().slice(0, 10),
    attendancePresent: "",
    attendanceTotal: "",
    topic: "",
    outcomes: "",
    recommendations: ""
  });

  useEffect(() => {
    if (classId) {
      setSelectedClassId(classId);
    } else if (classes[0] && !selectedClassId) {
      setSelectedClassId(classes[0].id);
    }
  }, [classId, classes, selectedClassId]);

  const selectedClass = classes.find((item) => item.id === selectedClassId);
  const classOptions = classes.map((classItem) => ({
    label: `${classItem.courseName} - ${classItem.code}`,
    value: classItem.id
  }));

  const update = (key, value) => setValues((current) => ({ ...current, [key]: value }));

  // Builds the final report payload from the selected class and the entered form data.
  const submit = async () => {
    if (!selectedClass) {
      Alert.alert("No class selected", "Choose a class before submitting.");
      return;
    }

    const report = buildReportFromClass(selectedClass, values, user);
    await saveReport(report);
    Alert.alert("Report submitted", "The lecture report has been saved.");
    router.replace("/reports");
  };

  const stepContent = {
    1: (
      <>
        <SelectField label="Class" value={selectedClassId} onChange={setSelectedClassId} options={classOptions} placeholder="Choose a class" />
        <TextField label="Week Label" value={values.weekLabel} onChangeText={(value) => update("weekLabel", value)} placeholder="Week 7" />
        <TextField label="Lecture Date" value={values.lectureDate} onChangeText={(value) => update("lectureDate", value)} placeholder="YYYY-MM-DD" />
      </>
    ),
    2: (
      <>
        <TextField
          label="Students Present"
          value={values.attendancePresent}
          onChangeText={(value) => update("attendancePresent", value)}
          placeholder="36"
          keyboardType="numeric"
        />
        <TextField
          label="Class Total"
          value={values.attendanceTotal}
          onChangeText={(value) => update("attendanceTotal", value)}
          placeholder={selectedClass ? String(selectedClass.studentCount) : "46"}
          keyboardType="numeric"
        />
      </>
    ),
    3: <TextField label="Lecture Topic" value={values.topic} onChangeText={(value) => update("topic", value)} placeholder="Topic taught" multiline />,
    4: <TextField label="Learning Outcomes" value={values.outcomes} onChangeText={(value) => update("outcomes", value)} placeholder="Learning outcomes" multiline />,
    5: (
      <TextField
        label="Recommendations"
        value={values.recommendations}
        onChangeText={(value) => update("recommendations", value)}
        placeholder="Challenges, support needed, or recommendations"
        multiline
      />
    )
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <AppHeader title="Lecture Report" subtitle={`Step ${step} of 5`} showBack backHref="/classes" />
      <Card>
        <AppText variant="caption">Selected class</AppText>
        <AppText variant="heading" style={{ marginTop: 8 }}>
          {selectedClass?.displayName || "Loading class..."}
        </AppText>
        <AppText variant="body" style={{ marginTop: 8 }}>
          {selectedClass?.courseName || ""}
        </AppText>
      </Card>
      <Card>{stepContent[step]}</Card>
      <View style={{ flexDirection: "row", gap: 12, marginBottom: 24 }}>
        <AppButton title="Back" variant="secondary" onPress={() => setStep((current) => Math.max(1, current - 1))} style={{ flex: 1 }} />
        {step < 5 ? (
          <AppButton title="Next" onPress={() => setStep((current) => Math.min(5, current + 1))} style={{ flex: 1 }} />
        ) : (
          <AppButton title="Submit Report" onPress={submit} style={{ flex: 1 }} />
        )}
      </View>
    </ScrollView>
  );
}

export default function ReportFormRoute() {
  return (
    <ScreenWrapper>
      <ReportFormScreen />
    </ScreenWrapper>
  );
}
