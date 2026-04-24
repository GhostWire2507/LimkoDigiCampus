import { roleLabels } from "../constants/roles";

// Basic text search helper used by list screens.
export function filterByQuery(items, query, keys) {
  if (!query?.trim()) {
    return items;
  }

  const lowerQuery = query.toLowerCase();

  return items.filter((item) =>
    keys.some((key) => String(item[key] ?? "").toLowerCase().includes(lowerQuery))
  );
}

// Converts attendance counts into a rounded percentage.
export function getAttendanceRate(present, total) {
  if (!total) {
    return 0;
  }

  return Math.round((present / total) * 100);
}

// Averages a list of numeric values and keeps one decimal place for display.
export function average(values) {
  if (!values.length) {
    return 0;
  }

  const total = values.reduce((sum, value) => sum + Number(value || 0), 0);
  return Number((total / values.length).toFixed(1));
}

// Turns a stored role key into the matching label.
export function formatRole(role) {
  return roleLabels[role] || "";
}

// Builds CSV text from an array of plain objects for report export.
export function createCsvContent(rows) {
  if (!rows.length) {
    return "";
  }

  const headers = Object.keys(rows[0]);
  const lines = rows.map((row) =>
    headers
      .map((header) => `"${String(row[header] ?? "").replace(/"/g, '""')}"`)
      .join(",")
  );

  return [headers.join(","), ...lines].join("\n");
}
