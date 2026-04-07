import { View } from "react-native";
import { AppText } from "./AppText";
import { formatRole } from "../utils/helpers";

export function AppHeader({ title, subtitle }) {
  return (
    <View style={{ marginBottom: 18 }}>
      <AppText variant="title">{title}</AppText>
      {subtitle ? (
        <AppText variant="caption" style={{ marginTop: 4 }}>
          {subtitle}
        </AppText>
      ) : null}
    </View>
  );
}

export function GreetingHeader({ user }) {
  return <AppHeader title={`Hello, ${user.fullName.split(" ")[0]}`} subtitle={formatRole(user.role)} />;
}
