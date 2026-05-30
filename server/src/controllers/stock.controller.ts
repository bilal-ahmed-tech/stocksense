import type { Request, Response, NextFunction } from "express";
import {
  getStockQuote,
  searchStocks,
  getStockNews,
  RateLimitError,
} from "../services/finnhub.service";
import { getStockChart } from "../services/alphaVantage.service";

export async function search(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const q = req.query.q as string | undefined;
    if (!q || q.trim().length === 0) {
      res.status(400).json({ success: false, error: "Query is required" });
      return;
    }
    const results = await searchStocks(q.trim());
    res.json({ success: true, data: { results } });
  } catch (err) {
    next(err);
  }
}

export async function getQuote(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const symbol = (req.params["symbol"] as string).toUpperCase();
    const quote = await getStockQuote(symbol);
    res.json({ success: true, data: { quote } });
  } catch (err) {
    next(err);
  }
}

export async function getChart(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const symbol = (req.params["symbol"] as string).toUpperCase();
    const range = (req.query["range"] as string) ?? "1M";

    // Alpha Vantage for chart data — Finnhub candles require paid plan
    const avPoints = await getStockChart(symbol, range);

    // Map AlphaVantage StockChartPoint → ChartCandle shape the frontend expects
    const points = avPoints.map((p) => ({
      time: p.timestamp,
      open: p.open,
      high: p.high,
      low: p.low,
      close: p.close,
      volume: p.volume,
    }));

    res.json({ success: true, data: { points } });
  } catch (err) {
    next(err);
  }
}

export async function getNews(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const symbol = (req.params["symbol"] as string).toUpperCase();
    const news = await getStockNews(symbol);
    res.json({ success: true, data: { news } });
  } catch (err) {
    next(err);
  }
}