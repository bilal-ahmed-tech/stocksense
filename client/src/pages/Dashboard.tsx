import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  BriefcaseBusiness,
  ArrowUpRight,
  Plus,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { usePortfolio } from "@/hooks/usePortfolio";
import { usePerformance } from "@/hooks/usePerformance";
import { useTransactions } from "@/hooks/useTransactions";
import { useWatchlist } from "@/hooks/useWatchlist";
import { useStock } from "@/hooks/useStock";
import { useStockQuotes } from "@/hooks/useStockQuotes";
import { useUIStore } from "@/stores/useUIStore";
import { formatUSD, formatPercent } from "@/lib/formatters";
import { format, parseISO } from "date-fns";
import type { RootState } from "@/app/store";
import type { Holding, Transaction, PerformancePoint } from "@/types";
import ErrorCard from "@/components/ui/ErrorCard";

const PIE_COLORS = [
  "#4f46e5",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#06b6d4",
];

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value?: number }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  const val = payload[0]?.value;
  return (
    <div
      style={{
        background: "#18181b",
        border: "1px solid rgba(255,255,255,0.10)",
        borderRadius: 10,
        padding: "10px 14px",
        boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
        maxWidth: 160,
        pointerEvents: "none",
      }}
    >
      <p
        style={{
          color: "rgba(255,255,255,0.4)",
          marginBottom: 4,
          fontSize: 11,
        }}
      >
        {(() => {
          try {
            return format(parseISO(label ?? ""), "MMM d, yyyy");
          } catch {
            return label ?? "";
          }
        })()}
      </p>
      <p
        style={{
          color: "#10b981",
          fontWeight: 700,
          fontVariantNumeric: "tabular-nums",
          fontSize: 15,
        }}
      >
        {val != null ? formatUSD(val) : "—"}
      </p>
    </div>
  );
}

