import { createContext, useContext, useEffect, useState } from "react";
import { authService } from "../services/authService.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [doctor, setDoctor] = useState(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    async function checkSession() {
      const token = localStorage.getItem("doctorapp_token");

      if (!token) {
        setIsCheckingAuth(false);
        return;
      }

      try {
        const result = await authService.me();
        setDoctor(result.doctor);
      } catch (_error) {
        localStorage.removeItem("doctorapp_token");
        setDoctor(null);
      } finally {
        setIsCheckingAuth(false);
      }
    }

    checkSession();
  }, []);

  async function login(credentials) {
    const result = await authService.login(credentials);
    localStorage.setItem("doctorapp_token", result.token);
    setDoctor(result.doctor);
    return result.doctor;
  }

  async function logout() {
    try {
      await authService.logout();
    } catch (_error) {
      // Local logout should still happen if the token is already expired.
    } finally {
      localStorage.removeItem("doctorapp_token");
      setDoctor(null);
    }
  }

  return (
    <AuthContext.Provider value={{ doctor, isCheckingAuth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
