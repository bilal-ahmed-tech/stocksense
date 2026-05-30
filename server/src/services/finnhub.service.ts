function getApiKey(): string {
  return process.env.FINNHUB_API_KEY!;
}
// ─── Types ────────────────────────────────────────────────────────────────────

export interface StockQuote {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  open: number;
  prevClose: number;
  volume: number;
  marketCap?: number;
  peRatio?: number;
  weekHigh52?: number;
  weekLow52?: number;
  exchange?: string;
  currency?: string;
}

export interface StockSearchResult {
  symbol: string;
  name: string;
  type: string;
  exchange: string;
}

export interface ChartCandle {
  time: string; // ISO date string "2024-01-15"
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface StockNews {
  id: string;
  headline: string;
  summary: string;
  source: string;
  url: string;
  publishedAt: string;
  image: string;
}

// ─── Custom Error ─────────────────────────────────────────────────────────────

export class RateLimitError extends Error {
  status = 429;
  constructor() {
    super("API rate limit reached. Please try again shortly.");
    this.name = "RateLimitError";
  }
}

// ─── Cache ────────────────────────────────────────────────────────────────────

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

const cache = new Map<string, CacheEntry<unknown>>();

function getCache<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }
  return entry.data as T;
}

function setCache<T>(key: string, data: T, ttlMs: number): void {
  cache.set(key, { data, expiresAt: Date.now() + ttlMs });
}

// ─── TTLs ─────────────────────────────────────────────────────────────────────

const TTL = {
  QUOTE: 60_000, // 1 min  — prices
  PROFILE: 3_600_000, // 1 hour — company info (name, market cap, P/E etc.)
  SEARCH: 300_000, // 5 min  — search results
  CHART: 300_000, // 5 min  — candle data
  NEWS: 300_000, // 5 min  — news articles
};

// ─── Base Fetcher ─────────────────────────────────────────────────────────────

const BASE = "https://finnhub.io/api/v1";

async function finnhubFetch<T>(path: string): Promise<T> {
  const url = `${BASE}${path}&token=${getApiKey()}`;

  const res = await fetch(url);

  // Finnhub returns 429 directly unlike Alpha Vantage's embedded error strings
  if (res.status === 429) throw new RateLimitError();

  if (!res.ok) {
    throw new Error(`Finnhub error: ${res.status} ${res.statusText}`);
  }

  const data = (await res.json()) as T;
  return data;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

// Finnhub candles use Unix timestamps — convert to "YYYY-MM-DD"
function unixToDateStr(unix: number): string {
  return new Date(unix * 1000).toISOString().split("T")[0];
}

// Range → { resolution, fromUnix }
function rangeToParams(range: string): { resolution: string; from: number } {
  const now = Math.floor(Date.now() / 1000);
  switch (range) {
    case "1D":
      return { resolution: "5", from: now - 86_400 }; // 5-min candles, last 24h
    case "1W":
      return { resolution: "60", from: now - 7 * 86_400 }; // 1-hour candles, last 7d
    case "1M":
      return { resolution: "D", from: now - 30 * 86_400 }; // daily, last 30d
    case "1Y":
      return { resolution: "W", from: now - 365 * 86_400 }; // weekly, last 1y
    default:
      return { resolution: "D", from: now - 30 * 86_400 };
  }
}

// News date range for company-news endpoint (last 7 days)
function newsDateRange(): { from: string; to: string } {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - 7);
  const fmt = (d: Date) => d.toISOString().split("T")[0];
  return { from: fmt(from), to: fmt(to) };
}

// ─── Finnhub Raw Response Types ───────────────────────────────────────────────

interface FinnhubQuote {
  c: number; // current price
  d: number; // change
  dp: number; // change percent
  h: number; // high
  l: number; // low
  o: number; // open
  pc: number; // previous close
}

interface FinnhubProfile {
  name: string;
  ticker: string;
  exchange: string;
  currency: string;
  marketCapitalization: number; // in millions
  shareOutstanding: number;
  logo: string;
  weburl: string;
  finnhubIndustry: string;
}

interface FinnhubMetric {
  metric: {
    "52WeekHigh": number;
    "52WeekLow": number;
    peBasicExclExtraTTM: number;
  };
}

interface FinnhubSearchResult {
  result: Array<{
    symbol: string;
    description: string;
    type: string;
    displaySymbol: string;
  }>;
}

interface FinnhubCandles {
  s: string; // "ok" or "no_data"
  t: number[]; // timestamps
  o: number[];
  h: number[];
  l: number[];
  c: number[];
  v: number[];
}

