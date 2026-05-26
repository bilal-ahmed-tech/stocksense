import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import Footer from "./Footer";
import TradeModal from "@/components/portfolio/TradeModal";
import { useUIStore } from "@/stores/useUIStore";
import { useSocket } from "@/hooks/useSocket";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useState, useEffect } from "react";
import type { PriceUpdatePayload } from "@/types";

const MOBILE_BREAKPOINT = 1024;

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
  const [isMobile, setIsMobile] = useState(
    () => window.innerWidth < MOBILE_BREAKPOINT
  );

  useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // On mobile sidebar is always overlaid — no margin needed
  // On desktop open=224, collapsed=64
  const marginLeft = isMobile ? 0 : sidebarOpen ? 224 : 64;

  return (
    <div className="min-h-screen" style={{ background: "#09090b" }}>
      <Navbar />
      <Sidebar />
      <SocketHandler />
      <div
        className="flex flex-col min-h-screen pt-14 transition-all duration-300"
        style={{ marginLeft }}
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