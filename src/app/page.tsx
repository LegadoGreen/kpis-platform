"use client";
import LoginForm from "./components/LoginForm";
import { AuthProvider } from "./context/AuthContext";

export default function Home() {
  localStorage.theme = 'light';
  return (
    <AuthProvider>
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <LoginForm />
      </div>
    </AuthProvider>
  );
}
