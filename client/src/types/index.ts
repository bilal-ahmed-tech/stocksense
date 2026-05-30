export interface User {
  _id: string;
  name: string;
  email: string;
  avatar: string | null;
  virtualBalance: number;
  createdAt: string;
}

export interface Holding {
  symbol: string;
  name: string;
  shares: number;
  avgBuyPrice: number;
  totalInvested: number;
}

export interface Portfolio {
  _id: string;
  userId: string;
  holdings: Holding[];
  totalInvested: number;
  createdAt: string;
  updatedAt: string;
}

export interface EnrichedHolding extends Holding {
  currentPrice: number;
  currentValue: number;
  pnl: number;
  pnlPercent: number;
}

export type TradeType = "BUY" | "SELL";

export interface Transaction {
  _id: string;
  userId: string;
  symbol: string;
  name: string;
  type: TradeType;
  shares: number;
  priceAtTime: number;
  totalValue: number;
  createdAt: string;
}

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
  marketCap?: number;
  peRatio?: number;
  weekHigh52?: number;
  weekLow52?: number;
  exchange?: string;
  currency?: string;
}

// Finnhub candle shape — field is "time" not "timestamp"
export interface StockChartPoint {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

// Finnhub news shape — field is "headline" not "title"
// sentiment not provided by Finnhub — optional for backwards compat
export interface StockNewsItem {
  id: string;
  headline: string;
  summary: string;
  source: string;
  url: string;
  publishedAt: string;
  image: string;
  sentiment?:
    | "Bullish"
    | "Bearish"
    | "Neutral"
    | "Somewhat-Bullish"
    | "Somewhat-Bearish";
}

// Finnhub search shape — "exchange" replaces "region" + "currency"
export interface StockSearchResult {
  symbol: string;
  name: string;
  type: string;
  exchange: string;
}

export interface Watchlist {
  _id: string;
  userId: string;
  symbols: string[];
}

export type AlertCondition = "ABOVE" | "BELOW";

export interface Alert {
  _id: string;
  userId: string;
  symbol: string;
  condition: AlertCondition;
  targetPrice: number;
  active: boolean;
  triggered: boolean;
  notifiedAt: string | null;
  createdAt: string;
}

export interface ApiSuccess<T> {
  success: true;
  data: T;
}

export interface ApiError {
  success: false;
  error: string;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

export interface PerformancePoint {
  date: string;
  value: number;
}

export interface PortfolioPerformance {
  totalInvested: number;
  currentBalance: number;
  totalHoldings: number;
  chart: PerformancePoint[];
}

export interface PriceUpdatePayload {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
}

export interface AlertTriggeredPayload {
  alertId: string;
  symbol: string;
  price: number;
}
