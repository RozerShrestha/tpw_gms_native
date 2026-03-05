/** Shared theme type used across dashboard components */
export interface DashboardTheme {
  accent: string;
  accentLight: string;
  bg: string;
  card: string;
  border: string;
}

export const THEME_MALE: DashboardTheme = {
  accent: "#FF6B35",
  accentLight: "rgba(255,107,53,0.15)",
  bg: "#1a1a2e",
  card: "#16213e",
  border: "#2a2a4a",
};

export const THEME_FEMALE: DashboardTheme = {
  accent: "#E91E8B",
  accentLight: "rgba(233,30,139,0.15)",
  bg: "#1e1226",
  card: "#291838",
  border: "#3d2450",
};
