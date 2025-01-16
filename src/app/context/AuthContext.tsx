"use client";

import React, { createContext, useState, useContext, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { api } from "../utils/api";

type User = {
  id: number;
  email: string;
  name: string;
  created_at: number;
  _rol: {
    id: number;
    created_at: number;
    rol_name: string;
  };
};

type AuthContextType = {
  authToken: string | null;
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post("/auth/login", { email, password });
      const { authToken: token, user: userData } = response.data;

      setAuthToken(token);
      setUser(userData);
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      // Redirect based on the role
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
    delete api.defaults.headers.common["Authorization"];
    router.push("/");
  };

  return (
    <AuthContext.Provider value={{ authToken, user, login, logout, isAuthenticated: !!authToken }}>
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
