import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { darkTheme, lightTheme } from "../constants/theme";
import { loadItem, saveItem } from "../services/storage";

const ThemeContext = createContext(null);

// Remembers the current color mode and makes it available app-wide.
export function ThemeProvider({ children }) {
  const [mode, setMode] = useState("light");

  useEffect(() => {
    loadItem("themeMode", "light").then(setMode);
  }, []);

  const value = useMemo(() => {
    const theme = mode === "dark" ? darkTheme : lightTheme;

    return {
      mode,
      theme,
      toggleTheme: async () => {
        const next = mode === "dark" ? "light" : "dark";
        setMode(next);
        await saveItem("themeMode", next);
      }
    };
  }, [mode]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
