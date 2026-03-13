/** Shared theme type used across dashboard components */
export interface DashboardTheme {
  accent: string;
  accentLight: string;
  bg: string;
  card: string;
  border: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  inputBg: string;
  overlay: string;
  isDark: boolean;
}

/* ── Dark variants ── */
export const THEME_MALE: DashboardTheme = {
  accent: "#C62828",
  accentLight: "rgba(198,40,40,0.15)",
  bg: "#1a1a2e",
  card: "#16213e",
  border: "#2a2a4a",
  text: "#ffffff",
  textSecondary: "#aaaaaa",
  textMuted: "#666666",
  inputBg: "#0f1629",
  overlay: "rgba(255,255,255,0.08)",
  isDark: true,
};

export const THEME_FEMALE: DashboardTheme = {
  accent: "#E91E8B",
  accentLight: "rgba(233,30,139,0.15)",
  bg: "#1e1226",
  card: "#291838",
  border: "#3d2450",
  text: "#ffffff",
  textSecondary: "#aaaaaa",
  textMuted: "#666666",
  inputBg: "#1a0e24",
  overlay: "rgba(255,255,255,0.08)",
  isDark: true,
};

/* ── Light variants ── */
export const THEME_MALE_LIGHT: DashboardTheme = {
  accent: "#C62828",
  accentLight: "rgba(198,40,40,0.10)",
  bg: "#F5F5F8",
  card: "#FFFFFF",
  border: "#E0E0E6",
  text: "#1a1a2e",
  textSecondary: "#555566",
  textMuted: "#999999",
  inputBg: "#F0F0F5",
  overlay: "rgba(0,0,0,0.04)",
  isDark: false,
};

export const THEME_FEMALE_LIGHT: DashboardTheme = {
  accent: "#E91E8B",
  accentLight: "rgba(233,30,139,0.08)",
  bg: "#F8F4F7",
  card: "#FFFFFF",
  border: "#E6D8E2",
  text: "#1e1226",
  textSecondary: "#665570",
  textMuted: "#999999",
  inputBg: "#F5F0F5",
  overlay: "rgba(0,0,0,0.04)",
  isDark: false,
};
