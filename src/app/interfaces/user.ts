import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

export type User = {
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

export type AuthContextType = {
  authToken: string | null;
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string, router: AppRouterInstance) => Promise<void>;
  logout: () => void;
  hasRole: (role: string) => boolean;
};