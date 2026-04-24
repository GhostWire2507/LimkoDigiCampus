import { View } from "react-native";
import { Card } from "./Card";
import { AppText } from "./AppText";

// Standard placeholder shown when a screen has nothing meaningful to display yet.
export function EmptyState({ title, description }) {
  return (
    <Card>
      <View style={{ alignItems: "center", paddingVertical: 24 }}>
        <AppText variant="heading" style={{ textAlign: "center" }}>
          {title}
        </AppText>
        <AppText variant="caption" style={{ textAlign: "center", marginTop: 8, maxWidth: 280 }}>
          {description}
        </AppText>
      </View>
    </Card>
  );
}
