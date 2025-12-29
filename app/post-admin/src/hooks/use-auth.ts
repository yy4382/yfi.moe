import { useState, useCallback, useEffect } from "react";

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return !!localStorage.getItem("auth_token");
  });

  useEffect(() => {
    const handleStorage = () => {
      setIsAuthenticated(!!localStorage.getItem("auth_token"));
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const login = useCallback((token: string) => {
    localStorage.setItem("auth_token", token);
    setIsAuthenticated(true);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("auth_token");
    setIsAuthenticated(false);
  }, []);

  return { isAuthenticated, login, logout };
}
