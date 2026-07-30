import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";
import { User } from "../types";
import { authService } from "../services/authService";

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadCurrentUser = useCallback(async () => {
    const token = localStorage.getItem("cloudmart_token");
    if (!token) {
      setIsLoading(false);
      return;
    }
    try {
      const currentUser = await authService.getMe();
      setUser(currentUser);
    } catch {
      localStorage.removeItem("cloudmart_token");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCurrentUser();
  }, [loadCurrentUser]);

  const login = async (email: string, password: string) => {
    const { user: loggedInUser, token } = await authService.login(email, password);
    localStorage.setItem("cloudmart_token", token);
    setUser(loggedInUser);
    toast.success(`Welcome back, ${loggedInUser.name}!`);
  };

  const register = async (name: string, email: string, password: string) => {
    const { user: newUser, token } = await authService.register(name, email, password);
    localStorage.setItem("cloudmart_token", token);
    setUser(newUser);
    toast.success(`Welcome to CloudMart AI, ${newUser.name}!`);
  };

  const logout = async () => {
    try {
      await authService.logout();
    } finally {
      localStorage.removeItem("cloudmart_token");
      setUser(null);
      toast.success("Logged out successfully.");
    }
  };

  const value: AuthContextValue = {
    user,
    isLoading,
    isAuthenticated: !!user,
    isAdmin: user?.role === "admin",
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuthContext must be used within an AuthProvider");
  return ctx;
}
