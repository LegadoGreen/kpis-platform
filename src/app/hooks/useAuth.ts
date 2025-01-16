import { useAuth } from "../context/AuthContext";

export const useAuthActions = () => {
  const { login, logout, isAuthenticated } = useAuth();
  return { login, logout, isAuthenticated };
};
