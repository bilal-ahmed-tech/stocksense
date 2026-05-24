import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  BookmarkPlus,
  BookmarkCheck,
  ExternalLink,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { format, parseISO } from "date-fns";
import { useStock } from "@/hooks/useStock";
import { useStockChart } from "@/hooks/useStockChart";
import { useStockNews } from "@/hooks/useStockNews";
import {
  useWatchlist,
  useAddToWatchlist,
  useRemoveFromWatchlist,
} from "@/hooks/useWatchlist";
import { useChartStore } from "@/stores/useChartStore";
import { useUIStore } from "@/stores/useUIStore";
import { useSelector } from "react-redux";
import type { RootState } from "@/app/store";
import {
  formatUSD,
  formatPercent,
  formatVolume,
  formatCompact,
} from "@/lib/formatters";
import type { Timeframe } from "@/stores/useChartStore";
import ErrorCard from "@/components/ui/ErrorCard";

const TIMEFRAMES: Timeframe[] = ["1D", "1W", "1M", "1Y"];

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
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: 10,
        padding: "8px 12px",
        boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
      }}>
      <p
        style={{
          color: "rgba(255,255,255,0.4)",
          fontSize: 11,
          marginBottom: 3,
        }}>
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
          fontSize: 14,
        }}>
        {val != null ? formatUSD(val) : "—"}
      </p>
    </div>
  );
}

