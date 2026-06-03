import { TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer
      className="px-4 py-4 flex flex-col gap-3"
      style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
    >
      {/* Top row: Logo + Disclaimer */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div
            className="w-5 h-5 rounded-md flex items-center justify-center shrink-0"
            style={{ background: "#4f46e5" }}
          >
            <TrendingUp size={11} strokeWidth={2.5} className="text-white" aria-hidden="true" />
          </div>
          <span className="text-xs font-bold text-white">StockSense</span>
        </div>
        
        <p 
          className="text-xs text-right"
          style={{ color: "rgba(255,255,255,0.2)" }}
        >
          Virtual trading only
        </p>
      </div>

      {/* Bottom row: Navigation links */}
      <nav 
        className="flex flex-wrap items-center justify-center gap-3 pt-1" 
        aria-label="Footer navigation"
      >
        {[
          { to: "/dashboard", label: "Dashboard" },
          { to: "/portfolio", label: "Portfolio" },
          { to: "/watchlist", label: "Watchlist" },
         
        ].map(({ to, label }) => (
          <Link
            key={to}
            to={to}
            className="text-xs transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 rounded"
            style={{ color: "rgba(255,255,255,0.35)" }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.color = "rgba(255,255,255,0.6)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.color = "rgba(255,255,255,0.35)";
            }}
          >
            {label}
          </Link>
        ))}
      </nav>
    </footer>
  );
}