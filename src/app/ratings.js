import { useEffect, useState } from "react";
import { Alert, ScrollView } from "react-native";
import { AppButton } from "../components/AppButton";
import { AppHeader } from "../components/AppHeader";
import { AppText } from "../components/AppText";
import { Card } from "../components/Card";
import { EmptyState } from "../components/EmptyState";
import { SelectField, TextField } from "../components/FormFields";
import { ScreenWrapper } from "../components/ScreenWrapper";
import { useAuth } from "../contexts/AuthContext";
import { deleteRating, getClassesForRole, getRatingsForRole, saveRating } from "../services/dataService";
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

  const canDeleteRating = (item) =>
    user.role === "fmg" || user.role === "pl" || user.role === "prl" || (user.role === "student" && item.studentId === user.id);

  const handleDeleteRating = (item) => {
    Alert.alert("Delete feedback", "This will permanently remove this feedback entry. Continue?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          const nextRatings = await deleteRating(item.id, user);
          setRatings(nextRatings);
          Alert.alert("Feedback deleted", "The rating has been removed.");
        }
      }
    ]);
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <AppHeader title="Feedback" subtitle="Student feedback supports lecturer improvement and leadership monitoring." showBack />

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
            {canDeleteRating(item) ? (
              <AppButton
                title="Delete Feedback"
                variant="secondary"
                onPress={() => handleDeleteRating(item)}
                style={{ marginTop: 12 }}
              />
            ) : null}
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
