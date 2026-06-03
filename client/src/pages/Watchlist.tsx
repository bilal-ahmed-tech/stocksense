import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  X,
  TrendingUp,
  TrendingDown,
  Plus,
  Trash2,
  LineChart,
} from "lucide-react";
import {
  useWatchlist,
  useAddToWatchlist,
  useRemoveFromWatchlist,
} from "@/hooks/useWatchlist";
import { useStockSearch } from "@/hooks/useStockSearch";
import { useStock } from "@/hooks/useStock";
import { useDebounce } from "@/hooks/useDebounce";
import { formatUSD, formatPercent } from "@/lib/formatters";
import ErrorCard from "@/components/ui/ErrorCard";

// Types
interface StockSearchResult {
  symbol: string;
  name: string;
}

interface IconProps {
  size?: number;
  strokeWidth?: number;
  className?: string;
}

export default function Watchlist() {
  const [query, setQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const debouncedQuery = useDebounce(query, 400);
  const navigate = useNavigate();

  const {
    data: watchlist,
    isLoading,
    isError: watchlistError,
    refetch: refetchWatchlist,
  } = useWatchlist();
  const { data: searchResults, isLoading: searching } = useStockSearch(debouncedQuery);
  const { mutate: addSymbol, isPending: adding } = useAddToWatchlist();
  const { mutate: removeSymbol } = useRemoveFromWatchlist();

  function handleAdd(symbol: string) {
    addSymbol(symbol, {
      onSuccess: () => {
        setQuery("");
        setShowResults(false);
      },
    });
  }

  return (
    <main className="space-y-6">
      <title>Watchlist — StockSense</title>

      {/* Header */}
      <header className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Watchlist
          </h1>
          <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.35)" }}>
            {watchlist?.symbols.length
              ? `Tracking ${watchlist.symbols.length} stock${watchlist.symbols.length !== 1 ? "s" : ""}`
              : "Track stocks you are interested in"}
          </p>
        </div>
      </header>

      {/* Search */}
      <section aria-label="Add stock to watchlist">
        <div className="relative">
          <div
            className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
            onFocusCapture={(e) => {
              (e.currentTarget as HTMLDivElement).style.border =
                "1px solid rgba(99,102,241,0.5)";
              (e.currentTarget as HTMLDivElement).style.background =
                "rgba(255,255,255,0.06)";
            }}
            onBlurCapture={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget)) {
                (e.currentTarget as HTMLDivElement).style.border =
                  "1px solid rgba(255,255,255,0.08)";
                (e.currentTarget as HTMLDivElement).style.background =
                  "rgba(255,255,255,0.04)";
              }
            }}
          >
            <Search
              size={15}
              strokeWidth={1.5}
              aria-hidden="true"
              style={{ color: "rgba(255,255,255,0.25)", flexShrink: 0 }}
            />
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value.toUpperCase());
                setShowResults(true);
              }}
              onFocus={() => setShowResults(true)}
              onBlur={() => setTimeout(() => setShowResults(false), 200)}
              placeholder="Search stocks to add..."
              aria-label="Search stocks"
              aria-expanded={showResults}
              aria-haspopup="listbox"
              className="flex-1 bg-transparent text-sm text-white placeholder:text-white/20 focus:outline-none "
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
            {query && !searching && (
              <button
                onClick={() => {
                  setQuery("");
                  setShowResults(false);
                }}
                aria-label="Clear search"
                className="shrink-0 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-indigo-500 rounded"
                style={{ color: "rgba(255,255,255,0.3)" }}
              >
                <X size={18} strokeWidth={1.5} aria-hidden="true" />
              </button>
            )}
          </div>

          {/* Search results dropdown */}
          {showResults && searchResults && searchResults.length > 0 && (
            <div
              role="listbox"
              aria-label="Search results"
              className="absolute top-full left-0 right-0 mt-2 rounded-xl overflow-hidden z-10"
              style={{
                background: "#18181b",
                border: "1px solid rgba(255,255,255,0.08)",
                boxShadow: "0 16px 48px rgba(0,0,0,0.6)",
              }}
            >
              {searchResults.slice(0, 6).map((result: StockSearchResult) => {
                const isWatched = watchlist?.symbols?.includes(result.symbol) ?? false;
                return (
                  <SearchResultItem
                    key={result.symbol}
                    symbol={result.symbol}
                    name={result.name}
                    isWatched={isWatched}
                    onAdd={() => handleAdd(result.symbol)}
                    adding={adding}
                  />
                );
              })}
            </div>
          )}

          {/* No results */}
          {showResults &&
            debouncedQuery.trim().length >= 1 &&
            !searching &&
            searchResults?.length === 0 && (
              <div
                className="absolute top-full left-0 right-0 mt-2 rounded-xl p-5 z-10 text-center"
                style={{
                  background: "#18181b",
                  border: "1px solid rgba(255,255,255,0.08)",
                  boxShadow: "0 16px 48px rgba(0,0,0,0.6)",
                }}
              >
                <p className="text-sm" style={{ color: "rgba(255,255,255,0.3)" }}>
                  No results for "{debouncedQuery}"
                </p>
              </div>
            )}
        </div>
      </section>

      {/* Watchlist */}
      <section aria-label="Watched stocks">
        {isLoading ? (
          <WatchlistSkeleton />
        ) : watchlistError ? (
          <ErrorCard
            message="Failed to load your watchlist."
            refetch={refetchWatchlist}
          />
        ) : !watchlist?.symbols.length ? (
          <EmptyWatchlist />
        ) : (
          <div
            className="rounded-2xl overflow-hidden"
            style={{
              background: "#0e0e10",
              border: "1px solid rgba(255,255,255,0.07)",
            }}
          >
            {/* Table header */}
            <div
              className="grid items-center px-5 py-3.5"
              style={{
                gridTemplateColumns: "1fr 120px 130px 40px",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              {[
                { label: "Stock", align: "left" },
                { label: "Price", align: "right" },
                { label: "Change", align: "right" },
                { label: "", align: "right" },
              ].map(({ label, align }) => (
                <span
                  key={label}
                  className="text-xs font-semibold"
                  style={{
                    color: "rgba(255,255,255,0.3)",
                    textAlign: align as "left" | "right",
                  }}
                >
                  {label}
                </span>
              ))}
            </div>

            <ul role="list">
              {watchlist.symbols.map((symbol: string, i: number) => (
                <WatchlistItem
                  key={symbol}
                  symbol={symbol}
                  isLast={i === watchlist.symbols.length - 1}
                  onRemove={() => removeSymbol(symbol)}
                  onClick={() => navigate(`/stocks/${symbol}`)}
                />
              ))}
            </ul>
          </div>
        )}
      </section>
    </main>
  );
}

