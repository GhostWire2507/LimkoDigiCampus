export const bunker = {
  50: "#f0f1f2",
  100: "#dadbdf",
  200: "#b8bac3",
  300: "#9a9daa",
  400: "#7f8393",
  500: "#686c7a",
  600: "#525561",
  700: "#3e414a",
  800: "#2c2d35",
  900: "#1a1c21",
  950: "#121317"
};

export const lightTheme = {
  mode: "light",
  background: "#e9ebe8",
  card: "rgba(244,245,241,0.82)",
  cardStrong: "rgba(238,240,235,0.96)",
  text: "#1f221f",
  mutedText: "#5e655e",
  border: "rgba(154,157,170,0.4)",
  primary: "#2c2d35",
  primaryText: "#eef0ec",
  success: "#2f9e44",
  warning: "#f08c00",
  danger: "#e03131",
  info: "#1971c2",
  shadow: "rgba(31,34,31,0.12)",
  glow: "rgba(104,108,122,0.22)"
};

export const darkTheme = {
  mode: "dark",
  background: bunker[950],
  card: "rgba(44,45,53,0.6)",
  cardStrong: "rgba(44,45,53,0.85)",
  text: bunker[50],
  mutedText: bunker[300],
  border: "rgba(62,65,74,0.6)",
  primary: bunker[50],
  primaryText: bunker[950],
  success: "#69db7c",
  warning: "#fcc419",
  danger: "#ff6b6b",
  info: "#74c0fc",
  shadow: "rgba(18,19,23,0.5)",
  glow: "rgba(184,186,195,0.2)"
};
