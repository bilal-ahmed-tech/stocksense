import { useState } from "react";
import {
  Bell,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Plus,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  Search,
  X,
} from "lucide-react";
import {
  useAlerts,
  useCreateAlert,
  useToggleAlert,
  useDeleteAlert,
} from "@/hooks/useAlerts";
import { useStockSearch } from "@/hooks/useStockSearch";
import { useDebounce } from "@/hooks/useDebounce";
import { formatUSD } from "@/lib/formatters";
import { format, parseISO } from "date-fns";
import type { AlertCondition } from "@/types";
import ErrorCard from "@/components/ui/ErrorCard";

export default function Alerts() {
  const {
    data: alerts,
    isLoading,
    isError: alertsError,
    refetch: refetchAlerts,
  } = useAlerts();
  const { mutate: createAlert, isPending: creating } = useCreateAlert();
  const { mutate: toggleAlert } = useToggleAlert();
  const { mutate: deleteAlert } = useDeleteAlert();

  const [symbol, setSymbol] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [condition, setCondition] = useState<AlertCondition>("ABOVE");
  const [targetPrice, setTargetPrice] = useState("");
  const [formError, setFormError] = useState("");

  const debouncedSymbol = useDebounce(symbol, 400);
  const { data: searchResults, isLoading: searching } =
    useStockSearch(debouncedSymbol);

  function handleSelectSymbol(sym: string) {
    setSymbol(sym);
    setShowResults(false);
  }

  function handleCreate() {
    setFormError("");
    if (!symbol.trim()) return setFormError("Symbol is required");
    const price = parseFloat(targetPrice);
    if (isNaN(price) || price <= 0)
      return setFormError("Enter a valid target price");
    createAlert(
      { symbol: symbol.toUpperCase(), condition, targetPrice: price },
      {
        onSuccess: () => {
          setSymbol("");
          setTargetPrice("");
          setCondition("ABOVE");
        },
      }
    );
  }

  const activeAlerts = alerts?.filter((a) => !a.triggered) ?? [];
  const triggeredAlerts = alerts?.filter((a) => a.triggered) ?? [];

  return (
    <main className="space-y-6 max-w-5xl mx-auto">
      <title>Alerts — StockSense</title>

      {/* Header */}
      <header>
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Price Alerts
        </h1>
        <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.35)" }}>
          Get notified when a stock hits your target price
        </p>
      </header>

      {/* Create form */}
      <section
        aria-label="Create price alert"
        className="rounded-2xl p-5 space-y-4"
        style={{
          background: "#0e0e10",
          border: "1px solid rgba(255,255,255,0.07)",
        }}
      >
        <div className="flex items-center gap-2 mb-1">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: "rgba(99,102,241,0.12)", color: "#818cf8" }}
          >
            <Plus size={14} strokeWidth={2} aria-hidden="true" />
          </div>
          <h2 className="text-sm font-semibold text-white">New Alert</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3  gap-3">
          {/* Symbol with search */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="alert-symbol"
              className="text-xs font-medium"
              style={{ color: "rgba(255,255,255,0.4)" }}
            >
              Symbol
            </label>
            <div className="relative">
              <div
                className="flex items-center gap-2 px-2 py-2.5 rounded-xl transition-all"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
                onFocusCapture={(e) => {
                  (e.currentTarget as HTMLDivElement).style.border =
                    "1px solid rgba(99,102,241,0.5)";
                  (e.currentTarget as HTMLDivElement).style.background =
                    "rgba(255,255,255,0.07)";
                }}
                onBlurCapture={(e) => {
                  if (!e.currentTarget.contains(e.relatedTarget)) {
                    (e.currentTarget as HTMLDivElement).style.border =
                      "1px solid rgba(255,255,255,0.08)";
                    (e.currentTarget as HTMLDivElement).style.background =
                      "rgba(255,255,255,0.05)";
                    setTimeout(() => setShowResults(false), 200);
                  }
                }}
              >
                <Search
                  size={13}
                  strokeWidth={1.5}
                  aria-hidden="true"
                  style={{ color: "rgba(255,255,255,0.25)", flexShrink: 0 }}
                />
                <input
                  id="alert-symbol"
                  type="text"
                  value={symbol}
                  onChange={(e) => {
                    setSymbol(e.target.value.toUpperCase());
                    setShowResults(true);
                  }}
                  onFocus={() => setShowResults(true)}
                  placeholder="e.g. AAPL"
                  aria-label="Stock symbol"
                  aria-expanded={showResults}
                  aria-haspopup="listbox"
                  className="flex-1 max-w-[89] bg-transparent text-sm font-mono text-white placeholder:text-white/20 focus:outline-none"
                />
                {searching && (
                  <div
                    className="w-4 h-4 rounded-full border-2 border-t-transparent shrink-0 animate-spin"
                    style={{
                      borderColor: "rgba(99,102,241,0.5)",
                      borderTopColor: "transparent",
                    }}
                  />
                )}
                {symbol && !searching && (
                  <button
                    onClick={() => {
                      setSymbol("");
                      setShowResults(false);
                    }}
                    aria-label="Clear symbol"
                    className="shrink-0 w-5 h-5 cursor-pointer flex items-center justify-center rounded-md focus-visible:outline-none transition-colors"
                    style={{ color: "rgba(255,255,255,0.3)", marginRight: "2px" }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.color = "#fff";
                      (e.currentTarget as HTMLButtonElement).style.background =
                        "rgba(255,255,255,0.08)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.color =
                        "rgba(255,255,255,0.3)";
                      (e.currentTarget as HTMLButtonElement).style.background =
                        "transparent";
                    }}
                  >
                    <X size={14} strokeWidth={2} aria-hidden="true" />
                  </button>
                )}
              </div>

              {/* Search dropdown */}
              {showResults && searchResults && searchResults.length > 0 && (
                <div
                  role="listbox"
                  aria-label="Search results"
                  className="absolute top-full left-0 right-0 mt-1 rounded-xl overflow-hidden z-50"
                  style={{
                    background: "#18181b",
                    border: "1px solid rgba(255,255,255,0.08)",
                    boxShadow: "0 16px 48px rgba(0,0,0,0.6)",
                  }}
                >
                  {searchResults.slice(0, 5).map((result) => (
                    <button
                      key={result.symbol}
                      role="option"
                      aria-selected={symbol === result.symbol}
                      onClick={() => handleSelectSymbol(result.symbol)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-left transition-all focus-visible:outline-none"
                      style={{
                        borderBottom: "1px solid rgba(255,255,255,0.05)",
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.background =
                          "rgba(255,255,255,0.04)";
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.background =
                          "transparent";
                      }}
                    >
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0"
                        style={{
                          background: "rgba(99,102,241,0.12)",
                          color: "#818cf8",
                        }}
                      >
                        {result.symbol.slice(0, 2)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-mono text-xs font-semibold text-white">
                          {result.symbol}
                        </p>
                        <p
                          className="text-[10px] truncate"
                          style={{ color: "rgba(255,255,255,0.35)" }}
                        >
                          {result.name}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* No results */}
              {showResults &&
                debouncedSymbol.trim().length >= 1 &&
                !searching &&
                searchResults?.length === 0 && (
                  <div
                    className="absolute top-full left-0 right-0 mt-1 rounded-xl p-3 z-50 text-center"
                    style={{
                      background: "#18181b",
                      border: "1px solid rgba(255,255,255,0.08)",
                      boxShadow: "0 16px 48px rgba(0,0,0,0.6)",
                    }}
                  >
                    <p
                      className="text-xs"
                      style={{ color: "rgba(255,255,255,0.3)" }}
                    >
                      No results for "{debouncedSymbol}"
                    </p>
                  </div>
                )}
            </div>
          </div>

          {/* Condition */}
          <div className="flex flex-col gap-1.5">
            <span
              className="text-xs font-medium"
              style={{ color: "rgba(255,255,255,0.4)" }}
            >
              Condition
            </span>
            <div
              className="flex gap-1 p-1 rounded-xl"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
              role="group"
              aria-label="Alert condition"
            >
              {(["ABOVE", "BELOW"] as AlertCondition[]).map((c) => (
                <button
                  key={c}
                  onClick={() => setCondition(c)}
                  aria-pressed={condition === c}
                  className="flex-1 flex cursor-pointer items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-indigo-500"
                  style={
                    condition === c
                      ? c === "ABOVE"
                        ? {
                            background: "rgba(16,185,129,0.15)",
                            color: "#10b981",
                          }
                        : {
                            background: "rgba(239,68,68,0.15)",
                            color: "#ef4444",
                          }
                      : { color: "rgba(255,255,255,0.35)" }
                  }
                >
                  {c === "ABOVE" ? (
                    <TrendingUp size={12} strokeWidth={2} aria-hidden="true" />
                  ) : (
                    <TrendingDown size={12} strokeWidth={2} aria-hidden="true" />
                  )}
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Target price */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="alert-price"
              className="text-xs font-medium"
              style={{ color: "rgba(255,255,255,0.4)" }}
            >
              Target Price
            </label>
            <input
              id="alert-price"
              type="text"
              value={targetPrice}
              onChange={(e) => setTargetPrice(e.target.value)}
              placeholder="0.00"
              className="px-3 py-2.5 rounded-xl text-sm font-mono text-white placeholder:text-white/20 focus:outline-none transition-all"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
              onFocus={(e) => {
                e.currentTarget.style.border =
                  "1px solid rgba(99,102,241,0.5)";
                e.currentTarget.style.background = "rgba(255,255,255,0.07)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.border =
                  "1px solid rgba(255,255,255,0.08)";
                e.currentTarget.style.background = "rgba(255,255,255,0.05)";
              }}
            />
          </div>
        </div>

        {formError && (
          <p role="alert" className="text-xs" style={{ color: "#f87171" }}>
            {formError}
          </p>
        )}

        <button
          onClick={handleCreate}
          disabled={creating}
          className="px-5 py-2.5 cursor-pointer text-sm font-semibold text-white rounded-xl transition-all active:scale-95 hover:opacity-90 disabled:opacity-50 disabled:active:scale-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
          style={{ background: "#4f46e5" }}
        >
          {creating ? "Creating..." : "Create Alert"}
        </button>
      </section>

      {/* Active alerts */}
      <section aria-label="Active alerts">
        <div className="flex items-center justify-between mb-3">
          <h2
            className="text-sm font-semibold"
            style={{ color: "rgba(255,255,255,0.5)" }}
          >
            Active
            <span
              className="ml-2 px-2 py-0.5 rounded-full text-xs font-bold"
              style={{ background: "rgba(99,102,241,0.12)", color: "#818cf8" }}
            >
              {activeAlerts.length}
            </span>
          </h2>
        </div>

        {isLoading ? (
          <AlertsSkeleton />
        ) : alertsError ? (
          <ErrorCard message="Failed to load alerts." refetch={refetchAlerts} />
        ) : activeAlerts.length === 0 ? (
          <EmptyAlerts />
        ) : (
          <div
            className="rounded-2xl overflow-hidden"
            style={{
              background: "#0e0e10",
              border: "1px solid rgba(255,255,255,0.07)",
            }}
          >
            <ul role="list">
              {activeAlerts.map((alert, i) => (
                <li
                  key={alert._id}
                  className="flex items-center justify-between px-5 py-4 transition-all group"
                  style={{
                    borderBottom:
                      i < activeAlerts.length - 1
                        ? "1px solid rgba(255,255,255,0.04)"
                        : "none",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLLIElement).style.background =
                      "rgba(255,255,255,0.025)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLLIElement).style.background =
                      "transparent";
                  }}
                >
                  {/* Left */}
                  <div className="flex items-center gap-4">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                      style={{
                        background: alert.active
                          ? "rgba(99,102,241,0.1)"
                          : "rgba(255,255,255,0.04)",
                        color: alert.active
                          ? "#818cf8"
                          : "rgba(255,255,255,0.25)",
                      }}
                    >
                      <Bell size={17} strokeWidth={1.5} aria-hidden="true" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-mono text-sm font-semibold text-white">
                          {alert.symbol}
                        </span>
                        <span
                          className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                          style={
                            alert.condition === "ABOVE"
                              ? {
                                  background: "rgba(16,185,129,0.1)",
                                  color: "#10b981",
                                }
                              : {
                                  background: "rgba(239,68,68,0.1)",
                                  color: "#ef4444",
                                }
                          }
                        >
                          {alert.condition}
                        </span>
                        {!alert.active && (
                          <span
                            className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                            style={{
                              background: "rgba(255,255,255,0.06)",
                              color: "rgba(255,255,255,0.35)",
                            }}
                          >
                            PAUSED
                          </span>
                        )}
                      </div>
                      <p
                        className="text-xs"
                        style={{ color: "rgba(255,255,255,0.35)" }}
                      >
                        Target:{" "}
                        <span className="font-mono text-white font-medium">
                          {formatUSD(alert.targetPrice)}
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Right */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleAlert(alert._id)}
                      aria-label={
                        alert.active ? "Pause alert" : "Resume alert"
                      }
                      aria-pressed={alert.active}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
                      style={
                        alert.active
                          ? {
                              background: "rgba(99,102,241,0.1)",
                              color: "#818cf8",
                              border: "1px solid rgba(99,102,241,0.2)",
                            }
                          : {
                              background: "rgba(255,255,255,0.04)",
                              color: "rgba(255,255,255,0.4)",
                              border: "1px solid rgba(255,255,255,0.08)",
                            }
                      }
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.opacity =
                          "0.8";
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.opacity =
                          "1";
                      }}
                    >
                      {alert.active ? (
                        <ToggleRight
                          size={14}
                          strokeWidth={1.5}
                          aria-hidden="true"
                        />
                      ) : (
                        <ToggleLeft
                          size={14}
                          strokeWidth={1.5}
                          aria-hidden="true"
                        />
                      )}
                      {alert.active ? "Active" : "Paused"}
                    </button>

                    <button
                      onClick={() => deleteAlert(alert._id)}
                      aria-label={`Delete alert for ${alert.symbol}`}
                      className="w-8 h-8 flex items-center justify-center rounded-lg transition-all opacity-0 group-hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
                      style={{
                        color: "rgba(255,255,255,0.3)",
                        border: "1px solid rgba(255,255,255,0.08)",
                      }}
                      onMouseEnter={(e) => {
                        const el = e.currentTarget as HTMLButtonElement;
                        el.style.background = "rgba(239,68,68,0.1)";
                        el.style.color = "#ef4444";
                        el.style.border = "1px solid rgba(239,68,68,0.2)";
                      }}
                      onMouseLeave={(e) => {
                        const el = e.currentTarget as HTMLButtonElement;
                        el.style.background = "transparent";
                        el.style.color = "rgba(255,255,255,0.3)";
                        el.style.border = "1px solid rgba(255,255,255,0.08)";
                      }}
                    >
                      <Trash2 size={13} strokeWidth={1.5} aria-hidden="true" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {/* Triggered alerts */}
      {triggeredAlerts.length > 0 && (
        <section aria-label="Triggered alerts">
          <div className="flex items-center justify-between mb-3">
            <h2
              className="text-sm font-semibold"
              style={{ color: "rgba(255,255,255,0.5)" }}
            >
              Triggered
              <span
                className="ml-2 px-2 py-0.5 rounded-full text-xs font-bold"
                style={{
                  background: "rgba(16,185,129,0.1)",
                  color: "#10b981",
                }}
              >
                {triggeredAlerts.length}
              </span>
            </h2>
          </div>

          <div
            className="rounded-2xl overflow-hidden"
            style={{
              background: "#0e0e10",
              border: "1px solid rgba(255,255,255,0.07)",
            }}
          >
            <ul role="list">
              {triggeredAlerts.map((alert, i) => (
                <li
                  key={alert._id}
                  className="flex items-center justify-between px-5 py-4 transition-all group"
                  style={{
                    borderBottom:
                      i < triggeredAlerts.length - 1
                        ? "1px solid rgba(255,255,255,0.04)"
                        : "none",
                    opacity: 0.65,
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLLIElement).style.opacity = "0.85";
                    (e.currentTarget as HTMLLIElement).style.background =
                      "rgba(255,255,255,0.02)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLLIElement).style.opacity = "0.65";
                    (e.currentTarget as HTMLLIElement).style.background =
                      "transparent";
                  }}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                      style={{
                        background: "rgba(16,185,129,0.1)",
                        color: "#10b981",
                      }}
                    >
                      <CheckCircle2
                        size={17}
                        strokeWidth={1.5}
                        aria-hidden="true"
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-mono text-sm font-semibold text-white">
                          {alert.symbol}
                        </span>
                        <span
                          className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                          style={{
                            background: "rgba(16,185,129,0.1)",
                            color: "#10b981",
                          }}
                        >
                          TRIGGERED
                        </span>
                      </div>
                      <p
                        className="text-xs"
                        style={{ color: "rgba(255,255,255,0.35)" }}
                      >
                        {alert.condition}{" "}
                        <span className="font-mono text-white font-medium">
                          {formatUSD(alert.targetPrice)}
                        </span>
                        {alert.notifiedAt && (
                          <span className="ml-2">
                            ·{" "}
                            <time dateTime={alert.notifiedAt}>
                              {format(
                                parseISO(alert.notifiedAt),
                                "MMM d, yyyy"
                              )}
                            </time>
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => deleteAlert(alert._id)}
                    aria-label={`Delete triggered alert for ${alert.symbol}`}
                    className="w-8 h-8 flex items-center justify-center rounded-lg transition-all opacity-0 group-hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
                    style={{
                      color: "rgba(255,255,255,0.3)",
                      border: "1px solid rgba(255,255,255,0.08)",
                    }}
                    onMouseEnter={(e) => {
                      const el = e.currentTarget as HTMLButtonElement;
                      el.style.background = "rgba(239,68,68,0.1)";
                      el.style.color = "#ef4444";
                      el.style.border = "1px solid rgba(239,68,68,0.2)";
                    }}
                    onMouseLeave={(e) => {
                      const el = e.currentTarget as HTMLButtonElement;
                      el.style.background = "transparent";
                      el.style.color = "rgba(255,255,255,0.3)";
                      el.style.border = "1px solid rgba(255,255,255,0.08)";
                    }}
                  >
                    <Trash2 size={13} strokeWidth={1.5} aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </main>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function AlertsSkeleton() {
  return (
    <div
      className="rounded-2xl p-4 space-y-3"
      style={{
        background: "#0e0e10",
        border: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      {[1, 2].map((i) => (
        <div
          key={i}
          className="h-16 rounded-xl animate-pulse"
          style={{ background: "rgba(255,255,255,0.04)" }}
        />
      ))}
    </div>
  );
}

// ─── Empty ────────────────────────────────────────────────────────────────────

function EmptyAlerts() {
  return (
    <div
      className="rounded-2xl p-14 text-center space-y-4"
      style={{
        background: "#0e0e10",
        border: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto"
        style={{ background: "rgba(99,102,241,0.1)" }}
      >
        <Bell
          size={26}
          strokeWidth={1.5}
          style={{ color: "#818cf8" }}
          aria-hidden="true"
        />
      </div>
      <div>
        <p className="text-base font-semibold text-white mb-1">
          No active alerts
        </p>
        <p className="text-sm" style={{ color: "rgba(255,255,255,0.35)" }}>
          Create an alert above to get notified when a stock hits your target
        </p>
      </div>
    </div>
  );
}