import { View } from "react-native";
import { Card } from "./Card";
import { AppText } from "./AppText";

// Compact metric card used on dashboards and monitoring screens.
export function StatCard({ label, value, helper }) {
  return (
    <Card style={{ flex: 1, marginBottom: 0 }}>
      <AppText variant="caption">{label}</AppText>
      <AppText variant="title" style={{ marginTop: 8 }}>
        {value}
      </AppText>
      {helper ? (
        <View style={{ marginTop: 8 }}>
          <AppText variant="caption">{helper}</AppText>
        </View>
      ) : null}
    </Card>
  );
}
