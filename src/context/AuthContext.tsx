import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { loginWithPassword } from "../api/auth";
import {
  deleteItemAsync,
  getItemAsync,
  setItemAsync,
} from "../storage/credentialStorage";

interface AuthState {
  accessToken: string | null;
  memberId: string | null;
  role: string | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthState>({
  accessToken: null,
  memberId: null,
  role: null,
  isLoading: true,
  login: async () => {},
  logout: () => {},
});

const TOKEN_KEY = "access_token";
const MEMBER_KEY = "member_id";
const ROLE_KEY = "role";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [memberId, setMemberId] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore persisted credentials on app start
  useEffect(() => {
    (async () => {
      try {
        console.log("[Auth] Restoring credentials from storage...");
        const storedToken = await getItemAsync(TOKEN_KEY);
        const storedMemberId = await getItemAsync(MEMBER_KEY);
        const storedRole = await getItemAsync(ROLE_KEY);
        console.log("[Auth] Stored token exists:", !!storedToken);
        console.log("[Auth] Stored memberId exists:", !!storedMemberId);
        console.log("[Auth] Stored role:", storedRole);
        if (storedToken && storedMemberId) {
          setAccessToken(storedToken);
          setMemberId(storedMemberId);
          setRole(storedRole);
        } else if (storedToken || storedMemberId || storedRole) {
          // If storage is partially corrupted/cleared, clean it up.
          deleteItemAsync(TOKEN_KEY).catch(() => {});
          deleteItemAsync(MEMBER_KEY).catch(() => {});
          deleteItemAsync(ROLE_KEY).catch(() => {});
        }
      } catch (e) {
        console.log("[Auth] Error restoring credentials:", e);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    console.log("[Auth] login() called with username:", username);

    const data = await loginWithPassword(username, password);
    console.log("[Auth] loginWithPassword returned. access_token exists:", !!data.access_token);
    console.log("[Auth] memberId from response:", data.memberId);
    console.log("[Auth] role from response:", data.role);

    // Persist to storage (SecureStore on native, localStorage on web)
    try {
      await setItemAsync(TOKEN_KEY, data.access_token);
      console.log("[Auth] Saved access_token to storage");
    } catch (e) {
      console.log("[Auth] Failed to save access_token to storage:", e);
    }

    try {
      await setItemAsync(MEMBER_KEY, data.memberId);
      console.log("[Auth] Saved memberId to storage");
    } catch (e) {
      console.log("[Auth] Failed to save memberId to storage:", e);
    }

    try {
      await setItemAsync(ROLE_KEY, data.role);
      console.log("[Auth] Saved role to storage");
    } catch (e) {
      console.log("[Auth] Failed to save role to storage:", e);
    }

    // Update React state — triggers navigation
    console.log("[Auth] Setting state NOW");
    setAccessToken(data.access_token);
    setMemberId(data.memberId);
    setRole(data.role);
    console.log("[Auth] State updated. Navigation should switch to Dashboard.");
  }, []);

  const logout = useCallback(() => {
    console.log("[Auth] logout() called — clearing state NOW");
    // Clear state FIRST so UI updates immediately
    setAccessToken(null);
    setMemberId(null);
    setRole(null);
    console.log("[Auth] React state cleared. Cleaning storage in background...");
    // Fire-and-forget storage cleanup
    deleteItemAsync(TOKEN_KEY).catch(() => {});
    deleteItemAsync(MEMBER_KEY).catch(() => {});
    deleteItemAsync(ROLE_KEY).catch(() => {});
  }, []);

  return (
    <AuthContext.Provider
      value={{ accessToken, memberId, role, isLoading, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  return useContext(AuthContext);
}
