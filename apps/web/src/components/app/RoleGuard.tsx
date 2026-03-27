import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";
import { useAuth, type Role } from "@/auth/AuthContext";

export function RoleGuard({ allow, children }: { allow: Role[]; children: ReactNode }) {
  const { user } = useAuth();
  if (!user || !allow.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
}
