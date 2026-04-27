import { useEffect, useState } from "react";
import { Alert, ScrollView, View } from "react-native";
import { AppButton } from "../components/AppButton";
import { AppHeader } from "../components/AppHeader";
import { AppText } from "../components/AppText";
import { Card } from "../components/Card";
import { EmptyState } from "../components/EmptyState";
import { SelectField, TextField } from "../components/FormFields";
import { ScreenWrapper } from "../components/ScreenWrapper";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { deleteAttendance, getAttendanceForRole, getClassesForRole, saveAttendance } from "../services/dataService";
import { useLoad } from "../shared/useLoad";

// Lets lecturers capture attendance while leadership can still review the history.
function AttendanceScreen() {
  const { user } = useAuth();
  const { theme } = useTheme();

  if (!user) {
    return null;
  }

  const [classes] = useLoad(() => getClassesForRole(user), user);
  const [attendance, setAttendance] = useLoad(() => getAttendanceForRole(user), user);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [totalPresent, setTotalPresent] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    if (classes[0] && !selectedClassId) {
      setSelectedClassId(classes[0].id);
    }
  }, [classes, selectedClassId]);

  const classOptions = classes.map((classItem) => ({
    label: `${classItem.courseName} - ${classItem.code}`,
    value: classItem.id
  }));

  // Validates inputs before saving attendance.
  const validate = () => {
    if (!selectedClassId) {
      Alert.alert("Class required", "Please choose a class.");
      return false;
    }
    if (!date.trim()) {
      Alert.alert("Date required", "Please enter a lecture date.");
      return false;
    }
    if (!totalPresent.trim() || isNaN(Number(totalPresent)) || Number(totalPresent) < 0) {
      Alert.alert("Invalid attendance", "Please enter a valid number of students present.");
      return false;
    }
    return true;
  };

  // Saves one attendance record for the selected class and date.
  const submitAttendance = async () => {
    if (!validate()) return;

    setSaving(true);
    try {
      await saveAttendance({
        classId: selectedClassId,
        lectureDate: date,
        lecturerId: user.id,
        totalPresent: Number(totalPresent)
      });

      setAttendance(await getAttendanceForRole(user));
      setTotalPresent("");
      Alert.alert("Attendance saved", "Attendance has been recorded.");
    } catch (error) {
      Alert.alert("Save failed", error?.message || "Failed to save attendance. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const canDeleteAttendance = (item) =>
    user.role === "fmg" || user.role === "pl" || user.role === "prl" || item.lecturerId === user.id;

  const handleDeleteAttendance = (item) => {
    Alert.alert("Delete attendance", "This will permanently remove this attendance record. Continue?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          setDeletingId(item.id);
          try {
            const nextAttendance = await deleteAttendance(item.id, user);
            setAttendance(nextAttendance);
            Alert.alert("Attendance deleted", "The attendance record has been removed.");
          } catch (error) {
            Alert.alert("Delete failed", error?.message || "Failed to delete attendance.");
          } finally {
            setDeletingId(null);
          }
        }
      }
    ]);
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <AppHeader title="Attendance" subtitle="Record presence by lecture session and track attendance rate over time." showBack />

      {user.role === "lecturer" ? (
        <Card>
          <AppText variant="heading">Take attendance</AppText>
          <SelectField label="Class" value={selectedClassId} onChange={setSelectedClassId} options={classOptions} placeholder="Choose a class" />
          <TextField label="Lecture Date" value={date} onChangeText={setDate} placeholder="YYYY-MM-DD" />
          <TextField label="Students Present" value={totalPresent} onChangeText={setTotalPresent} placeholder="36" keyboardType="numeric" />
          <AppButton title="Save Attendance" onPress={submitAttendance} loading={saving} />
        </Card>
      ) : null}

      {attendance.length ? (
        attendance.map((item) => (
          <Card key={item.id}>
            <AppText variant="heading">{item.classDisplayName}</AppText>
            <AppText variant="body" style={{ marginTop: 8 }}>
              {item.courseName}
            </AppText>
            <AppText variant="caption" style={{ marginTop: 8 }}>
              Present: {item.totalPresent} • {item.attendanceRate}% attendance
            </AppText>
            <AppText variant="caption" style={{ marginTop: 4 }}>
              {item.lectureDate}
            </AppText>
            {canDeleteAttendance(item) ? (
              <AppButton
                title="Delete Attendance"
                variant="secondary"
                onPress={() => handleDeleteAttendance(item)}
                style={{ marginTop: 12 }}
                loading={deletingId === item.id}
              />
            ) : null}
          </Card>
        ))
      ) : (
        <EmptyState title="No attendance yet" description="Attendance records will appear here after the first lecture entry." />
      )}
    </ScrollView>
  );
}

export default function AttendanceRoute() {
  return (
    <ScreenWrapper>
      <AttendanceScreen />
    </ScreenWrapper>
  );
}

