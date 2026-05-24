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
  marketCap: number | null;
  peRatio: number | null;
  weekHigh52: number;
  weekLow52: number;
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
  sentiment: "Bullish" | "Bearish" | "Neutral" | "Somewhat-Bullish" | "Somewhat-Bearish";
}

export interface StockSearchResult {
  symbol: string;
  name: string;
  type: string;
  region: string;
  currency: string;
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
  totalValue: number;
  totalInvested: number;
  totalPnl: number;
  totalPnlPercent: number;
  dayChange: number;
  dayChangePercent: number;
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