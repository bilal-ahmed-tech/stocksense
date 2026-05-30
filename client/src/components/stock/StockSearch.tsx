import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X } from "lucide-react";
import { useStockSearch } from "@/hooks/useStockSearch";
import { useDebounce } from "@/hooks/useDebounce";

export default function StockSearch() {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const debouncedQuery = useDebounce(query, 400);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { data: results, isLoading, isError } = useStockSearch(debouncedQuery);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Cmd+K to focus, Escape to close
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        setQuery("");
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  function handleSelect(symbol: string) {
    setQuery("");
    setOpen(false);
    navigate(`/stocks/${symbol}`);
  }

  function handleClear() {
    setQuery("");
    setOpen(false);
    inputRef.current?.focus();
  }

  return (
    <div ref={containerRef} className="relative w-64 sm:w-80">
      {/* Input */}
      <div
        className="flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all"
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
          size={13}
          strokeWidth={1.5}
          aria-hidden="true"
          style={{ color: "rgba(255,255,255,0.25)", flexShrink: 0 }}
        />
        <input
          ref={inputRef}
          type="text"
          // query is already uppercased in onChange — no need to toUpperCase() here
          value={query}
          onChange={(e) => {
            setQuery(e.target.value.toUpperCase());
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Search... e.g. AAPL"
          aria-label="Search stocks"
          aria-expanded={open}
          aria-haspopup="listbox"
          className="flex-1 bg-transparent text-sm text-white placeholder:text-white/25 focus:outline-none min-w-0"
        />
        {isLoading && (
          <div
            className="w-3 h-3 rounded-full border border-t-transparent shrink-0 animate-spin"
            style={{
              borderColor: "rgba(99,102,241,0.6)",
              borderTopColor: "transparent",
            }}
          />
        )}
        {query && !isLoading && (
          <button
            onClick={handleClear}
            aria-label="Clear search"
            className="shrink-0 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-indigo-500 rounded"
            style={{ color: "rgba(255,255,255,0.3)" }}
          >
            <X size={16} strokeWidth={1.5} aria-hidden="true" />
          </button>
        )}
        {!query && (
          <kbd
            className="hidden sm:flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded shrink-0"
            style={{
              background: "rgba(255,255,255,0.06)",
              color: "rgba(255,255,255,0.2)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            ⌘K
          </kbd>
        )}
      </div>

      {/* Dropdown results */}
      {open && results && results.length > 0 && (
        <div
          role="listbox"
          aria-label="Stock search results"
          className="absolute top-full left-0 right-0 mt-2 rounded-xl overflow-hidden z-50"
          style={{
            background: "#18181b",
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow: "0 16px 48px rgba(0,0,0,0.5)",
          }}
        >
          {results.slice(0, 6).map((result) => (
            <button
              key={result.symbol}
              role="option"
              aria-selected={false}
              onClick={() => handleSelect(result.symbol)}
              className="w-full flex items-center gap-3 px-4 py-3 text-left transition-all focus-visible:outline-none"
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
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0"
                style={{
                  background: "rgba(99,102,241,0.12)",
                  color: "#818cf8",
                }}
              >
                {result.symbol.slice(0, 2)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-mono text-sm font-semibold text-white">
                  {result.symbol}
                </p>
                <p
                  className="text-xs truncate"
                  style={{ color: "rgba(255,255,255,0.35)" }}
                >
                  {result.name}
                </p>
              </div>
              {/* Exchange badge — Finnhub returns this field */}
              {result.exchange && (
                <span
                  className="text-[10px] shrink-0"
                  style={{ color: "rgba(255,255,255,0.25)" }}
                >
                  {result.exchange}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* No results */}
      {open && query.trim().length >= 1 && !isLoading && results?.length === 0 && (
        <div
          className="absolute top-full left-0 right-0 mt-2 rounded-xl p-4 z-50 text-center"
          style={{
            background: "#18181b",
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow: "0 16px 48px rgba(0,0,0,0.5)",
          }}
        >
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>
            No results for "{query}"
          </p>
        </div>
      )}

      {/* Rate limit / error */}
      {isError && open && (
        <div
          className="absolute top-full left-0 right-0 mt-2 p-3 rounded-xl text-center z-50"
          style={{
            background: "#18181b",
            border: "1px solid rgba(239,68,68,0.3)",
          }}
        >
          <p className="text-xs text-red-400">
            Too many requests. Please wait a moment.
          </p>
        </div>
      )}
    </div>
  );
}