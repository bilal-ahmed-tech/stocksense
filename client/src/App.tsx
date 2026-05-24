import { RouterProvider } from "react-router-dom";
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
  return <AppContent />;
}