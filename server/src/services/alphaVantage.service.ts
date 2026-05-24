const BASE_URL = "https://www.alphavantage.co/query";

function getApiKey(): string {
  return process.env.ALPHA_VANTAGE_API_KEY!;
}

// ─── Rate Limit Error ─────────────────────────────────────────────────────────

export class RateLimitError extends Error {
  status = 429;
  constructor() {
    super("API rate limit reached. Please try again tomorrow.");
    this.name = "RateLimitError";
  }
}

function checkRateLimit(json: Record<string, unknown>): void {
  if (json["Information"] || json["Note"]) {
    throw new RateLimitError();
  }
}

// ─── Types ───────────────────────────────────────────────────────────────────

export interface StockQuote {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  open: number;
  high: number;
  low: number;
  volume: number;
  weekHigh52: number;
  weekLow52: number;
  marketCap: number | null;
  peRatio: number | null;
}

export interface StockSearchResult {
  symbol: string;
  name: string;
  type: string;
  region: string;
  currency: string;
}

export interface StockChartPoint {
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface StockNewsItem {
  title: string;
  url: string;
  summary: string;
  source: string;
  publishedAt: string;
  sentiment: string;
}

// ─── Cache ───────────────────────────────────────────────────────────────────

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

// ─── API Calls ───────────────────────────────────────────────────────────────

export async function searchStocks(
  query: string,
): Promise<StockSearchResult[]> {
  const cacheKey = `search:${query}`;
  const cached = getCache<StockSearchResult[]>(cacheKey);
  if (cached) return cached;

  const url = `${BASE_URL}?function=SYMBOL_SEARCH&keywords=${encodeURIComponent(query)}&apikey=${getApiKey()}`;
  const res = await fetch(url);
  const json = (await res.json()) as Record<string, unknown>;

  checkRateLimit(json);

  const matches = (json.bestMatches ?? []) as Array<{
    "1. symbol": string;
    "2. name": string;
    "3. type": string;
    "4. region": string;
    "8. currency": string;
  }>;

  const results: StockSearchResult[] = matches.map((m) => ({
    symbol: m["1. symbol"],
    name: m["2. name"],
    type: m["3. type"],
    region: m["4. region"],
    currency: m["8. currency"],
  }));

  setCache(cacheKey, results, 5 * 60 * 1000);
  return results;
}

export async function getStockQuote(symbol: string): Promise<StockQuote> {
  const cacheKey = `quote:${symbol}`;
  const cached = getCache<StockQuote>(cacheKey);
  if (cached) return cached;

  const [quoteRes, overviewRes] = await Promise.all([
    fetch(
      `${BASE_URL}?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${getApiKey()}`,
    ),
    fetch(
      `${BASE_URL}?function=OVERVIEW&symbol=${symbol}&apikey=${getApiKey()}`,
    ),
  ]);

  const quoteJson = (await quoteRes.json()) as Record<string, unknown>;
  const overviewJson = (await overviewRes.json()) as Record<string, unknown>;

  checkRateLimit(quoteJson);
  checkRateLimit(overviewJson);

  const q = quoteJson["Global Quote"] as {
    "01. symbol": string;
    "05. price": string;
    "09. change": string;
    "10. change percent": string;
    "02. open": string;
    "03. high": string;
    "04. low": string;
    "06. volume": string;
  };

  const overview = overviewJson as {
    Name?: string;
    "52WeekHigh"?: string;
    "52WeekLow"?: string;
    MarketCapitalization?: string;
    PERatio?: string;
  };

  const result: StockQuote = {
    symbol: q["01. symbol"],
    name: overview.Name ?? symbol,
    price: parseFloat(q["05. price"]),
    change: parseFloat(q["09. change"]),
    changePercent: parseFloat(q["10. change percent"]),
    open: parseFloat(q["02. open"]),
    high: parseFloat(q["03. high"]),
    low: parseFloat(q["04. low"]),
    volume: parseInt(q["06. volume"]),
    weekHigh52: parseFloat(overview["52WeekHigh"] ?? "0"),
    weekLow52: parseFloat(overview["52WeekLow"] ?? "0"),
    marketCap: overview.MarketCapitalization
      ? parseInt(overview.MarketCapitalization)
      : null,
    peRatio: overview.PERatio ? parseFloat(overview.PERatio) : null,
  };

  setCache(cacheKey, result, 60 * 1000);
  return result;
}

export async function getStockChart(
  symbol: string,
  range: string,
): Promise<StockChartPoint[]> {
  const cacheKey = `chart:${symbol}:${range}`;
  const cached = getCache<StockChartPoint[]>(cacheKey);
  if (cached) return cached;

  const isIntraday = range === "1D";
  const url = isIntraday
    ? `${BASE_URL}?function=TIME_SERIES_INTRADAY&symbol=${symbol}&interval=5min&apikey=${getApiKey()}`
    : range === "1W" || range === "1M"
      ? `${BASE_URL}?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${getApiKey()}`
      : `${BASE_URL}?function=TIME_SERIES_WEEKLY&symbol=${symbol}&apikey=${getApiKey()}`;

  const res = await fetch(url);
  const json = (await res.json()) as Record<string, unknown>;

  checkRateLimit(json);

  const key = isIntraday
    ? "Time Series (5min)"
    : range === "1W" || range === "1M"
      ? "Time Series (Daily)"
      : "Weekly Time Series";

  const series = json[key] as
    | Record<
        string,
        {
          "1. open": string;
          "2. high": string;
          "3. low": string;
          "4. close": string;
          "5. volume": string;
        }
      >
    | undefined;

  if (!series) return [];

  const limit =
    range === "1D" ? 78 : range === "1W" ? 7 : range === "1M" ? 30 : 52;

  const points: StockChartPoint[] = Object.entries(series)
    .slice(0, limit)
    .reverse()
    .map(([timestamp, values]) => ({
      timestamp,
      open: parseFloat(values["1. open"]),
      high: parseFloat(values["2. high"]),
      low: parseFloat(values["3. low"]),
      close: parseFloat(values["4. close"]),
      volume: parseInt(values["5. volume"]),
    }));

  const ttl =
    range === "1D"
      ? 5 * 60 * 1000
      : range === "1W"
        ? 30 * 60 * 1000
        : 60 * 60 * 1000;
  setCache(cacheKey, points, ttl);
  return points;
}

export async function getStockNews(symbol: string): Promise<StockNewsItem[]> {
  const cacheKey = `news:${symbol}`;
  const cached = getCache<StockNewsItem[]>(cacheKey);
  if (cached) return cached;

  const url = `${BASE_URL}?function=NEWS_SENTIMENT&tickers=${symbol}&limit=10&apikey=${getApiKey()}`;
  const res = await fetch(url);
  const json = (await res.json()) as Record<string, unknown>;

  checkRateLimit(json);

  const feed = json.feed as
    | Array<{
        title: string;
        url: string;
        summary: string;
        source: string;
        time_published: string;
        overall_sentiment_label: string;
      }>
    | undefined;

  const results: StockNewsItem[] = (feed ?? []).map((item) => ({
    title: item.title,
    url: item.url,
    summary: item.summary,
    source: item.source,
    publishedAt: item.time_published,
    sentiment: item.overall_sentiment_label,
  }));

  setCache(cacheKey, results, 15 * 60 * 1000);
  return results;
}
