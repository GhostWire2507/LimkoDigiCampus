// Defines which bottom tabs each role should see after logging in.
export const roleTabs = {
  student: [
    { label: "Home", href: "/home", icon: "home-outline" },
    { label: "Classes", href: "/classes", icon: "book-outline" },
    { label: "Attendance", href: "/attendance", icon: "checkbox-outline" },
    { label: "Feedback", href: "/ratings", icon: "star-outline" }
  ],
  lecturer: [
    { label: "Home", href: "/home", icon: "home-outline" },
    { label: "Classes", href: "/classes", icon: "layers-outline" },
    { label: "Reports", href: "/reports", icon: "document-text-outline" },
    { label: "Monitoring", href: "/monitoring", icon: "analytics-outline" }
  ],
  prl: [
    { label: "Home", href: "/home", icon: "home-outline" },
    { label: "Classes", href: "/classes", icon: "layers-outline" },
    { label: "Reports", href: "/reports", icon: "reader-outline" },
    { label: "Monitoring", href: "/monitoring", icon: "analytics-outline" }
  ],
  pl: [
    { label: "Home", href: "/home", icon: "home-outline" },
    { label: "Classes", href: "/classes", icon: "layers-outline" },
    { label: "Reports", href: "/reports", icon: "document-text-outline" },
    { label: "Monitoring", href: "/monitoring", icon: "analytics-outline" }
  ],
  fmg: [
    { label: "Home", href: "/home", icon: "home-outline" },
    { label: "Faculties", href: "/faculties", icon: "business-outline" },
    { label: "Reports", href: "/reports", icon: "reader-outline" },
    { label: "Monitoring", href: "/monitoring", icon: "analytics-outline" }
  ]
};
