import { ScrollView } from "react-native";
import { AppHeader } from "../components/AppHeader";
import { AppText } from "../components/AppText";
import { Card } from "../components/Card";
import { EmptyState } from "../components/EmptyState";
import { ScreenWrapper } from "../components/ScreenWrapper";
import { SearchBar } from "../components/SearchBar";
import { useAuth } from "../contexts/AuthContext";
import { getFacultiesForRole } from "../services/dataService";
import { filterByQuery } from "../utils/helpers";
import { LeadershipGate } from "../shared/LeadershipGate";
import { useLoad } from "../shared/useLoad";
import { useState } from "react";

// Gives leadership users a quick overview of faculties in their current scope.
function FacultiesScreen() {
  const { user } = useAuth();
  const [faculties] = useLoad(() => getFacultiesForRole(user), user);
  const [query, setQuery] = useState("");
  const filteredFaculties = filterByQuery(faculties, query, ["name", "code"]);

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <AppHeader title="Faculties" subtitle="Navigate faculty spaces through clean, role-based cards." showBack />
      <LeadershipGate user={user}>
        <>
          <SearchBar value={query} onChangeText={setQuery} placeholder="Search faculties" />
          {filteredFaculties.length ? (
            filteredFaculties.map((faculty) => (
              <Card key={faculty.id}>
                <AppText variant="heading">{faculty.name}</AppText>
                <AppText variant="body" style={{ marginTop: 8 }}>
                  Programmes: {faculty.programmeCount}
                </AppText>
                <AppText variant="caption" style={{ marginTop: 6 }}>
                  Classes mapped: {faculty.classCount}
                </AppText>
              </Card>
            ))
          ) : (
            <EmptyState title="No faculties found" description="Try a different search term." />
          )}
        </>
      </LeadershipGate>
    </ScrollView>
  );
}

export default function FacultiesRoute() {
  return (
    <ScreenWrapper>
      <FacultiesScreen />
    </ScreenWrapper>
  );
}