export default function StockDetail() {
  const { symbol = "" } = useParams<{ symbol: string }>();
  const navigate = useNavigate();
  const isAuthenticated = useSelector((s: RootState) => s.auth.isAuthenticated);
  const { timeframe, setTimeframe } = useChartStore();
  const openModal = useUIStore((s) => s.openModal);
  const { data: quote, isLoading: quoteLoading, isError: quoteError, refetch: refetchQuote } = useStock(symbol);

  const {
    data: chartPoints,
    isLoading: chartLoading,
    isError: chartError,
  } = useStockChart(symbol, timeframe);
  const { data: news, isLoading: newsLoading } = useStockNews(symbol);
  const { data: watchlist } = useWatchlist();
  const { mutate: addToWatchlist, isPending: adding } = useAddToWatchlist();
  const { mutate: removeFromWatchlist, isPending: removing } =
    useRemoveFromWatchlist();

  const isWatched = watchlist?.symbols.includes(symbol.toUpperCase()) ?? false;
  const isPositive = (quote?.changePercent ?? 0) >= 0;

  const chartData = (chartPoints ?? []).map((p) => ({
    time: p.timestamp,
    price: p.close,
  }));

  function handleWatchlist() {
    if (isWatched) removeFromWatchlist(symbol);
    else addToWatchlist(symbol);
  }

  if (quoteLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-4 animate-pulse">
        <div
          className="h-8 w-32 rounded-xl"
          style={{ background: "rgba(255,255,255,0.06)" }}
        />
        <div
          className="h-36 rounded-2xl"
          style={{ background: "rgba(255,255,255,0.04)" }}
        />
        <div
          className="h-72 rounded-2xl"
          style={{ background: "rgba(255,255,255,0.04)" }}
        />
      </div>
    );
  }

  if (quoteError) {
    return (
      <div className="max-w-4xl mx-auto pt-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm font-medium mb-6 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 rounded-lg transition-colors"
          style={{ color: "rgba(255,255,255,0.4)" }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.color = "#fff";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.color =
              "rgba(255,255,255,0.4)";
          }}>
          <ArrowLeft size={15} strokeWidth={1.5} aria-hidden="true" />
          Back
        </button>
        <ErrorCard
          message="Failed to load stock data. This may be due to an API rate limit."
          refetch={refetchQuote}
        />
      </div>
    );
  }

  if (!quote) {
    return (
      <div className="max-w-4xl mx-auto flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
          Stock not found
        </p>
        <button
          onClick={() => navigate(-1)}
          className="text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 rounded"
          style={{ color: "#818cf8" }}>
          Go back
        </button>
      </div>
    );
  }

  return (
    <article className="max-w-4xl mx-auto space-y-4">
      <title>
        {quote.symbol} — {quote.name} | StockSense
      </title>

      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        aria-label="Go back"
        className="flex items-center gap-1.5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 rounded-lg"
        style={{ color: "rgba(255,255,255,0.4)" }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.color = "#fff";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.color =
            "rgba(255,255,255,0.4)";
        }}>
        <ArrowLeft size={15} strokeWidth={1.5} aria-hidden="true" />
        Back
      </button>

      {/* Stock header */}
      <section
        aria-label="Stock overview"
        className="rounded-2xl p-5 sm:p-6"
        style={{
          background: "#0e0e10",
          border: "1px solid rgba(255,255,255,0.07)",
        }}>
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-5">
          {/* Left — name + price */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shrink-0"
                style={{
                  background: "rgba(99,102,241,0.12)",
                  color: "#818cf8",
                }}>
                {quote.symbol.slice(0, 2)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className="text-xs font-bold font-mono px-2 py-0.5 rounded-lg"
                    style={{
                      background: "rgba(99,102,241,0.12)",
                      color: "#818cf8",
                    }}>
                    {quote.symbol}
                  </span>
                </div>
                <h1 className="text-lg font-bold text-white mt-0.5">
                  {quote.name}
                </h1>
              </div>
            </div>

            <div className="flex items-end gap-3">
              <span className="font-mono text-4xl font-black text-white tracking-tight">
                {formatUSD(quote.price)}
              </span>
              <div
                className="flex items-center gap-1.5 mb-1.5"
                style={{ color: isPositive ? "#10b981" : "#ef4444" }}
                aria-label={`Change: ${isPositive ? "+" : ""}${formatUSD(quote.change)} (${formatPercent(quote.changePercent)})`}>
                {isPositive ? (
                  <TrendingUp size={16} strokeWidth={2} aria-hidden="true" />
                ) : (
                  <TrendingDown size={16} strokeWidth={2} aria-hidden="true" />
                )}
                <span className="font-mono text-sm font-semibold">
                  {isPositive ? "+" : ""}
                  {formatUSD(quote.change)}
                </span>
                <span
                  className="font-mono text-sm"
                  style={{
                    color: isPositive
                      ? "rgba(16,185,129,0.7)"
                      : "rgba(239,68,68,0.7)",
                  }}>
                  ({formatPercent(quote.changePercent)})
                </span>
              </div>
            </div>
          </div>

          {/* Right — actions */}
          {isAuthenticated && (
            <div className="flex gap-2 sm:flex-col sm:items-end">
              <button
                onClick={handleWatchlist}
                disabled={adding || removing}
                aria-label={
                  isWatched ? "Remove from watchlist" : "Add to watchlist"
                }
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 disabled:opacity-50"
                style={
                  isWatched
                    ? {
                        background: "rgba(99,102,241,0.12)",
                        color: "#a5b4fc",
                        border: "1px solid rgba(99,102,241,0.25)",
                      }
                    : {
                        color: "rgba(255,255,255,0.5)",
                        border: "1px solid rgba(255,255,255,0.1)",
                      }
                }
                onMouseEnter={(e) => {
                  if (!isWatched) {
                    (e.currentTarget as HTMLButtonElement).style.background =
                      "rgba(255,255,255,0.05)";
                    (e.currentTarget as HTMLButtonElement).style.color = "#fff";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isWatched) {
                    (e.currentTarget as HTMLButtonElement).style.background =
                      "transparent";
                    (e.currentTarget as HTMLButtonElement).style.color =
                      "rgba(255,255,255,0.5)";
                  }
                }}>
                {isWatched ? (
                  <BookmarkCheck
                    size={15}
                    strokeWidth={1.5}
                    aria-hidden="true"
                  />
                ) : (
                  <BookmarkPlus
                    size={15}
                    strokeWidth={1.5}
                    aria-hidden="true"
                  />
                )}
                {isWatched ? "Watching" : "Add to Watchlist"}
              </button>

              <button
                onClick={() => openModal("trade", symbol)}
                aria-label={`Trade ${quote.symbol}`}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all active:scale-95 hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
                style={{ background: "#4f46e5" }}>
                <TrendingUp size={15} strokeWidth={1.5} aria-hidden="true" />
                Trade
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Chart */}
      <section
        aria-label="Price chart"
        className="rounded-2xl p-5 sm:p-6"
        style={{
          background: "#0e0e10",
          border: "1px solid rgba(255,255,255,0.07)",
        }}>
        <div className="flex items-center justify-between mb-5">
          <h2
            className="text-sm font-semibold"
            style={{ color: "rgba(255,255,255,0.5)" }}>
            Price History
          </h2>
          <div
            role="tablist"
            aria-label="Chart timeframe"
            className="flex gap-1 p-1 rounded-xl"
            style={{ background: "rgba(255,255,255,0.05)" }}>
            {TIMEFRAMES.map((tf) => (
              <button
                key={tf}
                role="tab"
                aria-selected={timeframe === tf}
                onClick={() => setTimeframe(tf)}
                className="px-3 py-1 rounded-lg text-xs font-semibold transition-all focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-indigo-500"
                style={
                  timeframe === tf
                    ? { background: "#4f46e5", color: "#fff" }
                    : { color: "rgba(255,255,255,0.35)" }
                }
                onMouseEnter={(e) => {
                  if (timeframe !== tf)
                    (e.currentTarget as HTMLButtonElement).style.color =
                      "rgba(255,255,255,0.7)";
                }}
                onMouseLeave={(e) => {
                  if (timeframe !== tf)
                    (e.currentTarget as HTMLButtonElement).style.color =
                      "rgba(255,255,255,0.35)";
                }}>
                {tf}
              </button>
            ))}
          </div>
        </div>

        {chartLoading ? (
          <div
            className="rounded-xl animate-pulse"
            style={{ height: 220, background: "rgba(255,255,255,0.04)" }}
          />
        ) : chartError || chartData.length === 0 ? (
          <div
            className="flex items-center justify-center rounded-xl"
            style={{ height: 220 }}>
            <p className="text-sm" style={{ color: "rgba(255,255,255,0.25)" }}>
              {chartError ? "Chart unavailable" : "No chart data available"}
            </p>
          </div>
        ) : chartData.length === 0 ? (
          <div
            className="flex items-center justify-center rounded-xl"
            style={{ height: 220 }}>
            <p className="text-sm" style={{ color: "rgba(255,255,255,0.25)" }}>
              No chart data available
            </p>
          </div>
        ) : (
          <div
            aria-label={`${quote.symbol} price chart over ${timeframe}`}
            style={{ width: "100%", height: 220 }}>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart
                data={chartData}
                margin={{ top: 5, right: 4, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="stockGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor={isPositive ? "#10b981" : "#ef4444"}
                      stopOpacity={0.2}
                    />
                    <stop
                      offset="95%"
                      stopColor={isPositive ? "#10b981" : "#ef4444"}
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="time"
                  tickFormatter={(v: string) => {
                    try {
                      return format(
                        parseISO(v),
                        timeframe === "1D" ? "HH:mm" : "MMM d",
                      );
                    } catch {
                      return v;
                    }
                  }}
                  tick={{ fill: "rgba(255,255,255,0.2)", fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis
                  dataKey="price"
                  tick={{ fill: "rgba(255,255,255,0.2)", fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v: number) => `$${v.toFixed(0)}`}
                  width={52}
                  domain={["dataMin - 5", "dataMax + 5"]}
                />
                <Tooltip
                  content={<ChartTooltip />}
                  cursor={{
                    stroke: "rgba(255,255,255,0.06)",
                    strokeWidth: 1,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="price"
                  stroke={isPositive ? "#10b981" : "#ef4444"}
                  strokeWidth={2}
                  fill="url(#stockGrad)"
                  dot={false}
                  activeDot={{
                    r: 5,
                    fill: isPositive ? "#10b981" : "#ef4444",
                    strokeWidth: 2,
                    stroke: "#0e0e10",
                  }}
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>

      {/* Key stats */}
      <section
        aria-label="Key statistics"
        className="rounded-2xl p-5 sm:p-6"
        style={{
          background: "#0e0e10",
          border: "1px solid rgba(255,255,255,0.07)",
        }}>
        <h2
          className="text-sm font-semibold mb-4"
          style={{ color: "rgba(255,255,255,0.5)" }}>
          Key Statistics
        </h2>
        <dl className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Open", value: formatUSD(quote.open) },
            { label: "High", value: formatUSD(quote.high) },
            { label: "Low", value: formatUSD(quote.low) },
            { label: "Volume", value: formatVolume(quote.volume) },
            { label: "52W High", value: formatUSD(quote.weekHigh52) },
            { label: "52W Low", value: formatUSD(quote.weekLow52) },
            {
              label: "Market Cap",
              value: quote.marketCap ? formatCompact(quote.marketCap) : "N/A",
            },
            {
              label: "P/E Ratio",
              value: quote.peRatio ? quote.peRatio.toFixed(2) : "N/A",
            },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="flex flex-col gap-1.5 p-3 rounded-xl"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.05)",
              }}>
              <dt
                className="text-[10px] font-semibold uppercase tracking-wider"
                style={{ color: "rgba(255,255,255,0.3)" }}>
                {label}
              </dt>
              <dd className="font-mono text-sm font-semibold text-white">
                {value}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      {/* News */}
      <section
        aria-label="Latest news"
        className="rounded-2xl p-5 sm:p-6"
        style={{
          background: "#0e0e10",
          border: "1px solid rgba(255,255,255,0.07)",
        }}>
        <h2
          className="text-sm font-semibold mb-4"
          style={{ color: "rgba(255,255,255,0.5)" }}>
          Latest News
        </h2>

        {newsLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-20 rounded-xl animate-pulse"
                style={{ background: "rgba(255,255,255,0.04)" }}
              />
            ))}
          </div>
        ) : !news || news.length === 0 ? (
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.3)" }}>
            No news available
          </p>
        ) : (
          <ul className="space-y-2">
            {news.map((item, i) => (
              <li key={i}>
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-start gap-4 p-4 rounded-xl transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
                  style={{ border: "1px solid rgba(255,255,255,0.06)" }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.background =
                      "rgba(255,255,255,0.03)";
                    (e.currentTarget as HTMLAnchorElement).style.border =
                      "1px solid rgba(255,255,255,0.1)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.background =
                      "transparent";
                    (e.currentTarget as HTMLAnchorElement).style.border =
                      "1px solid rgba(255,255,255,0.06)";
                  }}>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 mb-1.5">
                      <h3 className="text-sm font-semibold text-white group-hover:text-indigo-300 transition-colors line-clamp-2 leading-snug">
                        {item.title}
                      </h3>
                      <div className="flex items-center gap-2 shrink-0">
                        <SentimentBadge sentiment={item.sentiment} />
                        <ExternalLink
                          size={12}
                          strokeWidth={1.5}
                          style={{ color: "rgba(255,255,255,0.2)" }}
                          aria-hidden="true"
                        />
                      </div>
                    </div>
                    <p
                      className="text-xs line-clamp-2 mb-2 leading-relaxed"
                      style={{ color: "rgba(255,255,255,0.35)" }}>
                      {item.summary}
                    </p>
                    <div
                      className="flex items-center gap-1.5 text-xs"
                      style={{ color: "rgba(255,255,255,0.25)" }}>
                      <span>{item.source}</span>
                      <span aria-hidden="true">·</span>
                      <time dateTime={item.publishedAt}>
                        {formatNewsDate(item.publishedAt)}
                      </time>
                    </div>
                  </div>
                </a>
              </li>
            ))}
          </ul>
        )}
      </section>
    </article>
  );
}

