import { useRouter } from "expo-router";
import { View } from "react-native";
import { AppButton } from "./AppButton";
import { AppText } from "./AppText";
import { formatRole } from "../utils/helpers";

export function AppHeader({ title, subtitle, showBack = false, backHref = "/home", backLabel = "Back" }) {
  const router = useRouter();

  const handleBack = () => {
    if (typeof router.canGoBack === "function" && router.canGoBack()) {
      router.back();
      return;
    }

    if (backHref) {
      router.replace(backHref);
    }
  };

  return (
    <View style={{ marginBottom: 18 }}>
      {showBack ? (
        <AppButton
          title={backLabel}
          variant="secondary"
          onPress={handleBack}
          style={{ alignSelf: "flex-start", paddingVertical: 8, paddingHorizontal: 12, borderRadius: 12, marginBottom: 12 }}
        />
      ) : null}
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
  if (!user) {
    return <AppHeader title="Hello" subtitle="Loading profile" />;
  }

  return <AppHeader title={`Hello, ${user.fullName.split(" ")[0]}`} subtitle={formatRole(user.role)} />;
}
