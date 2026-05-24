import { Component } from "react";
import type { ReactNode, ErrorInfo } from "react";
import { TrendingUp, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("ErrorBoundary caught:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div
            className="min-h-screen flex items-center justify-center px-6"
            style={{ background: "#09090b" }}
          >
            <div
              className="w-full max-w-sm rounded-2xl p-8 text-center space-y-5"
              style={{
                background: "#0e0e10",
                border: "1px solid rgba(255,255,255,0.07)",
                boxShadow: "0 24px 64px rgba(0,0,0,0.4)",
              }}
            >
              {/* Logo */}
              <div className="flex items-center justify-center gap-2 mb-2">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ background: "linear-gradient(135deg,#4f46e5,#6d28d9)" }}
                >
                  <TrendingUp size={15} strokeWidth={2.5} className="text-white" aria-hidden="true" />
                </div>
                <span className="font-bold text-sm text-white">StockSense</span>
              </div>

              {/* Error icon */}
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto"
                style={{ background: "rgba(239,68,68,0.1)" }}
              >
                <span
                  className="text-2xl font-black"
                  style={{ color: "#f87171" }}
                  aria-hidden="true"
                >
                  !
                </span>
              </div>

              <div>
                <h1 className="text-lg font-bold text-white mb-2">
                  Something went wrong
                </h1>
                <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.4)" }}>
                  {this.state.error?.message ?? "An unexpected error occurred"}
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <button
                  onClick={() => window.location.reload()}
                  className="w-full flex items-center justify-center gap-2 py-3 text-sm font-semibold text-white rounded-xl transition-all active:scale-95 hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
                  style={{ background: "#4f46e5" }}
                >
                  <RefreshCw size={14} strokeWidth={2} aria-hidden="true" />
                  Reload page
                </button>
                <button
                  onClick={() => {
                    this.setState({ hasError: false, error: null });
                    window.location.href = "/dashboard";
                  }}
                  className="w-full py-3 text-sm font-semibold rounded-xl transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
                  style={{
                    color: "rgba(255,255,255,0.5)",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.04)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                  }}
                >
                  Go to dashboard
                </button>
              </div>
            </div>
          </div>
        )
      );
    }
    return this.props.children;
  }
}