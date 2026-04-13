import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../api.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setTokenState] = useState(() => localStorage.getItem("token"));
  const [loading, setLoading] = useState(!!localStorage.getItem("token"));

  const setToken = useCallback((t) => {
    if (t) localStorage.setItem("token", t);
    else localStorage.removeItem("token");
    setTokenState(t);
  }, []);

  const refreshUser = useCallback(async () => {
    const t = localStorage.getItem("token");
    if (!t) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const { user: u } = await api("/api/auth/me");
      setUser(u);
    } catch {
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [setToken]);

  useEffect(() => {
    refreshUser();
  }, [token, refreshUser]);

  const login = useCallback(
    async (email, password) => {
      const data = await api("/api/auth/login", {
        method: "POST",
        body: { email, password },
      });
      setToken(data.token);
      setUser(data.user);
      return data.user;
    },
    [setToken]
  );

  const register = useCallback(
    async (email, password, name) => {
      const data = await api("/api/auth/register", {
        method: "POST",
        body: { email, password, name },
      });
      setToken(data.token);
      setUser(data.user);
      return data.user;
    },
    [setToken]
  );

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
  }, [setToken]);

  const deleteAccount = useCallback(
    async (password) => {
      await api("/api/auth/delete-account", {
        method: "POST",
        body: { password },
      });
      setToken(null);
      setUser(null);
    },
    [setToken]
  );

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      login,
      register,
      logout,
      deleteAccount,
      refreshUser,
    }),
    [user, token, loading, login, register, logout, deleteAccount, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth outside AuthProvider");
  return ctx;
}