export default function Dashboard() {
  const user = useSelector((s: RootState) => s.auth.user);
  const navigate = useNavigate();
  const openModal = useUIStore((s) => s.openModal);

  const { data: portfolio, isLoading: portfolioLoading } = usePortfolio();
  const {
    data: performance,
    isLoading: perfLoading,
    isError: perfError,
    refetch: refetchPerf,
  } = usePerformance();
  const { data: transactions, isLoading: txLoading } = useTransactions();
  const { data: watchlist } = useWatchlist();

  const holdings = portfolio?.holdings ?? [];

  // ─── Live P&L calculated client-side using Finnhub prices ────────────────
  const { quotes, isLoading: quotesLoading } = useStockQuotes(holdings.map((h) => h.symbol));

  const livePortfolioValue = holdings.reduce((sum, h) => {
    const price = quotes[h.symbol]?.price ?? h.avgBuyPrice;
    return sum + price * h.shares;
  }, 0);

  const totalInvested = performance?.totalInvested ?? 0;
  const totalPnl = livePortfolioValue - totalInvested;
  const totalPnlPercent =
    totalInvested > 0 ? (totalPnl / totalInvested) * 100 : 0;
  const isPositive = totalPnl >= 0;

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 5) return "Good night";
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    if (h < 21) return "Good evening";
    return "Good night";
  };

  return (
    <div className="sm:space-y-4 lg:space-y-6 space-y-4">
      <title>Dashboard — StockSense</title>

      {/* Header */}
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-base sm:text-2xl font-bold text-white tracking-tight">
            {greeting()}, {user?.name?.split(" ")[0]}
          </h1>
          <p
            className="text-sm mt-1"
            style={{ color: "rgba(255,255,255,0.35)" }}
          >
            {isPositive
              ? "Your portfolio is up today"
              : "Market is volatile today"}
          </p>
        </div>
        <button
          onClick={() => openModal("trade")}
          className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2.5 text-sm font-semibold text-white rounded-xl transition-all active:scale-95 hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
          style={{ background: "#4f46e5" }}
        >
          <Plus size={15} strokeWidth={2.5} aria-hidden="true" />
          New Trade
        </button>
      </header>

      {/* Stat cards */}
      <section
        aria-label="Portfolio statistics"
        className="py-4 sm:py-0 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {perfError ? (
          <div className="col-span-full">
            <ErrorCard
              message="Failed to load portfolio stats."
              refetch={refetchPerf}
            />
          </div>
        ) : (
          <>
            <StatCard
              label="Portfolio Value"
              value={formatUSD(livePortfolioValue)}
              icon={<BriefcaseBusiness size={16} strokeWidth={1.5} />}
              iconBg="rgba(99,102,241,0.15)"
              iconColor="#818cf8"
              loading={perfLoading || quotesLoading}
            />
            <StatCard
              label="Total P&L"
              value={`${isPositive ? "+" : ""}${formatUSD(totalPnl)}`}
              sub={formatPercent(totalPnlPercent)}
              icon={
                isPositive ? (
                  <TrendingUp size={16} strokeWidth={1.5} />
                ) : (
                  <TrendingDown size={16} strokeWidth={1.5} />
                )
              }
              iconBg={
                isPositive ? "rgba(16,185,129,0.12)" : "rgba(239,68,68,0.12)"
              }
              iconColor={isPositive ? "#10b981" : "#ef4444"}
              valueColor={isPositive ? "#10b981" : "#ef4444"}
              loading={perfLoading || quotesLoading}
            />
            <StatCard
              label="Total Invested"
              value={formatUSD(totalInvested)}
              sub={`${performance?.totalHoldings ?? holdings.length} position${(performance?.totalHoldings ?? holdings.length) !== 1 ? "s" : ""}`}
              icon={<ArrowUpRight size={16} strokeWidth={1.5} />}
              iconBg="rgba(99,102,241,0.15)"
              iconColor="#818cf8"
              loading={perfLoading}
            />
            <StatCard
              label="Virtual Balance"
              value={formatUSD(user?.virtualBalance ?? 0)}
              sub="Available to trade"
              icon={<Wallet size={16} strokeWidth={1.5} />}
              iconBg="rgba(250,204,21,0.10)"
              iconColor="#fbbf24"
              loading={false}
            />
          </>
        )}
      </section>

      {/* Charts row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[2fr_1fr]">
        <section
          aria-label="Portfolio performance chart"
          className="rounded-2xl p-6"
          style={{
            background: "#0e0e10",
            border: "1px solid rgba(255,255,255,0.07)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div className="flex items-center justify-between mb-6">
            <span
              className="text-sm font-semibold"
              style={{ color: "rgba(255,255,255,0.55)" }}
            >
              Portfolio Performance
            </span>
          </div>
          {/* Skeleton while performance data loads */}
          {perfLoading ? (
            <div
              className="rounded-xl animate-pulse"
              style={{ height: 176, background: "rgba(255,255,255,0.04)" }}
            />
          ) : (
            <PerformanceChart chart={performance?.chart ?? []} />
          )}
        </section>

        <section
          aria-label="Asset allocation"
          className="rounded-2xl p-6"
          style={{
            background: "#0e0e10",
            border: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          <span
            className="text-sm font-semibold block mb-5"
            style={{ color: "rgba(255,255,255,0.55)" }}
          >
            Allocation
          </span>
          {/* Skeleton while portfolio loads */}
          {portfolioLoading ? (
            <div className="space-y-3">
              <div
                className="rounded-xl animate-pulse mx-auto"
                style={{
                  height: 140,
                  width: 140,
                  borderRadius: "50%",
                  background: "rgba(255,255,255,0.04)",
                }}
              />
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-4 rounded animate-pulse"
                  style={{ background: "rgba(255,255,255,0.04)" }}
                />
              ))}
            </div>
          ) : holdings.length === 0 ? (
            <div className="flex items-center justify-center h-44">
              <p
                className="text-sm"
                style={{ color: "rgba(255,255,255,0.25)" }}
              >
                No holdings
              </p>
            </div>
          ) : (
            <AllocationChart holdings={holdings} />
          )}
        </section>
      </div>

      {/* Bottom row */}
      <div className="sm:py-0 py-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
        <section
          aria-label="Watchlist"
          className="rounded-2xl p-6"
          style={{
            background: "#0e0e10",
            border: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          <div className="flex items-center justify-between mb-5">
            <span
              className="text-sm font-semibold"
              style={{ color: "rgba(255,255,255,0.55)" }}
            >
              Watchlist
            </span>
            <button
              onClick={() => navigate("/watchlist")}
              className="text-xs font-medium transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 rounded"
              style={{ color: "#818cf8" }}
            >
              View all →
            </button>
          </div>
          {!watchlist?.symbols.length ? (
            <p
              className="text-sm text-center py-10"
              style={{ color: "rgba(255,255,255,0.25)" }}
            >
              No stocks watched
            </p>
          ) : (
            <ul>
              {watchlist.symbols.slice(0, 5).map((symbol) => (
                <WatchlistRow
                  key={symbol}
                  symbol={symbol}
                  onClick={() => navigate(`/stocks/${symbol}`)}
                />
              ))}
            </ul>
          )}
        </section>

        <section
          aria-label="Recent transactions"
          className="rounded-2xl p-6"
          style={{
            background: "#0e0e10",
            border: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          <div className="flex items-center justify-between mb-5">
            <span
              className="text-sm font-semibold"
              style={{ color: "rgba(255,255,255,0.55)" }}
            >
              Recent Transactions
            </span>
            <button
              onClick={() => navigate("/portfolio")}
              className="text-xs font-medium transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 rounded"
              style={{ color: "#818cf8" }}
            >
              View all →
            </button>
          </div>
          {txLoading ? (
            <TxSkeleton />
          ) : !transactions?.length ? (
            <p
              className="text-sm text-center py-10"
              style={{ color: "rgba(255,255,255,0.25)" }}
            >
              No transactions yet
            </p>
          ) : (
            <ul>
              {transactions.slice(0, 5).map((tx) => (
                <TransactionRow key={tx._id} tx={tx} />
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  sub,
  icon,
  iconBg,
  iconColor,
  valueColor,
  loading,
}: {
  label: string;
  value: string;
  sub?: string;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  valueColor?: string;
  loading: boolean;
}) {
  return (
    <div
      className="rounded-2xl p-5 flex flex-col gap-4 transition-all duration-200 cursor-default"
      style={{
        background: "#0e0e10",
        border: "1px solid rgba(255,255,255,0.07)",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.border =
          "1px solid rgba(255,255,255,0.14)";
        (e.currentTarget as HTMLDivElement).style.background = "#111113";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.border =
          "1px solid rgba(255,255,255,0.07)";
        (e.currentTarget as HTMLDivElement).style.background = "#0e0e10";
      }}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
          {label}
        </span>
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: iconBg, color: iconColor }}
        >
          {icon}
        </div>
      </div>
      {loading ? (
        <div className="space-y-2">
          <div
            className="h-7 w-32 rounded-lg animate-pulse"
            style={{ background: "rgba(255,255,255,0.06)" }}
          />
          {sub && (
            <div
              className="h-3.5 w-20 rounded animate-pulse"
              style={{ background: "rgba(255,255,255,0.04)" }}
            />
          )}
        </div>
      ) : (
        <div>
          <p
            className="text-2xl font-bold tracking-tight font-mono"
            style={{ color: valueColor ?? "#fff" }}
          >
            {value}
          </p>
          {sub && (
            <p
              className="text-xs mt-1"
              style={{
                color: valueColor
                  ? `${valueColor}90`
                  : "rgba(255,255,255,0.3)",
              }}
            >
              {sub}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Performance Chart ────────────────────────────────────────────────────────

function PerformanceChart({ chart }: { chart: PerformancePoint[] }) {
  if (chart.length === 0) {
    return (
      <div className="flex items-center justify-center h-44">
        <p className="text-sm" style={{ color: "rgba(255,255,255,0.25)" }}>
          Make your first trade to see performance
        </p>
      </div>
    );
  }

  return (
    <div style={{ width: "100%", height: 176 }}>
      <ResponsiveContainer width="100%" height={176}>
        <AreaChart
          data={chart}
          margin={{ top: 5, right: 4, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="dashGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="date"
            tickFormatter={(v: string) => {
              try {
                return format(parseISO(v), "MMM d");
              } catch {
                return v;
              }
            }}
            tick={{ fill: "rgba(255,255,255,0.2)", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fill: "rgba(255,255,255,0.2)", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`}
            width={44}
            domain={["dataMin - 100", "dataMax + 100"]}
          />
          <Tooltip
            content={<ChartTooltip />}
            cursor={{ stroke: "rgba(255,255,255,0.06)", strokeWidth: 1 }}
            position={{ y: 0 }}
            wrapperStyle={{ zIndex: 10 }}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke="#10b981"
            strokeWidth={2}
            fill="url(#dashGrad)"
            dot={false}
            activeDot={{
              r: 5,
              fill: "#10b981",
              strokeWidth: 2,
              stroke: "#0e0e10",
            }}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─── Allocation Chart ─────────────────────────────────────────────────────────

function AllocationChart({ holdings }: { holdings: Holding[] }) {
  const data = holdings.map((h) => ({
    name: h.symbol,
    value: h.totalInvested,
  }));
  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <div className="flex flex-col gap-5">
      <div style={{ width: "100%", height: 140 }}>
        <ResponsiveContainer width="100%" height={140}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={42}
              outerRadius={62}
              dataKey="value"
              strokeWidth={0}
              isAnimationActive={false}
            >
              {data.map((_, i) => (
                <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: "#18181b",
                border: "1px solid rgba(255,255,255,0.10)",
                borderRadius: 10,
                fontSize: 12,
                color: "#fff",
              }}
              formatter={(v: unknown) => [formatUSD(v as number), "Invested"]}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <ul className="space-y-2.5">
        {data.slice(0, 5).map((item, i) => (
          <li key={item.name} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className="w-2 h-2 rounded-full shrink-0"
                style={{ background: PIE_COLORS[i % PIE_COLORS.length] }}
                aria-hidden="true"
              />
              <span
                className="font-mono text-xs"
                style={{ color: "rgba(255,255,255,0.5)" }}
              >
                {item.name}
              </span>
            </div>
            <span
              className="font-mono text-xs font-medium"
              style={{ color: "rgba(255,255,255,0.7)" }}
            >
              {total > 0
                ? `${((item.value / total) * 100).toFixed(0)}%`
                : "—"}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─── Watchlist Row ────────────────────────────────────────────────────────────

function WatchlistRow({
  symbol,
  onClick,
}: {
  symbol: string;
  onClick: () => void;
}) {
  const { data: quote, isLoading } = useStock(symbol);
  const isPositive = (quote?.changePercent ?? 0) >= 0;

  return (
    <li>
      <button
        onClick={onClick}
        className="w-full flex items-center justify-between py-3 px-3 -mx-3 rounded-xl transition-all duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 group"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background =
            "rgba(255,255,255,0.04)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background =
            "transparent";
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold transition-all group-hover:scale-105"
            style={{ background: "rgba(99,102,241,0.12)", color: "#818cf8" }}
          >
            {symbol.slice(0, 2)}
          </div>
          <div className="text-left">
            <p className="font-mono text-sm font-semibold text-white">
              {symbol}
            </p>
            <p
              className="text-xs truncate max-w-28"
              style={{ color: "rgba(255,255,255,0.3)" }}
            >
              {quote?.name?.split(" ").slice(0, 2).join(" ") ?? "—"}
            </p>
          </div>
        </div>
        {isLoading ? (
          <div
            className="w-16 h-5 rounded animate-pulse"
            style={{ background: "rgba(255,255,255,0.06)" }}
          />
        ) : quote ? (
          <div className="text-right">
            <p className="font-mono text-sm font-semibold text-white">
              {formatUSD(quote.price)}
            </p>
            <p
              className="font-mono text-xs font-medium"
              style={{ color: isPositive ? "#10b981" : "#ef4444" }}
            >
              {isPositive ? "↑" : "↓"} {formatPercent(quote.changePercent)}
            </p>
          </div>
        ) : null}
      </button>
    </li>
  );
}

// ─── Transaction Row ──────────────────────────────────────────────────────────

function TransactionRow({ tx }: { tx: Transaction }) {
  return (
    <li
      className="flex items-center justify-between py-3 px-3 -mx-3 rounded-xl transition-all duration-150 cursor-default"
      style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLLIElement).style.background =
          "rgba(255,255,255,0.04)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLLIElement).style.background = "transparent";
      }}
    >
      <div className="flex items-center gap-3">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs"
          style={
            tx.type === "BUY"
              ? { background: "rgba(16,185,129,0.1)", color: "#10b981" }
              : { background: "rgba(239,68,68,0.1)", color: "#ef4444" }
          }
        >
          {tx.type === "BUY" ? "↑" : "↓"}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <p className="font-mono text-sm font-semibold text-white">
              {tx.symbol}
            </p>
            <span
              className="text-[10px] font-bold px-1.5 py-0.5 rounded"
              style={
                tx.type === "BUY"
                  ? { background: "rgba(16,185,129,0.1)", color: "#10b981" }
                  : { background: "rgba(239,68,68,0.1)", color: "#ef4444" }
              }
            >
              {tx.type}
            </span>
          </div>
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>
            {tx.shares} shares
          </p>
        </div>
      </div>
      <div className="text-right">
        <p className="font-mono text-sm font-semibold text-white">
          {formatUSD(tx.totalValue)}
        </p>
        <time
          dateTime={tx.createdAt}
          className="text-xs"
          style={{ color: "rgba(255,255,255,0.3)" }}
        >
          {format(parseISO(tx.createdAt), "MMM d")}
        </time>
      </div>
    </li>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function TxSkeleton() {
  return (
    <ul className="space-y-3">
      {[1, 2, 3].map((i) => (
        <li
          key={i}
          className="h-12 rounded-xl animate-pulse"
          style={{ background: "rgba(255,255,255,0.04)" }}
        />
      ))}
    </ul>
  );
}