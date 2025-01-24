"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../../store/authStore"; // adjust the path if needed
import LogoMessage from "@/app/components/LogoMessage";

const LogoutPage: React.FC = () => {
  const logout = useAuthStore((state) => state.logout);
  const router = useRouter();

  useEffect(() => {
    // Call logout from the store
    logout();
    // Redirect to home
    router.replace("/");
  }, [logout, router]);

  // You can render any simple placeholder
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <LogoMessage message="Saliendo..." />
    </div>
  );
};

export default LogoutPage;
