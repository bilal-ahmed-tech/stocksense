import { useState, useEffect, useRef } from "react";
import { X, TrendingUp, TrendingDown, Minus, Plus } from "lucide-react";
import { useUIStore } from "@/stores/useUIStore";
import { useTradeStock } from "@/hooks/useTradeStock";
import { useStock } from "@/hooks/useStock";
import { useDebounce } from "@/hooks/useDebounce";
import { formatUSD } from "@/lib/formatters";
import { useSelector } from "react-redux";
import type { RootState } from "@/app/store";
import type { TradeType } from "@/types";

export default function TradeModal() {
  const { activeModal, tradeSymbol, closeModal } = useUIStore();
  const user = useSelector((s: RootState) => s.auth.user);
  const [tradeType, setTradeType] = useState<TradeType>("BUY");
  const [shares, setShares] = useState(1);
  const [symbol, setSymbol] = useState(tradeSymbol ?? "");
  const inputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  const debouncedSymbol = useDebounce(symbol, 400);
  const { data: quote, isLoading: quoteLoading } = useStock(
    debouncedSymbol.trim().toUpperCase(),
  );
  const { mutate: trade, isPending, error, reset } = useTradeStock();

  const isOpen = activeModal === "trade";

  useEffect(() => {
    if (tradeSymbol) setSymbol(tradeSymbol);
  }, [tradeSymbol]);

  useEffect(() => {
    if (!isOpen) {
      setShares(1);
      setTradeType("BUY");
      reset();
    } else {
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  }, [isOpen, reset]);

  // Lock body scroll + handle Escape + focus trap
  useEffect(() => {
    if (!isOpen) return;

    document.body.style.overflow = "hidden";

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        closeModal();
        return;
      }

      // Focus trap
      if (e.key !== "Tab" || !modalRef.current) return;

      const focusable = modalRef.current.querySelectorAll<HTMLElement>(
        'button, input, select, textarea, a[href], [tabindex]:not([tabindex="-1"])',
      );
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }

    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [isOpen, closeModal]);

  if (!isOpen) return null;

  const totalCost = quote ? shares * quote.price : 0;
  const canAfford =
    tradeType === "BUY" ? totalCost <= (user?.virtualBalance ?? 0) : true;
  const balanceAfter =
    tradeType === "BUY"
      ? (user?.virtualBalance ?? 0) - totalCost
      : (user?.virtualBalance ?? 0) + totalCost;
  const errorMessage = error instanceof Error ? error.message : null;

  function increment() {
    setShares((s) => Math.min(9999, parseFloat((s + 1).toFixed(2))));
  }

  function decrement() {
    setShares((s) => Math.max(1, parseFloat((s - 1).toFixed(2))));
  }

  function handleSharesChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = parseFloat(e.target.value);
    if (!isNaN(val) && val > 0) setShares(val);
  }

  function handleSubmit() {
    if (!quote || !quote.symbol || !quote.price || shares <= 0) return;
    trade(
      {
        symbol: quote.symbol,
        name: quote.name,
        shares,
        price: quote.price,
        type: tradeType,
      },
      { onSuccess: () => closeModal() },
    );
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40"
        style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)" }}
        aria-hidden="true"
        onClick={closeModal}
      />

      {/* Modal container */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Trade ${symbol.toUpperCase()}`}
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
        <div
          ref={modalRef}
          className="w-full sm:max-w-sm rounded-t-2xl sm:rounded-2xl flex flex-col"
          style={{
            background: "#18181b",
            border: "1px solid rgba(255,255,255,0.1)",
            boxShadow: "0 24px 80px rgba(0,0,0,0.7)",
            maxHeight: "92dvh",
            overflow: "hidden",
          }}>
          {/* Drag handle on mobile */}
          <div className="flex justify-center pt-3 pb-1 sm:hidden">
            <div
              className="w-10 h-1 rounded-full"
              style={{ background: "rgba(255,255,255,0.15)" }}
              aria-hidden="true"
            />
          </div>

          {/* Header */}
          <div
            className="flex items-center justify-between px-5 py-3.5 shrink-0"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
            <div className="flex items-center gap-2.5">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold shrink-0"
                style={{
                  background: "rgba(99,102,241,0.12)",
                  color: "#818cf8",
                }}>
                {symbol.slice(0, 2).toUpperCase() || "—"}
              </div>
              <div>
                <h2 className="text-sm font-bold text-white leading-none">
                  Place Order
                </h2>
                {quote && (
                  <p
                    className="text-[10px] mt-0.5 truncate max-w-40"
                    style={{ color: "rgba(255,255,255,0.35)" }}>
                    {quote.name}
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={closeModal}
              aria-label="Close trade modal"
              className="w-7 h-7 flex items-center justify-center rounded-lg transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
              style={{ color: "rgba(255,255,255,0.35)" }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background =
                  "rgba(255,255,255,0.07)";
                (e.currentTarget as HTMLButtonElement).style.color = "#fff";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background =
                  "transparent";
                (e.currentTarget as HTMLButtonElement).style.color =
                  "rgba(255,255,255,0.35)";
              }}>
              <X size={15} strokeWidth={1.5} aria-hidden="true" />
            </button>
          </div>

          {/* Scrollable body */}
          <div
            className="overflow-y-auto flex-1 px-5 py-4 space-y-4"
            style={{ scrollbarWidth: "none" }}>
            {/* Symbol input if no preset */}
            {!tradeSymbol && (
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="trade-symbol"
                  className="text-xs font-semibold"
                  style={{ color: "rgba(255,255,255,0.4)" }}>
                  Stock Symbol
                </label>
                <input
                  id="trade-symbol"
                  type="text"
                  value={symbol}
                  onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                  placeholder="e.g. AAPL"
                  className="px-4 py-2.5 rounded-xl text-sm font-mono text-white placeholder:text-white/20 focus:outline-none transition-all uppercase"
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
            )}

            {/* Buy / Sell toggle */}
            <div
              className="grid grid-cols-2 gap-1 p-1 rounded-xl"
              style={{ background: "rgba(255,255,255,0.05)" }}
              role="group"
              aria-label="Trade type">
              {(["BUY", "SELL"] as TradeType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => setTradeType(type)}
                  aria-pressed={tradeType === type}
                  className="flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-semibold transition-all focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-indigo-500"
                  style={
                    tradeType === type
                      ? type === "BUY"
                        ? {
                            background: "rgba(16,185,129,0.15)",
                            color: "#10b981",
                            border: "1px solid rgba(16,185,129,0.25)",
                          }
                        : {
                            background: "rgba(239,68,68,0.15)",
                            color: "#ef4444",
                            border: "1px solid rgba(239,68,68,0.25)",
                          }
                      : {
                          color: "rgba(255,255,255,0.35)",
                          border: "1px solid transparent",
                        }
                  }>
                  {type === "BUY" ? (
                    <TrendingUp
                      size={13}
                      strokeWidth={1.5}
                      aria-hidden="true"
                    />
                  ) : (
                    <TrendingDown
                      size={13}
                      strokeWidth={1.5}
                      aria-hidden="true"
                    />
                  )}
                  {type}
                </button>
              ))}
            </div>

            {/* Market price */}
            <div
              className="flex items-center justify-between px-4 py-2.5 rounded-xl"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}>
              <span
                className="text-xs"
                style={{ color: "rgba(255,255,255,0.4)" }}>
                Market Price
              </span>
              {quoteLoading ? (
                <div
                  className="w-20 h-4 rounded animate-pulse"
                  style={{ background: "rgba(255,255,255,0.08)" }}
                />
              ) : (
                <span
                  className="font-mono text-sm font-semibold text-white"
                  aria-live="polite"
                  aria-atomic="true">
                  {quote ? formatUSD(quote.price) : "—"}
                </span>
              )}
            </div>

            {/* Shares stepper */}
            <div className="flex flex-col gap-2">
              <label
                htmlFor="trade-shares"
                className="text-xs font-semibold"
                style={{ color: "rgba(255,255,255,0.4)" }}>
                Shares
              </label>
              <div
                className="flex items-center gap-2 px-2 py-1.5 rounded-xl"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}>
                <button
                  onClick={decrement}
                  aria-label="Decrease shares by 1"
                  className="w-8 h-8 flex items-center justify-center rounded-lg transition-all active:scale-90 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-indigo-500 shrink-0"
                  style={{
                    background: "rgba(255,255,255,0.07)",
                    color: "rgba(255,255,255,0.6)",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background =
                      "rgba(255,255,255,0.12)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background =
                      "rgba(255,255,255,0.07)";
                  }}>
                  <Minus size={13} strokeWidth={2} aria-hidden="true" />
                </button>
                <input
                  ref={inputRef}
                  id="trade-shares"
                  type="text"
                  min="1"
                  step="1"
                  value={shares}
                  onChange={handleSharesChange}
                  className="flex-1 bg-transparent text-center font-mono text-xl font-bold text-white focus:outline-none"
                  aria-label="Number of shares"
                />
                <button
                  onClick={increment}
                  aria-label="Increase shares by 1"
                  className="w-8 h-8 flex items-center justify-center rounded-lg transition-all active:scale-90 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-indigo-500 shrink-0"
                  style={{
                    background: "rgba(255,255,255,0.07)",
                    color: "rgba(255,255,255,0.6)",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background =
                      "rgba(255,255,255,0.12)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background =
                      "rgba(255,255,255,0.07)";
                  }}>
                  <Plus size={13} strokeWidth={2} aria-hidden="true" />
                </button>
              </div>

              {/* Quick pick */}
              <div className="grid grid-cols-4 gap-1.5">
                {[1, 5, 10, 25].map((n) => (
                  <button
                    key={n}
                    onClick={() => setShares(n)}
                    className="py-1.5 rounded-lg text-xs font-semibold transition-all focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-indigo-500"
                    style={
                      shares === n
                        ? {
                            background: "rgba(99,102,241,0.15)",
                            color: "#a5b4fc",
                            border: "1px solid rgba(99,102,241,0.3)",
                          }
                        : {
                            color: "rgba(255,255,255,0.35)",
                            border: "1px solid rgba(255,255,255,0.08)",
                          }
                    }
                    onMouseEnter={(e) => {
                      if (shares !== n) {
                        (e.currentTarget as HTMLButtonElement).style.color =
                          "rgba(255,255,255,0.65)";
                        (e.currentTarget as HTMLButtonElement).style.border =
                          "1px solid rgba(255,255,255,0.15)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (shares !== n) {
                        (e.currentTarget as HTMLButtonElement).style.color =
                          "rgba(255,255,255,0.35)";
                        (e.currentTarget as HTMLButtonElement).style.border =
                          "1px solid rgba(255,255,255,0.08)";
                      }
                    }}>
                    {n}
                  </button>
                ))}
              </div>
            </div>

            {/* Summary rows */}
            <div
              className="rounded-xl overflow-hidden"
              style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
              {[
                { label: "Shares", value: shares.toString() },
                {
                  label: "Price per share",
                  value: quote ? formatUSD(quote.price) : "—",
                },
                {
                  label: tradeType === "BUY" ? "Total cost" : "Total value",
                  value: formatUSD(totalCost),
                  warn: !canAfford && tradeType === "BUY",
                },
                {
                  label: "Balance after",
                  value: formatUSD(Math.abs(balanceAfter)),
                  color: balanceAfter < 0 ? "#ef4444" : "rgba(255,255,255,0.7)",
                },
              ].map(({ label, value, warn, color }, i, arr) => (
                <div
                  key={label}
                  className="flex items-center justify-between px-4 py-2.5"
                  style={{
                    background:
                      i % 2 === 0 ? "rgba(255,255,255,0.02)" : "transparent",
                    borderBottom:
                      i < arr.length - 1
                        ? "1px solid rgba(255,255,255,0.05)"
                        : "none",
                  }}>
                  <span
                    className="text-xs"
                    style={{ color: "rgba(255,255,255,0.4)" }}>
                    {label}
                  </span>
                  <span
                    className="font-mono text-xs font-semibold"
                    style={{ color: warn ? "#ef4444" : (color ?? "#fff") }}>
                    {value}
                  </span>
                </div>
              ))}
            </div>

            {/* Errors */}
            {(errorMessage ||
              (!canAfford && tradeType === "BUY" && totalCost > 0)) && (
              <div
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs"
                style={{
                  background: "rgba(239,68,68,0.08)",
                  border: "1px solid rgba(239,68,68,0.2)",
                  color: "#f87171",
                }}
                role="alert">
                <span aria-hidden="true">⚠</span>
                {errorMessage ?? "Insufficient balance for this trade"}
              </div>
            )}
          </div>

          {/* Footer */}
          <div
            className="px-5 py-4 shrink-0"
            style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
            <button
              onClick={handleSubmit}
              disabled={
                isPending || !quote || !quote.price || shares <= 0 || !canAfford
              }
              className="w-full py-3 rounded-xl text-sm font-bold text-white transition-all active:scale-[0.98] disabled:active:scale-100 disabled:opacity-40 hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
              style={{
                background:
                  tradeType === "BUY"
                    ? "linear-gradient(135deg,#059669,#10b981)"
                    : "linear-gradient(135deg,#dc2626,#ef4444)",
              }}>
              {isPending ? (
                <span className="flex items-center justify-center gap-2">
                  <span
                    className="w-4 h-4 rounded-full border-2 animate-spin"
                    style={{
                      borderColor: "rgba(255,255,255,0.4)",
                      borderTopColor: "transparent",
                    }}
                  />
                  Processing...
                </span>
              ) : (
                `${tradeType} ${shares} ${shares === 1 ? "Share" : "Shares"} · ${formatUSD(totalCost)}`
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
