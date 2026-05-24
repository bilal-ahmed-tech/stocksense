import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  BriefcaseBusiness,
  LineChart,
  Bell,
  Settings,
  TrendingUp,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useUIStore } from "@/stores/useUIStore";
import { useLogout } from "@/hooks/useLogout";
import { useSelector } from "react-redux";
import type { RootState } from "@/app/store";
import { useEffect, useState, useRef } from "react";

const NAV_LINKS = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/portfolio", icon: BriefcaseBusiness, label: "Portfolio" },
  { to: "/watchlist", icon: LineChart, label: "Watchlist" },
  { to: "/alerts", icon: Bell, label: "Alerts" },
];

const MOBILE_BREAKPOINT = 1024;

export default function Sidebar() {
  const sidebarOpen = useUIStore((s) => s.sidebarOpen);
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);
  const setSidebarOpen = useUIStore((s) => s.setSidebarOpen);
  const { mutate: logout, isPending } = useLogout();
  const user = useSelector((s: RootState) => s.auth.user);
  const navigate = useNavigate();

  const [isMobile, setIsMobile] = useState(
    () => window.innerWidth < MOBILE_BREAKPOINT
  );
  const prevIsMobile = useRef(isMobile);

  // Breakpoint detection
  useEffect(() => {
    function handleResize() {
      const mobile = window.innerWidth < MOBILE_BREAKPOINT;
      const crossed = mobile !== prevIsMobile.current;
      if (crossed) {
        prevIsMobile.current = mobile;
        setIsMobile(mobile);
        setSidebarOpen(false);
      }
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [setSidebarOpen]);

  // Swipe to close on mobile
  useEffect(() => {
    if (!isMobile) return;

    let startX = 0;

    function onTouchStart(e: TouchEvent) {
      startX = e.touches[0].clientX;
    }

    function onTouchEnd(e: TouchEvent) {
      const endX = e.changedTouches[0].clientX;
      const diff = startX - endX;
      // Swipe left more than 60px → close
      if (diff > 60 && sidebarOpen) {
        setSidebarOpen(false);
      }
    }

    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    return () => {
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [isMobile, sidebarOpen, setSidebarOpen]);

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  const sidebarWidth = sidebarOpen ? 224 : isMobile ? 0 : 64;
  const isHidden = sidebarWidth === 0;

  return (
    <>
      {/* Backdrop — mobile only */}
      {sidebarOpen && isMobile && (
        <div
          className="fixed inset-0 z-10"
          style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(6px)" }}
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        aria-label="Main navigation"
        className="fixed top-0 left-0 h-full z-20 flex flex-col select-none"
        style={{
          width: sidebarWidth,
          background: "linear-gradient(180deg, #0c0c0f 0%, #09090b 100%)",
          borderRight: isHidden ? "none" : "1px solid rgba(255,255,255,0.06)",
          transition: "width 280ms cubic-bezier(0.4, 0, 0.2, 1)",
          overflowX: "hidden",
          visibility: isHidden ? "hidden" : "visible",
          pointerEvents: isHidden ? "none" : "auto",
        }}
      >
        {/* ── Logo row ─────────────────────────────────────── */}
        <div
          className="flex items-center h-14 px-3 shrink-0"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
        >
          <button
            onClick={() => {
              navigate("/dashboard");
              if (isMobile) setSidebarOpen(false);
            }}
            aria-label="Go to dashboard"
            className="flex items-center gap-3 min-w-0 flex-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 rounded-xl"
          >
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-transform active:scale-90"
              style={{
                background: "linear-gradient(135deg,#4f46e5 0%,#6d28d9 100%)",
                boxShadow: "0 0 20px rgba(79,70,229,0.35)",
              }}
            >
              <TrendingUp
                size={14}
                strokeWidth={2.5}
                className="text-white"
                aria-hidden="true"
              />
            </div>
            {sidebarOpen && (
              <span className="font-bold text-[15px] text-white tracking-tight truncate">
                StockSense
              </span>
            )}
          </button>

          {/* Collapse toggle — desktop only */}
          {!isMobile && (
            <button
              onClick={toggleSidebar}
              aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
              className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ml-1 transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
              style={{ color: "rgba(255,255,255,0.2)" }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLButtonElement;
                el.style.background = "rgba(255,255,255,0.07)";
                el.style.color = "rgba(255,255,255,0.7)";
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLButtonElement;
                el.style.background = "transparent";
                el.style.color = "rgba(255,255,255,0.2)";
              }}
            >
              {sidebarOpen ? (
                <ChevronLeft size={13} strokeWidth={2} aria-hidden="true" />
              ) : (
                <ChevronRight size={13} strokeWidth={2} aria-hidden="true" />
              )}
            </button>
          )}
        </div>

        {/* ── Nav links ─────────────────────────────────────── */}
        <nav className="flex-1 p-2 flex flex-col gap-0.5 overflow-y-auto overflow-x-hidden">
          {sidebarOpen && (
            <p
              className="text-[9px] font-bold uppercase tracking-[0.12em] px-3 pt-3 pb-1.5"
              style={{ color: "rgba(255,255,255,0.18)" }}
            >
              Navigation
            </p>
          )}

          {NAV_LINKS.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/dashboard"}
              className="group relative"
              style={{ outline: "none" }}
              onClick={() => {
                if (isMobile) setSidebarOpen(false);
              }}
            >
              {({ isActive }) => (
                <span
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-150"
                  role="link"
                  style={
                    isActive
                      ? {
                          background: "rgba(99,102,241,0.14)",
                          color: "#a5b4fc",
                          boxShadow: "inset 0 0 0 1px rgba(99,102,241,0.2)",
                        }
                      : { color: "rgba(255,255,255,0.38)" }
                  }
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      (e.currentTarget as HTMLSpanElement).style.background =
                        "rgba(255,255,255,0.05)";
                      (e.currentTarget as HTMLSpanElement).style.color =
                        "rgba(255,255,255,0.75)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      (e.currentTarget as HTMLSpanElement).style.background =
                        "transparent";
                      (e.currentTarget as HTMLSpanElement).style.color =
                        "rgba(255,255,255,0.38)";
                    }
                  }}
                >
                  {isActive && (
                    <span
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-0.75 h-5 rounded-r-full"
                      style={{
                        background:
                          "linear-gradient(180deg,#818cf8,#6366f1)",
                      }}
                      aria-hidden="true"
                    />
                  )}
                  <Icon
                    size={17}
                    strokeWidth={isActive ? 2.2 : 1.6}
                    className="shrink-0 transition-transform group-hover:scale-105"
                    aria-hidden="true"
                  />
                  {sidebarOpen && (
                    <span className="text-[13px] font-medium truncate">
                      {label}
                    </span>
                  )}
                  {/* Tooltip — desktop collapsed only */}
                  {!sidebarOpen && !isMobile && (
                    <span
                      className="absolute left-full ml-3 px-3 py-1.5 rounded-lg text-xs font-semibold text-white whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 z-50"
                      style={{
                        background: "#1c1c20",
                        border: "1px solid rgba(255,255,255,0.09)",
                        boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
                        transition: "opacity 150ms",
                      }}
                      role="tooltip"
                      aria-hidden="true"
                    >
                      {label}
                      <span
                        className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent"
                        style={{ borderRightColor: "#1c1c20" }}
                        aria-hidden="true"
                      />
                    </span>
                  )}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* ── Bottom section ────────────────────────────────── */}
        <div
          className="p-2 flex flex-col gap-0.5 shrink-0"
          style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
        >
          <NavLink
            to="/settings"
            className="group relative"
            style={{ outline: "none" }}
            onClick={() => {
              if (isMobile) setSidebarOpen(false);
            }}
          >
            {({ isActive }) => (
              <span
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-150"
                role="link"
                style={
                  isActive
                    ? {
                        background: "rgba(99,102,241,0.14)",
                        color: "#a5b4fc",
                        boxShadow: "inset 0 0 0 1px rgba(99,102,241,0.2)",
                      }
                    : { color: "rgba(255,255,255,0.38)" }
                }
                onMouseEnter={(e) => {
                  if (!isActive) {
                    (e.currentTarget as HTMLSpanElement).style.background =
                      "rgba(255,255,255,0.05)";
                    (e.currentTarget as HTMLSpanElement).style.color =
                      "rgba(255,255,255,0.75)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    (e.currentTarget as HTMLSpanElement).style.background =
                      "transparent";
                    (e.currentTarget as HTMLSpanElement).style.color =
                      "rgba(255,255,255,0.38)";
                  }
                }}
              >
                {isActive && (
                  <span
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-0.75 h-5 rounded-r-full"
                    style={{
                      background: "linear-gradient(180deg,#818cf8,#6366f1)",
                    }}
                    aria-hidden="true"
                  />
                )}
                <Settings
                  size={17}
                  strokeWidth={isActive ? 2.2 : 1.6}
                  className="shrink-0 transition-transform group-hover:scale-105"
                  aria-hidden="true"
                />
                {sidebarOpen && (
                  <span className="text-[13px] font-medium">Settings</span>
                )}
                {!sidebarOpen && !isMobile && (
                  <span
                    className="absolute left-full ml-3 px-3 py-1.5 rounded-lg text-xs font-semibold text-white whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 z-50"
                    style={{
                      background: "#1c1c20",
                      border: "1px solid rgba(255,255,255,0.09)",
                      boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
                      transition: "opacity 150ms",
                    }}
                    role="tooltip"
                    aria-hidden="true"
                  >
                    Settings
                    <span
                      className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent"
                      style={{ borderRightColor: "#1c1c20" }}
                      aria-hidden="true"
                    />
                  </span>
                )}
              </span>
            )}
          </NavLink>

          {/* User card */}
          <div
            className="flex items-center justify-center gap-2.5 px-3 py-2.5 rounded-xl mt-1"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user?.name ?? "User avatar"}
                className="w-7 h-7 rounded-full object-cover shrink-0 ring-1"
                style={{ outlineColor: "rgba(255,255,255,0.1)" }}
              />
            ) : (
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0"
                style={{
                  background:
                    "linear-gradient(135deg,#4f46e5 0%,#7c3aed 100%)",
                  color: "#fff",
                  boxShadow: "0 0 12px rgba(79,70,229,0.25)",
                }}
              >
                {initials}
              </div>
            )}
            {sidebarOpen && (
              <>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-semibold text-white truncate leading-none mb-0.5">
                    {user?.name}
                  </p>
                  <p
                    className="text-[10px] truncate leading-none"
                    style={{ color: "rgba(255,255,255,0.3)" }}
                  >
                    {user?.email}
                  </p>
                </div>
                <button
                  onClick={() => logout()}
                  disabled={isPending}
                  aria-label="Log out"
                  className="w-6 h-6 flex items-center justify-center rounded-lg transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 disabled:opacity-40 shrink-0"
                  style={{ color: "rgba(255,255,255,0.25)" }}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget as HTMLButtonElement;
                    el.style.background = "rgba(239,68,68,0.12)";
                    el.style.color = "#f87171";
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget as HTMLButtonElement;
                    el.style.background = "transparent";
                    el.style.color = "rgba(255,255,255,0.25)";
                  }}
                >
                  <LogOut size={13} strokeWidth={1.5} aria-hidden="true" />
                </button>
              </>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}