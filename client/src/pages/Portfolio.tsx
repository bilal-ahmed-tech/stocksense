import { useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  TrendingUp,
  TrendingDown,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Receipt,
  BriefcaseBusiness,
  ExternalLink,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { usePortfolio } from "@/hooks/usePortfolio";
import { useTransactions } from "@/hooks/useTransactions";
import { useStockQuotes } from "@/hooks/useStockQuotes";
import { useFilterStore } from "@/stores/useFilterStore";
import { useUIStore } from "@/stores/useUIStore";
import { formatUSD, formatPercent } from "@/lib/formatters";
import type { RootState } from "@/app/store";
import type { Holding, StockQuote } from "@/types";
import type { SortColumn } from "@/stores/useFilterStore";
import ErrorCard from "@/components/ui/ErrorCard";

type Tab = "holdings" | "transactions";

export default function Portfolio() {
  const [activeTab, setActiveTab] = useState<Tab>("holdings");
  const user = useSelector((s: RootState) => s.auth.user);
  const navigate = useNavigate();
  const {
    data: portfolio,
    isLoading,
    isError: portfolioError,
    refetch: refetchPortfolio,
  } = usePortfolio();
  const {
    data: transactions,
    isLoading: txLoading,
    isError: txError,
    refetch: refetchTx,
  } = useTransactions();
  const { sortColumn, sortDirection, filter, toggleSort, setFilter } =
    useFilterStore();
  const openModal = useUIStore((s) => s.openModal);

  return (
    <main className="space-y-6">
      <title>Portfolio — StockSense</title>

      {/* Header */}
      <header className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Portfolio
          </h1>
          <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.35)" }}>
            Virtual balance:{" "}
            <span className="font-mono font-semibold" style={{ color: "#a5b4fc" }}>
              {formatUSD(user?.virtualBalance ?? 0)}
            </span>
          </p>
        </div>
        <button
          onClick={() => openModal("trade")}
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white rounded-xl transition-all active:scale-95 hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
          style={{ background: "#4f46e5" }}
        >
          <TrendingUp size={15} strokeWidth={2} aria-hidden="true" />
          New Trade
        </button>
      </header>

      {/* Tabs */}
      <div
        role="tablist"
        aria-label="Portfolio sections"
        className="flex gap-1 p-1 rounded-xl w-fit"
        style={{
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.07)",
        }}
      >
        {(
          [
            { id: "holdings", label: "Holdings", icon: BriefcaseBusiness },
            { id: "transactions", label: "Transactions", icon: Receipt },
          ] as const
        ).map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            role="tab"
            aria-selected={activeTab === id}
            aria-controls={`${id}-panel`}
            onClick={() => setActiveTab(id)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
            style={
              activeTab === id
                ? { background: "#4f46e5", color: "#fff" }
                : { color: "rgba(255,255,255,0.4)" }
            }
            onMouseEnter={(e) => {
              if (activeTab !== id)
                (e.currentTarget as HTMLButtonElement).style.color =
                  "rgba(255,255,255,0.7)";
            }}
            onMouseLeave={(e) => {
              if (activeTab !== id)
                (e.currentTarget as HTMLButtonElement).style.color =
                  "rgba(255,255,255,0.4)";
            }}
          >
            <Icon size={14} strokeWidth={1.5} aria-hidden="true" />
            {label}
          </button>
        ))}
      </div>

      {/* Holdings panel */}
      {activeTab === "holdings" && (
        <section id="holdings-panel" role="tabpanel" aria-label="Holdings">
          {!portfolioError && (
            <div className="flex items-center gap-2 mb-4">
              {(["all", "gain", "loss"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
                  style={
                    filter === f
                      ? f === "gain"
                        ? {
                            background: "rgba(16,185,129,0.12)",
                            color: "#10b981",
                            border: "1px solid rgba(16,185,129,0.25)",
                          }
                        : f === "loss"
                          ? {
                              background: "rgba(239,68,68,0.12)",
                              color: "#ef4444",
                              border: "1px solid rgba(239,68,68,0.25)",
                            }
                          : {
                              background: "rgba(99,102,241,0.12)",
                              color: "#a5b4fc",
                              border: "1px solid rgba(99,102,241,0.25)",
                            }
                      : {
                          color: "rgba(255,255,255,0.35)",
                          border: "1px solid rgba(255,255,255,0.08)",
                        }
                  }
                  onMouseEnter={(e) => {
                    if (filter !== f) {
                      (e.currentTarget as HTMLButtonElement).style.color =
                        "rgba(255,255,255,0.65)";
                      (e.currentTarget as HTMLButtonElement).style.border =
                        "1px solid rgba(255,255,255,0.15)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (filter !== f) {
                      (e.currentTarget as HTMLButtonElement).style.color =
                        "rgba(255,255,255,0.35)";
                      (e.currentTarget as HTMLButtonElement).style.border =
                        "1px solid rgba(255,255,255,0.08)";
                    }
                  }}
                >
                  {f === "all" ? "All" : f === "gain" ? "Gainers" : "Losers"}
                </button>
              ))}
            </div>
          )}

          {isLoading && !portfolioError ? (
            <HoldingsSkeleton />
          ) : portfolioError ? (
            <ErrorCard
              message="Failed to load holdings."
              refetch={refetchPortfolio}
            />
          ) : !portfolio?.holdings.length ? (
            <EmptyHoldings onBuy={() => openModal("trade")} />
          ) : (
            <HoldingsTable
              holdings={portfolio.holdings}
              sortColumn={sortColumn}
              sortDirection={sortDirection}
              filter={filter}
              onSort={toggleSort}
              onTrade={(symbol) => openModal("trade", symbol)}
              onView={(symbol) => navigate(`/stocks/${symbol}`)}
            />
          )}
        </section>
      )}

      {/* Transactions panel */}
      {activeTab === "transactions" && (
        <section
          id="transactions-panel"
          role="tabpanel"
          aria-label="Transaction history"
        >
          {txLoading && !txError ? (
            <TransactionsSkeleton />
          ) : txError ? (
            <ErrorCard
              message="Failed to load transactions."
              refetch={refetchTx}
            />
          ) : !transactions?.length ? (
            <div
              className="rounded-2xl p-12 text-center"
              style={{
                background: "#0e0e10",
                border: "1px solid rgba(255,255,255,0.07)",
              }}
            >
              <p className="text-sm" style={{ color: "rgba(255,255,255,0.3)" }}>
                No transactions yet
              </p>
            </div>
          ) : (
            <div
              className="rounded-2xl"
              style={{
                background: "#0e0e10",
                border: "1px solid rgba(255,255,255,0.07)",
                overflowX: "auto",
                scrollbarWidth: "none",
              }}
            >
              <table
                className="hidden sm:table w-full text-sm"
                style={{ minWidth: 560 }}
              >
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                    {["Type", "Symbol", "Shares", "Price", "Total", "Date"].map(
                      (h, i) => (
                        <th
                          key={h}
                          scope="col"
                          className="px-5 py-3.5 text-xs font-semibold"
                          style={{
                            color: "rgba(255,255,255,0.3)",
                            textAlign: i >= 2 ? "right" : "left",
                          }}
                        >
                          {h}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx) => (
                    <tr
                      key={tx._id}
                      className="transition-all"
                      style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLTableRowElement).style.background =
                          "rgba(255,255,255,0.025)";
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLTableRowElement).style.background =
                          "transparent";
                      }}
                    >
                      <td className="px-5 py-3.5">
                        <span
                          className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-lg"
                          style={
                            tx.type === "BUY"
                              ? { background: "rgba(16,185,129,0.1)", color: "#10b981" }
                              : { background: "rgba(239,68,68,0.1)", color: "#ef4444" }
                          }
                        >
                          {tx.type === "BUY" ? (
                            <TrendingUp size={10} strokeWidth={2} aria-hidden="true" />
                          ) : (
                            <TrendingDown size={10} strokeWidth={2} aria-hidden="true" />
                          )}
                          {tx.type}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="font-mono text-sm font-semibold text-white">
                          {tx.symbol}
                        </span>
                      </td>
                      <td
                        className="px-5 py-3.5 text-right font-mono text-sm"
                        style={{ color: "rgba(255,255,255,0.6)" }}
                      >
                        {tx.shares}
                      </td>
                      <td
                        className="px-5 py-3.5 text-right font-mono text-sm"
                        style={{ color: "rgba(255,255,255,0.6)" }}
                      >
                        {formatUSD(tx.priceAtTime)}
                      </td>
                      <td className="px-5 py-3.5 text-right font-mono text-sm font-semibold text-white">
                        {formatUSD(tx.totalValue)}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <time
                          dateTime={tx.createdAt}
                          className="text-xs"
                          style={{ color: "rgba(255,255,255,0.35)" }}
                        >
                          {format(parseISO(tx.createdAt), "MMM d, yyyy")}
                        </time>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Mobile cards */}
              <div
                className="sm:hidden divide-y"
                style={{ borderColor: "rgba(255,255,255,0.06)" }}
              >
                {transactions.map((tx) => (
                  <div key={tx._id} className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-lg"
                          style={
                            tx.type === "BUY"
                              ? { background: "rgba(16,185,129,0.1)", color: "#10b981" }
                              : { background: "rgba(239,68,68,0.1)", color: "#ef4444" }
                          }
                        >
                          {tx.type === "BUY" ? (
                            <TrendingUp size={10} strokeWidth={2} aria-hidden="true" />
                          ) : (
                            <TrendingDown size={10} strokeWidth={2} aria-hidden="true" />
                          )}
                          {tx.type}
                        </span>
                        <span className="font-mono text-sm font-semibold text-white">
                          {tx.symbol}
                        </span>
                      </div>
                      <time
                        dateTime={tx.createdAt}
                        className="text-xs"
                        style={{ color: "rgba(255,255,255,0.35)" }}
                      >
                        {format(parseISO(tx.createdAt), "MMM d, yyyy")}
                      </time>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <p className="text-xs mb-0.5" style={{ color: "rgba(255,255,255,0.3)" }}>
                          Shares
                        </p>
                        <p className="font-mono text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>
                          {tx.shares}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs mb-0.5" style={{ color: "rgba(255,255,255,0.3)" }}>
                          Price
                        </p>
                        <p className="font-mono text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>
                          {formatUSD(tx.priceAtTime)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs mb-0.5" style={{ color: "rgba(255,255,255,0.3)" }}>
                          Total
                        </p>
                        <p className="font-mono text-sm font-semibold text-white">
                          {formatUSD(tx.totalValue)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      )}
    </main>
  );
}

// ─── Holdings Table ────────────────────────────────────────────────────────────

function HoldingsTable({
  holdings,
  sortColumn,
  sortDirection,
  filter,
  onSort,
  onTrade,
  onView,
}: {
  holdings: Holding[];
  sortColumn: SortColumn;
  sortDirection: "asc" | "desc";
  filter: "all" | "gain" | "loss";
  onSort: (col: SortColumn) => void;
  onTrade: (symbol: string) => void;
  onView: (symbol: string) => void;
}) {
  const COLS: { col: SortColumn; label: string; align: "left" | "right" }[] = [
    { col: "symbol", label: "Symbol", align: "left" },
    { col: "shares", label: "Shares", align: "right" },
    { col: "avgBuyPrice", label: "Avg Cost", align: "right" },
    { col: "currentPrice", label: "Current", align: "right" },
    { col: "pnl", label: "P&L", align: "right" },
    { col: "value", label: "Value", align: "right" },
  ];

  const symbols = holdings.map((h) => h.symbol);
  const { quotes, errors } = useStockQuotes(symbols);

  const enriched = holdings.map((h) => {
    const livePrice = quotes[h.symbol]?.price;
    const currentPrice = livePrice ?? h.avgBuyPrice;
    const currentValue = currentPrice * h.shares;
    const pnl = currentValue - h.totalInvested;
    const pnlPercent = h.totalInvested > 0 ? (pnl / h.totalInvested) * 100 : 0;
    return { ...h, currentPrice, currentValue, pnl, pnlPercent };
  });

  const filtered = enriched.filter((h) => {
    if (filter === "gain") return h.pnl >= 0;
    if (filter === "loss") return h.pnl < 0;
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    let aVal: number | string = 0;
    let bVal: number | string = 0;

    switch (sortColumn) {
      case "symbol":
        aVal = a.symbol;
        bVal = b.symbol;
        break;
      case "shares":
        aVal = a.shares;
        bVal = b.shares;
        break;
      case "avgBuyPrice":
        aVal = a.avgBuyPrice;
        bVal = b.avgBuyPrice;
        break;
      case "currentPrice":
        aVal = a.currentPrice;
        bVal = b.currentPrice;
        break;
      case "pnl":
      case "pnlPercent":
        aVal = a.pnl;
        bVal = b.pnl;
        break;
      case "value":
        aVal = a.currentValue;
        bVal = b.currentValue;
        break;
    }

    if (typeof aVal === "string" && typeof bVal === "string") {
      return sortDirection === "asc"
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal);
    }

    return sortDirection === "asc"
      ? (aVal as number) - (bVal as number)
      : (bVal as number) - (aVal as number);
  });

  return (
    <div
      className="rounded-2xl"
      style={{
        background: "#0e0e10",
        border: "1px solid rgba(255,255,255,0.07)",
        overflowX: "auto",
        overflowY: "hidden",
        scrollbarWidth: "none",
      }}
    >
      {sorted.length === 0 ? (
        <div className="p-12 text-center">
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.25)" }}>
            No {filter === "gain" ? "gainers" : "losers"} in your portfolio
          </p>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <table
            className="hidden lg:table w-full text-sm"
            style={{ minWidth: 640 }}
          >
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                {COLS.map(({ col, label, align }) => (
                  <th
                    key={col}
                    scope="col"
                    className="px-5 py-3.5"
                    style={{ textAlign: align }}
                  >
                    <button
                      onClick={() => onSort(col)}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-indigo-500 rounded"
                      style={{
                        color:
                          sortColumn === col
                            ? "#a5b4fc"
                            : "rgba(255,255,255,0.3)",
                      }}
                      aria-label={`Sort by ${label}`}
                    >
                      {label}
                      {sortColumn === col ? (
                        sortDirection === "asc" ? (
                          <ArrowUp size={11} strokeWidth={2} aria-hidden="true" />
                        ) : (
                          <ArrowDown size={11} strokeWidth={2} aria-hidden="true" />
                        )
                      ) : (
                        <ArrowUpDown size={11} strokeWidth={1.5} aria-hidden="true" />
                      )}
                    </button>
                  </th>
                ))}
                <th
                  scope="col"
                  className="px-5 py-3.5 text-right text-xs font-semibold"
                  style={{ color: "rgba(255,255,255,0.3)" }}
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((holding) => (
                <HoldingRow
                  key={holding.symbol}
                  holding={holding}
                  quote={quotes[holding.symbol]}
                  quoteError={errors[holding.symbol]}
                  onTrade={onTrade}
                  onView={onView}
                />
              ))}
            </tbody>
          </table>

          {/* Mobile cards */}
          <div
            className="lg:hidden divide-y"
            style={{ borderColor: "rgba(255,255,255,0.06)" }}
          >
            {sorted.map((holding) => (
              <HoldingCard
                key={holding.symbol}
                holding={holding}
                quote={quotes[holding.symbol]}
                quoteError={errors[holding.symbol]}
                onTrade={onTrade}
                onView={onView}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Holding Row (desktop) ────────────────────────────────────────────────────

function HoldingRow({
  holding,
  quote,
  quoteError,
  onTrade,
  onView,
}: {
  holding: Holding;
  quote: StockQuote | undefined;
  quoteError: boolean;
  onTrade: (symbol: string) => void;
  onView: (symbol: string) => void;
}) {
  const currentPrice = quote?.price ?? holding.avgBuyPrice;
  const currentValue = currentPrice * holding.shares;
  const pnl = currentValue - holding.totalInvested;
  const pnlPercent = (pnl / holding.totalInvested) * 100;
  const isPos = pnl >= 0;

  return (
    <tr
      className="transition-all group"
      style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLTableRowElement).style.background =
          "rgba(255,255,255,0.025)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLTableRowElement).style.background = "transparent";
      }}
    >
      <td className="px-3 py-4">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 transition-transform group-hover:scale-105"
            style={{ background: "rgba(99,102,241,0.1)", color: "#818cf8" }}
          >
            {holding.symbol.slice(0, 2)}
          </div>
          <div>
            <p className="font-mono font-semibold text-white">{holding.symbol}</p>
            <p className="text-xs truncate max-w-28" style={{ color: "rgba(255,255,255,0.3)" }}>
              {holding.name}
            </p>
          </div>
        </div>
      </td>
      <td className="px-5 py-4 text-right font-mono text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>
        {holding.shares}
      </td>
      <td className="px-5 py-4 text-right font-mono text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>
        {formatUSD(holding.avgBuyPrice)}
      </td>
      <td className="px-5 py-4 text-right font-mono text-sm font-semibold text-white">
        {quote
          ? formatUSD(currentPrice)
          : quoteError
            ? formatUSD(holding.avgBuyPrice)
            : <Shimmer />}
      </td>
      <td className="px-5 py-4 text-right">
        {quote ? (
          <div>
            <p
              className="font-mono text-sm font-semibold flex items-center justify-end gap-1"
              style={{ color: isPos ? "#10b981" : "#ef4444" }}
            >
              {isPos
                ? <TrendingUp size={12} strokeWidth={2} aria-hidden="true" />
                : <TrendingDown size={12} strokeWidth={2} aria-hidden="true" />
              }
              {isPos ? "+" : ""}
              {formatUSD(pnl)}
            </p>
            <p
              className="font-mono text-xs"
              style={{ color: isPos ? "#10b981" : "#ef4444", opacity: 0.75 }}
            >
              {formatPercent(pnlPercent)}
            </p>
          </div>
        ) : quoteError ? (
          <span className="text-xs" style={{ color: "rgba(255,255,255,0.25)" }}>—</span>
        ) : (
          <Shimmer />
        )}
      </td>
      <td className="px-5 py-4 text-right font-mono text-sm font-semibold text-white">
        {quote
          ? formatUSD(currentValue)
          : quoteError
            ? <span style={{ color: "rgba(255,255,255,0.25)" }}>—</span>
            : <Shimmer />}
      </td>
      <td className="px-5 py-4">
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => onView(holding.symbol)}
            aria-label={`View ${holding.symbol} details`}
            className="w-8 h-8 flex items-center justify-center rounded-lg transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
            style={{ color: "rgba(255,255,255,0.3)", border: "1px solid rgba(255,255,255,0.08)" }}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLButtonElement;
              el.style.background = "rgba(255,255,255,0.06)";
              el.style.color = "#fff";
              el.style.border = "1px solid rgba(255,255,255,0.15)";
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLButtonElement;
              el.style.background = "transparent";
              el.style.color = "rgba(255,255,255,0.3)";
              el.style.border = "1px solid rgba(255,255,255,0.08)";
            }}
          >
            <ExternalLink size={13} strokeWidth={1.5} aria-hidden="true" />
          </button>
          <button
            onClick={() => onTrade(holding.symbol)}
            aria-label={`Trade ${holding.symbol}`}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg transition-all active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
            style={{ background: "rgba(99,102,241,0.12)", color: "#a5b4fc", border: "1px solid rgba(99,102,241,0.2)" }}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLButtonElement;
              el.style.background = "#4f46e5";
              el.style.color = "#fff";
              el.style.border = "1px solid #4f46e5";
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLButtonElement;
              el.style.background = "rgba(99,102,241,0.12)";
              el.style.color = "#a5b4fc";
              el.style.border = "1px solid rgba(99,102,241,0.2)";
            }}
          >
            Trade
          </button>
        </div>
      </td>
    </tr>
  );
}

