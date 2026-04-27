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
import { deleteRating, getClassesForRole, getRatingsForRole, saveRating } from "../services/dataService";
import { useLoad } from "../shared/useLoad";

// Students submit lecturer feedback here, while leadership can review or remove entries.
function RatingsScreen() {
  const { user } = useAuth();
  const { theme } = useTheme();

  if (!user) {
    return null;
  }

  const [ratings, setRatings] = useLoad(() => getRatingsForRole(user), user);
  const [classes] = useLoad(() => getClassesForRole(user), user);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [rating, setRating] = useState("5");
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
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

  const validate = () => {
    if (user.role !== "student") {
      Alert.alert("Access denied", "Only students can submit feedback.");
      return false;
    }
    const selectedClass = classes.find((classItem) => classItem.id === selectedClassId);
    if (!selectedClass) {
      Alert.alert("Class required", "Please choose a class.");
      return false;
    }
    const ratingNum = Number(rating);
    if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      Alert.alert("Invalid rating", "Please enter a rating between 1 and 5.");
      return false;
    }
    return true;
  };

  // Saves a new rating tied to the selected class and lecturer.
  const submitRating = async () => {
    if (!validate()) return;

    const selectedClass = classes.find((classItem) => classItem.id === selectedClassId);

    setSubmitting(true);
    try {
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
    } catch (error) {
      Alert.alert("Submit failed", error?.message || "Failed to submit feedback. Please try again.");
    } finally {
      setSubmitting(false);
    }
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
          setDeletingId(item.id);
          try {
            const nextRatings = await deleteRating(item.id, user);
            setRatings(nextRatings);
            Alert.alert("Feedback deleted", "The rating has been removed.");
          } catch (error) {
            Alert.alert("Delete failed", error?.message || "Failed to delete feedback.");
          } finally {
            setDeletingId(null);
          }
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
          <AppButton title="Submit Feedback" onPress={submitRating} loading={submitting} />
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
                loading={deletingId === item.id}
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

