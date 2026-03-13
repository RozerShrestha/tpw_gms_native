import React, { createContext, useContext, useState, useMemo, ReactNode } from "react";
import { MemberLoginInfo } from "../types/api";
import {
  DashboardTheme,
  THEME_MALE,
  THEME_FEMALE,
  THEME_MALE_LIGHT,
  THEME_FEMALE_LIGHT,
} from "../components/dashboard/theme";
import { useAppTheme } from "./AppThemeContext";

interface MemberInfoState {
  memberInfo: MemberLoginInfo | null;
  setMemberInfo: (info: MemberLoginInfo | null) => void;
  theme: DashboardTheme;
  setTheme: (theme: DashboardTheme) => void;
}

const MemberInfoContext = createContext<MemberInfoState>({
  memberInfo: null,
  setMemberInfo: () => {},
  theme: THEME_MALE,
  setTheme: () => {},
});

export function MemberInfoProvider({ children }: { children: ReactNode }) {
  const { isDark } = useAppTheme();
  const [memberInfo, setMemberInfo] = useState<MemberLoginInfo | null>(null);
  const [genderOverride, setGenderOverride] = useState<"male" | "female" | null>(null);

  const theme = useMemo(() => {
    const isFemale =
      genderOverride === "female" ||
      (!genderOverride && memberInfo?.gender?.toLowerCase() === "female");
    if (isFemale) return isDark ? THEME_FEMALE : THEME_FEMALE_LIGHT;
    return isDark ? THEME_MALE : THEME_MALE_LIGHT;
  }, [isDark, genderOverride, memberInfo?.gender]);

  const setTheme = (t: DashboardTheme) => {
    // Infer gender from the accent color to keep gender override in sync
    if (t.accent === THEME_FEMALE.accent) setGenderOverride("female");
    else setGenderOverride("male");
  };

  return (
    <MemberInfoContext.Provider
      value={{ memberInfo, setMemberInfo, theme, setTheme }}
    >
      {children}
    </MemberInfoContext.Provider>
  );
}

export function useMemberInfo() {
  return useContext(MemberInfoContext);
}
