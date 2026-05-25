import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import Footer from "./Footer";
import TradeModal from "@/components/portfolio/TradeModal";
import { useUIStore } from "@/stores/useUIStore";
import { useSocket } from "@/hooks/useSocket";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import type { PriceUpdatePayload } from "@/types";

function SocketHandler() {
  const queryClient = useQueryClient();

  const onPriceUpdate = useCallback(
    (_payload: PriceUpdatePayload) => {
      queryClient.invalidateQueries({ queryKey: ["stock"] });
    },
    [queryClient]
  );

  useSocket(onPriceUpdate);
  return null;
}

export default function AppLayout() {
  const sidebarOpen = useUIStore((s) => s.sidebarOpen);

  return (
    <div className="min-h-screen" style={{ background: "#09090b" }}>
      <Navbar />
      <Sidebar />
      <SocketHandler />
      <div
        className="transition-all duration-300 pt-14 flex flex-col min-h-screen"
        style={{ marginLeft: sidebarOpen ? 224 : 0 }}
      >
        <main className="flex-1 p-2 sm:p-6">
          <Outlet />
        </main>
        <Footer />
      </div>
      <TradeModal />
    </div>
  );
}