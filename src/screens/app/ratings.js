import { useEffect, useState } from "react";
import { Alert, ScrollView } from "react-native";
import { AppButton } from "../../components/AppButton";
import { AppHeader } from "../../components/AppHeader";
import { AppText } from "../../components/AppText";
import { Card } from "../../components/Card";
import { EmptyState } from "../../components/EmptyState";
import { SelectField, TextField } from "../../components/FormFields";
import { ScreenWrapper } from "../../components/ScreenWrapper";
import { useAuth } from "../../contexts/AuthContext";
import { getClassesForRole, getRatingsForRole, saveRating } from "../../services/dataService";
import { useLoad } from "../shared/useLoad";

function RatingsScreen() {
  const { user } = useAuth();
  const [ratings, setRatings] = useLoad(() => getRatingsForRole(user), user);
  const [classes] = useLoad(() => getClassesForRole(user), user);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [rating, setRating] = useState("5");
  const [comment, setComment] = useState("");

  useEffect(() => {
    if (classes[0] && !selectedClassId) {
      setSelectedClassId(classes[0].id);
    }
  }, [classes, selectedClassId]);

  const classOptions = classes.map((classItem) => ({
    label: `${classItem.courseName} - ${classItem.code}`,
    value: classItem.id
  }));

  const submitRating = async () => {
    if (user.role !== "student") {
      return;
    }

    const selectedClass = classes.find((classItem) => classItem.id === selectedClassId);

    if (!selectedClass) {
      Alert.alert("Missing class", "Choose a class before submitting feedback.");
      return;
    }

    await saveRating({
      classId: selectedClassId,
      lecturerId: selectedClass.lecturerId,
      studentId: user.id,
      rating: Number(rating),
      comment,
      createdAt: new Date().toISOString()
    });

    setRatings(await getRatingsForRole(user));
    setComment("");
    Alert.alert("Feedback saved", "Your lecturer feedback has been submitted.");
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <AppHeader title="Feedback" subtitle="Student feedback supports lecturer improvement and leadership monitoring." />

      {user.role === "student" ? (
        <Card>
          <AppText variant="heading">Rate lecturer</AppText>
          <SelectField label="Class" value={selectedClassId} onChange={setSelectedClassId} options={classOptions} placeholder="Choose a class" />
          <TextField label="Rating (1-5)" value={rating} onChangeText={setRating} placeholder="5" keyboardType="numeric" />
          <TextField label="Comment" value={comment} onChangeText={setComment} placeholder="What went well?" multiline />
          <AppButton title="Submit Feedback" onPress={submitRating} />
        </Card>
      ) : null}

      {ratings.length ? (
        ratings.map((item) => (
          <Card key={item.id}>
            <AppText variant="heading">
              {item.courseName} • {item.rating}/5
            </AppText>
            <AppText variant="caption" style={{ marginTop: 8 }}>
              {item.classDisplayName}
            </AppText>
            <AppText variant="caption" style={{ marginTop: 4 }}>
              {item.studentName} → {item.lecturerName}
            </AppText>
            <AppText variant="body" style={{ marginTop: 10 }}>
              {item.comment || "No comment provided."}
            </AppText>
          </Card>
        ))
      ) : (
        <EmptyState title="No feedback yet" description="Feedback submissions will appear here within your role scope." />
      )}
    </ScrollView>
  );
}

export default function RatingsRoute() {
  return (
    <ScreenWrapper>
      <RatingsScreen />
    </ScreenWrapper>
  );
}
