import { useSelector } from "react-redux";
import { Menu, LogOut } from "lucide-react";
import { useUIStore } from "@/stores/useUIStore";
import { useLogout } from "@/hooks/useLogout";
import StockSearch from "@/components/stock/StockSearch";
import type { RootState } from "@/app/store";

export default function Navbar() {
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);
  const sidebarOpen = useUIStore((s) => s.sidebarOpen);
  const user = useSelector((state: RootState) => state.auth.user);
  const { mutate: logout, isPending } = useLogout();

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  return (
    <header
      className="fixed top-0 right-0 left-0 h-14 z-30 flex items-center px-4 gap-4"
      style={{
        background: "rgba(9,9,11,0.85)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}>
      {/* Sidebar toggle */}
      <button
        onClick={toggleSidebar}
        aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
        className="w-8 h-8 flex items-center justify-center rounded-lg transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 shrink-0"
        style={{ color: "rgba(255,255,255,0.45)" }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background =
            "rgba(255,255,255,0.06)";
          (e.currentTarget as HTMLButtonElement).style.color = "#fff";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background =
            "transparent";
          (e.currentTarget as HTMLButtonElement).style.color =
            "rgba(255,255,255,0.45)";
        }}>
        <Menu size={18} strokeWidth={1.5} aria-hidden="true" />
      </button>

      {/* Search — centered */}
      <div className="flex-1 flex items-center justify-center">
        <StockSearch />
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2 shrink-0">
        {/* User info — hidden on small screens */}
        <div
          className="hidden sm:flex items-center gap-3 pr-2 border-r"
          style={{ borderColor: "rgba(255,255,255,0.07)" }}>
          <div className="text-right hidden md:block">
            <p className="text-xs font-medium text-white leading-none">
              {user?.name}
            </p>
            <p
              className="text-[10px] mt-0.5"
              style={{ color: "rgba(255,255,255,0.35)" }}>
              {user?.email}
            </p>
          </div>
          {/* Avatar */}
          {user?.avatar ? (
            <img
              src={user.avatar}
              alt={user.name ?? "Avatar"}
              className="w-7 h-7 rounded-full object-cover ring-1 ring-white/10"
            />
          ) : (
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
              style={{
                background: "linear-gradient(135deg,#4f46e5,#7c3aed)",
                color: "#fff",
              }}>
              {initials}
            </div>
          )}
        </div>

        {/* Logout */}
        <button
          onClick={() => logout()}
          disabled={isPending}
          aria-label="Log out"
          className="w-8 h-8 flex items-center justify-center rounded-lg transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 disabled:opacity-50"
          style={{ color: "rgba(255,255,255,0.4)" }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background =
              "rgba(239,68,68,0.08)";
            (e.currentTarget as HTMLButtonElement).style.color = "#ef4444";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background =
              "transparent";
            (e.currentTarget as HTMLButtonElement).style.color =
              "rgba(255,255,255,0.4)";
          }}>
          <LogOut size={16} strokeWidth={1.5} aria-hidden="true" />
        </button>
      </div>
    </header>
  );
}