// ─── Holding Card (mobile) ────────────────────────────────────────────────────

function HoldingCard({
  holding,
  quote,
  quoteError,
  onTrade,
  onView,
}: {
  holding: Holding;
  quote: StockQuote | undefined;
  quoteError: boolean;
  onTrade: (symbol: string) => void;
  onView: (symbol: string) => void;
}) {
  const currentPrice = quote?.price ?? holding.avgBuyPrice;
  const currentValue = currentPrice * holding.shares;
  const pnl = currentValue - holding.totalInvested;
  const pnlPercent = (pnl / holding.totalInvested) * 100;
  const isPos = pnl >= 0;

  return (
    <div className="p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold shrink-0"
            style={{ background: "rgba(99,102,241,0.1)", color: "#818cf8" }}
          >
            {holding.symbol.slice(0, 2)}
          </div>
          <div>
            <p className="font-mono font-semibold text-white">{holding.symbol}</p>
            <p className="text-xs truncate max-w-32" style={{ color: "rgba(255,255,255,0.3)" }}>
              {holding.name}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onView(holding.symbol)}
            aria-label={`View ${holding.symbol} details`}
            className="w-8 h-8 flex items-center justify-center rounded-lg transition-all"
            style={{ color: "rgba(255,255,255,0.3)", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            <ExternalLink size={13} strokeWidth={1.5} aria-hidden="true" />
          </button>
          <button
            onClick={() => onTrade(holding.symbol)}
            aria-label={`Trade ${holding.symbol}`}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg transition-all active:scale-95"
            style={{ background: "rgba(99,102,241,0.12)", color: "#a5b4fc", border: "1px solid rgba(99,102,241,0.2)" }}
          >
            Trade
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 pt-1">
        <div>
          <p className="text-xs mb-0.5" style={{ color: "rgba(255,255,255,0.3)" }}>Shares</p>
          <p className="font-mono text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>{holding.shares}</p>
        </div>
        <div>
          <p className="text-xs mb-0.5" style={{ color: "rgba(255,255,255,0.3)" }}>Avg Cost</p>
          <p className="font-mono text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>{formatUSD(holding.avgBuyPrice)}</p>
        </div>
        <div>
          <p className="text-xs mb-0.5" style={{ color: "rgba(255,255,255,0.3)" }}>Current Price</p>
          <p className="font-mono text-sm font-semibold text-white">
            {quote
              ? formatUSD(currentPrice)
              : quoteError
                ? formatUSD(holding.avgBuyPrice)
                : <Shimmer />}
          </p>
        </div>
        <div>
          <p className="text-xs mb-0.5" style={{ color: "rgba(255,255,255,0.3)" }}>Value</p>
          <p className="font-mono text-sm font-semibold text-white">
            {quote
              ? formatUSD(currentValue)
              : quoteError
                ? <span style={{ color: "rgba(255,255,255,0.25)" }}>—</span>
                : <Shimmer />}
          </p>
        </div>
        <div className="col-span-2">
          <p className="text-xs mb-0.5" style={{ color: "rgba(255,255,255,0.3)" }}>P&L</p>
          {quote ? (
            <div className="flex items-center gap-1.5">
              <p
                className="font-mono text-sm font-semibold flex items-center gap-1"
                style={{ color: isPos ? "#10b981" : "#ef4444" }}
              >
                {isPos
                  ? <TrendingUp size={12} strokeWidth={2} aria-hidden="true" />
                  : <TrendingDown size={12} strokeWidth={2} aria-hidden="true" />
                }
                {isPos ? "+" : ""}
                {formatUSD(pnl)}
              </p>
              <p className="font-mono text-xs" style={{ color: isPos ? "#10b981" : "#ef4444", opacity: 0.75 }}>
                ({formatPercent(pnlPercent)})
              </p>
            </div>
          ) : quoteError ? (
            <span className="text-xs" style={{ color: "rgba(255,255,255,0.25)" }}>—</span>
          ) : (
            <Shimmer />
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Shimmer ──────────────────────────────────────────────────────────────────

function Shimmer() {
  return (
    <span
      className="inline-block w-16 h-4 rounded-md animate-pulse"
      style={{ background: "rgba(255,255,255,0.06)" }}
    />
  );
}

// ─── Skeletons ────────────────────────────────────────────────────────────────

function HoldingsSkeleton() {
  return (
    <div
      className="rounded-2xl p-5 space-y-3"
      style={{ background: "#0e0e10", border: "1px solid rgba(255,255,255,0.07)" }}
    >
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="h-14 rounded-xl animate-pulse"
          style={{ background: "rgba(255,255,255,0.04)" }}
        />
      ))}
    </div>
  );
}

function TransactionsSkeleton() {
  return (
    <div
      className="rounded-2xl p-5 space-y-3"
      style={{ background: "#0e0e10", border: "1px solid rgba(255,255,255,0.07)" }}
    >
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="h-12 rounded-xl animate-pulse"
          style={{ background: "rgba(255,255,255,0.04)" }}
        />
      ))}
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyHoldings({ onBuy }: { onBuy: () => void }) {
  return (
    <div
      className="rounded-2xl p-16 text-center space-y-5"
      style={{ background: "#0e0e10", border: "1px solid rgba(255,255,255,0.07)" }}
    >
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto"
        style={{ background: "rgba(99,102,241,0.1)" }}
      >
        <BriefcaseBusiness
          size={26}
          strokeWidth={1.5}
          style={{ color: "#818cf8" }}
          aria-hidden="true"
        />
      </div>
      <div>
        <p className="text-base font-semibold text-white mb-1">No holdings yet</p>
        <p className="text-sm" style={{ color: "rgba(255,255,255,0.35)" }}>
          Search for a stock and make your first trade
        </p>
      </div>
      <button
        onClick={onBuy}
        className="px-5 py-2.5 text-sm font-semibold text-white rounded-xl transition-all active:scale-95 hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
        style={{ background: "#4f46e5" }}
      >
        Start trading
      </button>
    </div>
  );
}