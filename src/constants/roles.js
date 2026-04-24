// User-facing role options used by forms and labels across the app.
export const roles = [
  { label: "Student", value: "student" },
  { label: "Lecturer", value: "lecturer" },
  { label: "Senior Lecturer", value: "prl" },
  { label: "Programme Leader", value: "pl" },
  { label: "Faculty Admin", value: "fmg" }
];

// Quick lookup for turning stored role codes into readable labels.
export const roleLabels = {
  student: "Student",
  lecturer: "Lecturer",
  prl: "Senior Lecturer",
  pl: "Programme Leader",
  fmg: "Faculty Admin"
};