// ─── Search Result Item (with price) ─────────────────────────────────────────

interface SearchResultItemProps {
  symbol: string;
  name: string;
  isWatched: boolean;
  onAdd: () => void;
  adding: boolean;
}

function SearchResultItem({
  symbol,
  name,
  isWatched,
  onAdd,
  adding,
}: SearchResultItemProps) {
  const { data: quote, isLoading: quoteLoading } = useStock(symbol);
  const isPositive = (quote?.changePercent ?? 0) >= 0;

  return (
    <button
      role="option"
      aria-selected={isWatched}
      onClick={() => !isWatched && onAdd()}
      disabled={adding || isWatched}
      className="w-full flex items-center gap-3 px-4 py-3 text-left transition-all focus-visible:outline-none disabled:cursor-default hover:bg-white/5"
      style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
    >
      {/* Symbol icon */}
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold shrink-0"
        style={{
          background: "rgba(99,102,241,0.12)",
          color: "#818cf8",
        }}
      >
        {symbol.slice(0, 2)}
      </div>

      {/* Stock info */}
      <div className="flex-1 min-w-0">
        <p className="font-mono text-sm font-semibold text-white">
          {symbol}
        </p>
        <p
          className="text-xs truncate"
          style={{ color: "rgba(255,255,255,0.35)" }}
        >
          {name}
        </p>
      </div>

      {/* Price and change */}
      <div className="shrink-0 text-right">
        {quoteLoading ? (
          <div
            className="h-8 w-24 rounded-lg animate-pulse"
            style={{ background: "rgba(255,255,255,0.06)" }}
          />
        ) : quote ? (
          <>
            <p className="font-mono text-sm font-semibold text-white">
              {formatUSD(quote.price)}
            </p>
            <div className="flex items-center gap-1 justify-end">
              {isPositive ? (
                <TrendingUp size={10} strokeWidth={2} style={{ color: "#10b981" }} />
              ) : (
                <TrendingDown size={10} strokeWidth={2} style={{ color: "#ef4444" }} />
              )}
              <span
                className="text-xs font-mono"
                style={{ color: isPositive ? "#10b981" : "#ef4444" }}
              >
                {formatPercent(quote.changePercent)}
              </span>
            </div>
          </>
        ) : (
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>
            No data
          </p>
        )}
      </div>

      {/* Add/Watching button */}
      <div className="shrink-0 w-16 text-right">
        {isWatched ? (
          <span
            className="text-xs font-semibold inline-flex items-center gap-1"
            style={{ color: "#818cf8" }}
          >
            <Check size={12} strokeWidth={2} />
            Watching
          </span>
        ) : (
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center ml-auto transition-all hover:scale-105"
            style={{
              background: "rgba(99,102,241,0.12)",
              color: "#818cf8",
            }}
          >
            {adding ? (
              <div
                className="w-3 h-3 rounded-full border-2 border-t-transparent animate-spin"
                style={{
                  borderColor: "#818cf8",
                  borderTopColor: "transparent",
                }}
              />
            ) : (
              <Plus size={14} strokeWidth={2} aria-hidden="true" />
            )}
          </div>
        )}
      </div>
    </button>
  );
}