// ─── Sentiment Badge ──────────────────────────────────────────────────────────

function SentimentBadge({ sentiment }: { sentiment: string }) {
  const map: Record<string, { label: string; bg: string; color: string }> = {
    Bullish: { label: "Bullish", bg: "rgba(16,185,129,0.1)", color: "#10b981" },
    "Somewhat-Bullish": {
      label: "Bullish",
      bg: "rgba(16,185,129,0.1)",
      color: "#10b981",
    },
    Bearish: { label: "Bearish", bg: "rgba(239,68,68,0.1)", color: "#ef4444" },
    "Somewhat-Bearish": {
      label: "Bearish",
      bg: "rgba(239,68,68,0.1)",
      color: "#ef4444",
    },
    Neutral: {
      label: "Neutral",
      bg: "rgba(255,255,255,0.07)",
      color: "rgba(255,255,255,0.4)",
    },
  };

  const config = map[sentiment] ?? {
    label: sentiment,
    bg: "rgba(255,255,255,0.07)",
    color: "rgba(255,255,255,0.4)",
  };

  return (
    <span
      className="text-[9px] font-bold px-2 py-0.5 rounded-full shrink-0"
      style={{ background: config.bg, color: config.color }}>
      {config.label}
    </span>
  );
}

// ─── Date formatter ───────────────────────────────────────────────────────────

function formatNewsDate(dateStr: string): string {
  try {
    const year = dateStr.slice(0, 4);
    const month = dateStr.slice(4, 6);
    const day = dateStr.slice(6, 8);
    return format(new Date(`${year}-${month}-${day}`), "MMM d, yyyy");
  } catch {
    return dateStr;
  }
}
