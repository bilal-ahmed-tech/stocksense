import { RouterProvider } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { Toaster } from "sonner";
import { router } from "@/router";
import { useAuthInit } from "@/hooks/useAuthInit";

function AppContent() {
  const { isLoading } = useAuthInit();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface-950 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      <RouterProvider router={router} />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "#1a1f2e",
            border: "1px solid #2a3142",
            color: "#f9fafb",
            fontSize: "13px",
          },
        }}
      />
    </>
  );
}

export default function App() {
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string;

  if (!googleClientId) {
    console.warn("VITE_GOOGLE_CLIENT_ID is not set — Google sign-in disabled");
  }

  return (
    <GoogleOAuthProvider clientId={googleClientId || "placeholder-client-id"}>
      <AppContent />
    </GoogleOAuthProvider>
  );
}