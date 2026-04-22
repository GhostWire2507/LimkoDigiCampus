import { EmptyState } from "../../components/EmptyState";

const leadershipRoles = ["prl", "pl", "fmg"];

export function LeadershipGate({
  user,
  children,
  title = "Not available",
  description = "This screen is reserved for leadership roles."
}) {
  if (!leadershipRoles.includes(user?.role)) {
    return <EmptyState title={title} description={description} />;
  }

  return children;
}
