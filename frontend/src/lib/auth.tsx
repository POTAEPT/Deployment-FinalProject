import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { AUTH_EXPIRED_EVENT, apiFetch } from "./api";
import { AUTH_URL } from "./config";
import { clearSession, loadSession, saveSession, type Session } from "./session";

type AuthValue = {
  token: string | null;
  username: string | null;
  // เรียก auth-service แล้วเก็บ token ถ้าผิดจะ throw ApiError (เช่น 401 รหัสผ่านผิด)
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
};

type LoginResponse = { status: "success"; user: { username: string }; token: string };

const AuthContext = createContext<AuthValue | null>(null);

// ครอบทั้งแอปไว้ใน main.tsx ทุก component ใช้ useAuth() ได้
export function AuthProvider({ children }: { children: ReactNode }) {
  // เปิดหน้ามาครั้งแรก อ่าน token เดิมจาก localStorage (หมดอายุแล้วจะได้ null)
  const [session, setSession] = useState<Session | null>(() => loadSession());

  const logout = useCallback(() => {
    clearSession();
    setSession(null);
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    const result = await apiFetch<LoginResponse>(`${AUTH_URL}/api/auth/login`, {
      method: "POST",
      body: { username, password },
    });
    setSession(saveSession(result.token));
  }, []);

  // service ไหนตอบ 401 ระหว่างใช้งาน (token หมดอายุ) ให้กลับไปหน้า Login
  useEffect(() => {
    window.addEventListener(AUTH_EXPIRED_EVENT, logout);
    return () => window.removeEventListener(AUTH_EXPIRED_EVENT, logout);
  }, [logout]);

  const value = useMemo(
    () => ({ token: session?.token ?? null, username: session?.username ?? null, login, logout }),
    [session, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components -- hook คู่กับ Provider อยู่ไฟล์เดียวกันให้หาง่าย
export function useAuth(): AuthValue {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth ต้องใช้ภายใน <AuthProvider>");
  return value;
}
