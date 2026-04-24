// Makes small status values look cleaner in the UI.
export function titleCaseStatus(value) {
  if (!value) {
    return "";
  }

  return value.charAt(0).toUpperCase() + value.slice(1);
}
