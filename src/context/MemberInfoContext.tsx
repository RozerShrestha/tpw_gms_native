import React, { createContext, useContext, useState, ReactNode } from "react";
import { MemberLoginInfo } from "../types/api";
import { DashboardTheme, THEME_MALE } from "../components/dashboard/theme";

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
  const [memberInfo, setMemberInfo] = useState<MemberLoginInfo | null>(null);
  const [theme, setTheme] = useState<DashboardTheme>(THEME_MALE);

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
