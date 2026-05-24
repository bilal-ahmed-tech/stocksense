import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import type { RootState } from "@/app/store";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated
  );
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

export function GuestRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated
  );
  return isAuthenticated ? (
    <Navigate to="/dashboard" replace />
  ) : (
    <>{children}</>
  );
}