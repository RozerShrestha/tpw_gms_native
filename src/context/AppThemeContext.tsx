import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { getItemAsync, setItemAsync } from "../storage/credentialStorage";

const STORAGE_KEY = "app_theme_mode";

interface AppThemeState {
  isDark: boolean;
  toggleTheme: () => void;
}

const AppThemeContext = createContext<AppThemeState>({
  isDark: true,
  toggleTheme: () => {},
});

export function AppThemeProvider({ children }: { children: ReactNode }) {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    getItemAsync(STORAGE_KEY).then((val) => {
      if (val === "light") setIsDark(false);
    });
  }, []);

  const toggleTheme = () => {
    setIsDark((prev) => {
      const next = !prev;
      setItemAsync(STORAGE_KEY, next ? "dark" : "light");
      return next;
    });
  };

  return (
    <AppThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </AppThemeContext.Provider>
  );
}

export function useAppTheme() {
  return useContext(AppThemeContext);
}