interface FinnhubNewsItem {
  id: number;
  headline: string;
  summary: string;
  source: string;
  url: string;
  datetime: number; // unix timestamp
  image: string;
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function getStockQuote(symbol: string): Promise<StockQuote> {
  const cacheKey = `quote:${symbol}`;
  const cached = getCache<StockQuote>(cacheKey);
  if (cached) return cached;

  // Fetch quote and profile in parallel — profile gives us name + market cap
  const [quote, profile, metrics] = await Promise.all([
    finnhubFetch<FinnhubQuote>(`/quote?symbol=${symbol}`),
    finnhubFetch<FinnhubProfile>(`/stock/profile2?symbol=${symbol}`).catch(
      () => null,
    ),
    finnhubFetch<FinnhubMetric>(
      `/stock/metric?symbol=${symbol}&metric=all`,
    ).catch(() => null),
  ]);

  // Finnhub returns empty object {} for unknown symbols
  if (!quote.c && quote.c !== 0) {
    throw new Error(`Symbol not found: ${symbol}`);
  }

  const result: StockQuote = {
    symbol: symbol.toUpperCase(),
    name: profile?.name || symbol,
    price: quote.c,
    change: quote.d,
    changePercent: quote.dp,
    high: quote.h,
    low: quote.l,
    open: quote.o,
    prevClose: quote.pc,
    volume: 0, // volume not in /quote — use profile data if needed
    marketCap: profile?.marketCapitalization
      ? profile.marketCapitalization * 1_000_000 // Finnhub returns in millions
      : undefined,
    peRatio: metrics?.metric?.peBasicExclExtraTTM ?? undefined,
    weekHigh52: metrics?.metric?.["52WeekHigh"] ?? undefined,
    weekLow52: metrics?.metric?.["52WeekLow"] ?? undefined,
    exchange: profile?.exchange,
    currency: profile?.currency,
  };

  setCache(cacheKey, result, TTL.QUOTE);
  return result;
}

export async function searchStocks(
  query: string,
): Promise<StockSearchResult[]> {
  if (!query.trim()) return [];

  const cacheKey = `search:${query.toLowerCase()}`;
  const cached = getCache<StockSearchResult[]>(cacheKey);
  if (cached) return cached;

  const data = await finnhubFetch<FinnhubSearchResult>(
    `/search?q=${encodeURIComponent(query)}`,
  );

  // Filter to common stock types only — removes ETFs, indices, crypto
  const results: StockSearchResult[] = (data.result || [])
    .filter((r) => r.type === "Common Stock" && !r.symbol.includes("."))
    .slice(0, 10)
    .map((r) => ({
      symbol: r.symbol,
      name: r.description,
      type: r.type,
      exchange: "",
    }));

  setCache(cacheKey, results, TTL.SEARCH);
  return results;
}

export async function getStockChart(
  symbol: string,
  range: string,
): Promise<ChartCandle[]> {
  const cacheKey = `chart:${symbol}:${range}`;
  const cached = getCache<ChartCandle[]>(cacheKey);
  if (cached) return cached;

  const { resolution, from } = rangeToParams(range);
  const to = Math.floor(Date.now() / 1000);

  const data = await finnhubFetch<FinnhubCandles>(
    `/stock/candle?symbol=${symbol}&resolution=${resolution}&from=${from}&to=${to}`,
  );
  if (data.s === "no_data" || !data.t) return [];

  const candles: ChartCandle[] = data.t.map((timestamp, i) => ({
    time: unixToDateStr(timestamp),
    open: data.o[i],
    high: data.h[i],
    low: data.l[i],
    close: data.c[i],
    volume: data.v[i],
  }));

  setCache(cacheKey, candles, TTL.CHART);
  return candles;
}

export async function getStockNews(symbol: string): Promise<StockNews[]> {
  const cacheKey = `news:${symbol}`;
  const cached = getCache<StockNews[]>(cacheKey);
  if (cached) return cached;

  const { from, to } = newsDateRange();

  const data = await finnhubFetch<FinnhubNewsItem[]>(
    `/company-news?symbol=${symbol}&from=${from}&to=${to}`,
  );

  const articles: StockNews[] = (data || [])
    .filter((n) => n.headline && n.url)
    .slice(0, 10)
    .map((n) => ({
      id: String(n.id),
      headline: n.headline,
      summary: n.summary || "",
      source: n.source,
      url: n.url,
      publishedAt: new Date(n.datetime * 1000).toISOString(),
      image: n.image || "",
    }));

  setCache(cacheKey, articles, TTL.NEWS);
  return articles;
}

// Used by pricePoller.ts — fetches just the price for a symbol (lightweight)
export async function getLivePrice(symbol: string): Promise<{
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
}> {
  // Don't use quote cache here — poller needs fresh prices
  const data = await finnhubFetch<FinnhubQuote>(`/quote?symbol=${symbol}`);

  return {
    symbol: symbol.toUpperCase(),
    price: data.c,
    change: data.d,
    changePercent: data.dp,
  };
}