// ─── Watchlist Item ───────────────────────────────────────────────────────────

interface WatchlistItemProps {
  symbol: string;
  isLast: boolean;
  onRemove: () => void;
  onClick: () => void;
}

function WatchlistItem({
  symbol,
  isLast,
  onRemove,
  onClick,
}: WatchlistItemProps) {
  const { data: quote, isLoading } = useStock(symbol);
  const isPositive = (quote?.changePercent ?? 0) >= 0;

  return (
    <li
      className="group grid items-center px-5 py-4 transition-all hover:bg-white/5"
      style={{
        gridTemplateColumns: "1fr 120px 130px 40px",
        borderBottom: isLast ? "none" : "1px solid rgba(255,255,255,0.04)",
      }}
    >
      {/* Stock info */}
      <button
        onClick={onClick}
        aria-label={`View ${symbol} details`}
        className="flex items-center gap-3 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 rounded-xl"
      >
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 transition-transform group-hover:scale-105"
          style={{ background: "rgba(99,102,241,0.1)", color: "#818cf8" }}
        >
          {symbol.slice(0, 2)}
        </div>
        <div>
          <p className="font-mono text-sm font-semibold text-white">{symbol}</p>
          <p
            className="text-xs truncate max-w-40"
            style={{ color: "rgba(255,255,255,0.3)" }}
          >
            {quote?.name ?? "—"}
          </p>
        </div>
      </button>

      {/* Price */}
      <div className="text-right">
        {isLoading ? (
          <div
            className="h-4 w-20 rounded-md animate-pulse ml-auto"
            style={{ background: "rgba(255,255,255,0.06)" }}
          />
        ) : (
          <p className="font-mono text-sm font-semibold text-white">
            {quote ? formatUSD(quote.price) : "—"}
          </p>
        )}
      </div>

      {/* Change */}
      <div className="text-right">
        {isLoading ? (
          <div
            className="h-4 w-16 rounded-md animate-pulse ml-auto"
            style={{ background: "rgba(255,255,255,0.06)" }}
          />
        ) : quote ? (
          <div>
            <p
              className="font-mono text-sm font-semibold flex items-center justify-end gap-1"
              style={{ color: isPositive ? "#10b981" : "#ef4444" }}
            >
              {isPositive ? (
                <TrendingUp size={12} strokeWidth={2} aria-hidden="true" />
              ) : (
                <TrendingDown size={12} strokeWidth={2} aria-hidden="true" />
              )}
              {formatPercent(quote.changePercent)}
            </p>
            <p
              className="font-mono text-xs"
              style={{
                color: isPositive ? "#10b981" : "#ef4444",
                opacity: 0.65,
              }}
            >
              {isPositive ? "+" : ""}
              {formatUSD(quote.change)}
            </p>
          </div>
        ) : null}
      </div>

      {/* Remove */}
      <div className="flex justify-end">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          aria-label={`Remove ${symbol} from watchlist`}
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
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function WatchlistSkeleton() {
  return (
    <div
      className="rounded-2xl p-4 space-y-3"
      style={{
        background: "#0e0e10",
        border: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      {[1, 2, 3, 4].map((i) => (
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

function EmptyWatchlist() {
  return (
    <div
      className="rounded-2xl p-16 text-center space-y-5"
      style={{
        background: "#0e0e10",
        border: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto"
        style={{ background: "rgba(99,102,241,0.1)" }}
      >
        <LineChart
          size={26}
          strokeWidth={1.5}
          style={{ color: "#818cf8" }}
          aria-hidden="true"
        />
      </div>
      <div>
        <p className="text-base font-semibold text-white mb-1">
          No stocks watched
        </p>
        <p className="text-sm" style={{ color: "rgba(255,255,255,0.35)" }}>
          Search above to add stocks to your watchlist
        </p>
      </div>
    </div>
  );
}

// ─── Helper Components ────────────────────────────────────────────────────────

function Check({ size = 16, strokeWidth = 2, className = "" }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}