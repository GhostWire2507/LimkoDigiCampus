export function filterByQuery(items, query, keys) {
  if (!query?.trim()) {
    return items;
  }

  const lowerQuery = query.toLowerCase();

  return items.filter((item) =>
    keys.some((key) => String(item[key] ?? "").toLowerCase().includes(lowerQuery))
  );
}

export function getAttendanceRate(present, total) {
  if (!total) {
    return 0;
  }

  return Math.round((present / total) * 100);
}

export function formatRole(role) {
  if (role === "prl") return "Principal Lecturer";
  if (role === "pl") return "Program Leader";
  return role ? role.charAt(0).toUpperCase() + role.slice(1) : "";
}

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
