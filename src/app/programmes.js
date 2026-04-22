import { useState } from "react";
import { ScrollView } from "react-native";
import { AppHeader } from "../components/AppHeader";
import { AppText } from "../components/AppText";
import { Card } from "../components/Card";
import { EmptyState } from "../components/EmptyState";
import { ScreenWrapper } from "../components/ScreenWrapper";
import { SearchBar } from "../components/SearchBar";
import { useAuth } from "../contexts/AuthContext";
import { getProgrammesForRole } from "../services/dataService";
import { filterByQuery } from "../utils/helpers";
import { LeadershipGate } from "../shared/LeadershipGate";
import { useLoad } from "../shared/useLoad";

function ProgrammesScreen() {
  const { user } = useAuth();
  const [programmes] = useLoad(() => getProgrammesForRole(user), user);
  const [query, setQuery] = useState("");
  const filteredProgrammes = filterByQuery(programmes, query, ["name", "facultyName", "code"]);

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <AppHeader title="Programmes" subtitle="Structured programme oversight with role-based visibility." showBack />
      <LeadershipGate user={user}>
        <>
          <SearchBar value={query} onChangeText={setQuery} placeholder="Search programmes" />
          {filteredProgrammes.length ? (
            filteredProgrammes.map((programme) => (
              <Card key={programme.id}>
                <AppText variant="heading">{programme.name}</AppText>
                <AppText variant="body" style={{ marginTop: 8 }}>
                  {programme.facultyName}
                </AppText>
                <AppText variant="caption" style={{ marginTop: 6 }}>
                  Active classes: {programme.classCount}
                </AppText>
              </Card>
            ))
          ) : (
            <EmptyState title="No programmes found" description="Your programme scope will appear here." />
          )}
        </>
      </LeadershipGate>
    </ScrollView>
  );
}

export default function ProgrammesRoute() {
  return (
    <ScreenWrapper>
      <ProgrammesScreen />
    </ScreenWrapper>
  );
}
