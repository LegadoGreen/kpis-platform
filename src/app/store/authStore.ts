import { create } from "zustand";
import { api } from "../utils/api";
import { AuthContextType } from "../interfaces/user";

export const useAuthStore = create<AuthContextType>((set, get) => ({
  authToken: null,
  user: null,
  isAuthenticated: false,
  login: async (email, password, router) => {
    try {
      const response = await api.post("/auth/login", { email, password });
      const { authToken: token, user: userData } = response.data;

      if (typeof window !== "undefined") {
        localStorage.setItem("authToken", token);
        localStorage.setItem("user", JSON.stringify(userData));
      }
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      set({
        authToken: token,
        user: userData,
        isAuthenticated: true,
      });

      // Redirect based on role
      if (userData._rol.rol_name === "sostenibilidad") {
        router.push("/chat");
      } else if (userData._rol.rol_name === "admin") {
        router.push("/admin");
      }
    } catch (error) {
      console.error("Login error:", error);
      throw new Error("Invalid login credentials");
    }
  },
  logout: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("authToken");
      localStorage.removeItem("user");
    }

    set({
      authToken: null,
      user: null,
      isAuthenticated: false,
    });

    delete api.defaults.headers.common["Authorization"];
  },
  hasRole: (role) => {
    const user = get().user;
    return user?._rol?.rol_name === role;
  },
}));
