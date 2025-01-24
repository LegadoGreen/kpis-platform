"use client";

import React, { createContext, useState, useContext, ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "../utils/api";
import { AuthContextType, User } from "../interfaces/user";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const storedUser = localStorage.getItem("user");

    if (token && storedUser) {
      setAuthToken(token);
      setUser(JSON.parse(storedUser));
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post("/auth/login", { email, password });
      const { authToken: token, user: userData } = response.data;

      setAuthToken(token);
      setUser(userData);

      localStorage.setItem("authToken", token);
      localStorage.setItem("user", JSON.stringify(userData));
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      if (userData._rol.rol_name === "sostenibilidad") {
        router.push("/chat");
      } else if (userData._rol.rol_name === "admin") {
        router.push("/admin");
      }
    } catch (error) {
      console.error("Login error:", error);
      throw new Error("Invalid login credentials");
    }
  };

  const logout = () => {
    setAuthToken(null);
    setUser(null);
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    delete api.defaults.headers.common["Authorization"];
    router.push("/");
  };

  const hasRole = (role: string) => user?._rol?.rol_name === role;

  return (
    <AuthContext.Provider value={{ authToken, user, login, logout, isAuthenticated: !!authToken, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
