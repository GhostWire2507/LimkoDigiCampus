import { useState } from "react";
import { useRouter } from "expo-router";
import { Alert, ScrollView, View } from "react-native";
import { AppButton } from "../components/AppButton";
import { AppHeader } from "../components/AppHeader";
import { AppText } from "../components/AppText";
import { Card } from "../components/Card";
import { EmptyState } from "../components/EmptyState";
import { ScreenWrapper } from "../components/ScreenWrapper";
import { SearchBar } from "../components/SearchBar";
import { useAuth } from "../contexts/AuthContext";
import { deleteClassAssignment, getClassesForRole } from "../services/dataService";
import { filterByQuery } from "../utils/helpers";
import { useLoad } from "../shared/useLoad";

// Lists the current user's visible classes and links into class-specific actions.
function ClassesScreen() {
  const { user } = useAuth();
  const router = useRouter();

  if (!user) {
    return null;
  }

  const [classes, setClasses] = useLoad(() => getClassesForRole(user), user);
  const [query, setQuery] = useState("");

  const filteredClasses = filterByQuery(classes, query, [
    "displayName",
    "courseName",
    "facultyName",
    "programmeName",
    "lecturerName"
  ]);
  // Only leadership roles can remove class mappings from the system.
  const canDeleteClass = ["pl", "fmg"].includes(user.role);

  const handleDeleteClass = (classItem) => {
    Alert.alert(
      "Delete class mapping",
      `This will remove ${classItem.courseName} for ${classItem.code} and cannot be undone. Continue?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            const nextClasses = await deleteClassAssignment(classItem.id, user);
            setClasses(nextClasses);
            Alert.alert("Class mapping deleted", "The class has been removed.");
          }
        }
      ]
    );
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <AppHeader title="Classes" subtitle="Each class card opens a deeper academic context." showBack />
      <SearchBar value={query} onChangeText={setQuery} placeholder="Search class, course, lecturer, or programme" />

      {["pl", "fmg"].includes(user.role) ? (
        <AppButton title="Add Class Mapping" onPress={() => router.push("/course-form")} style={{ marginBottom: 16 }} />
      ) : null}

      {filteredClasses.length ? (
        filteredClasses.map((classItem) => (
          <Card key={classItem.id}>
            <AppText variant="heading">{classItem.displayName}</AppText>
            <AppText variant="body" style={{ marginTop: 8 }}>
              {classItem.courseName}
            </AppText>
            <AppText variant="caption" style={{ marginTop: 8 }}>
              {classItem.programmeName} • {classItem.lecturerName}
            </AppText>
            <AppText variant="caption" style={{ marginTop: 4 }}>
              {classItem.scheduleDay} • {classItem.scheduleTime} • {classItem.venue}
            </AppText>
            <View style={{ flexDirection: "row", gap: 10, marginTop: 16 }}>
              <AppButton
                title="Open Class"
                variant="secondary"
                style={{ flex: 1 }}
                onPress={() => router.push({ pathname: "/class-detail", params: { classId: classItem.id } })}
              />
              {user.role === "lecturer" ? (
                <AppButton
                  title="Reports"
                  style={{ flex: 1 }}
                  onPress={() => router.push({ pathname: "/report-form", params: { classId: classItem.id } })}
                />
              ) : null}
            </View>
            {canDeleteClass ? (
              <AppButton
                title="Delete Class Mapping"
                variant="secondary"
                onPress={() => handleDeleteClass(classItem)}
                style={{ marginTop: 10 }}
              />
            ) : null}
          </Card>
        ))
      ) : (
        <EmptyState title="No classes found" description="Your scoped classes will appear here." />
      )}
    </ScrollView>
  );
}

export default function ClassesRoute() {
  return (
    <ScreenWrapper>
      <ClassesScreen />
    </ScreenWrapper>
  );
}
