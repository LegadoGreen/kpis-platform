import React from "react";
import { useAuthStore } from "../store/authStore";
import { useRouter } from "next/navigation";

type RouteGuardProps = {
  role: string;
  children: React.ReactNode;
};

const RouteGuard: React.FC<RouteGuardProps> = ({ role, children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const hasRole = useAuthStore((state) => state.hasRole);
  const router = useRouter();

  React.useEffect(() => {
    if (!isAuthenticated || !hasRole(role)) {
      router.back()
    }
  }, [isAuthenticated, hasRole, role, router]);

  if (!isAuthenticated || !hasRole(role)) {
    return null; // Or show a loading spinner
  }

  return <>{children}</>;
};

export default RouteGuard;
