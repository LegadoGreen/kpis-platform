"use client"
import React, { createContext, useState, useContext, ReactNode } from "react";
import api from "../utils/api";

type AuthContextType = {
  authToken: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [authToken, setAuthToken] = useState<string | null>(null);

  const login = async (email: string, password: string) => {
    const response = await api.post("/auth/login", { email, password });
    setAuthToken(response.data.authToken);
    api.defaults.headers.common["Authorization"] = `Bearer ${response.data.authToken}`;
  };

  const logout = () => {
    setAuthToken(null);
    delete api.defaults.headers.common["Authorization"];
  };

  return (
    <AuthContext.Provider value={{ authToken, login, logout, isAuthenticated: !!authToken }}>
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
