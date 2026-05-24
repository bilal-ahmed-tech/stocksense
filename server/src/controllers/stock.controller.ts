import type { Request, Response, NextFunction } from "express";
import {
  searchStocks,
  getStockQuote,
  getStockChart,
  getStockNews,
} from "../services/alphaVantage.service";

export async function search(
  req: Request,
  res: Response,
  next: NextFunction
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
  next: NextFunction
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
  next: NextFunction
): Promise<void> {
  try {
    const symbol = (req.params["symbol"] as string).toUpperCase();
    const range = (req.query["range"] as string) ?? "1M";
    const points = await getStockChart(symbol, range);
    res.json({ success: true, data: { points } });
  } catch (err) {
    next(err);
  }
}

export async function getNews(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const symbol = (req.params["symbol"] as string).toUpperCase();
    const news = await getStockNews(symbol);
    res.json({ success: true, data: { news } });
  } catch (err) {
    next(err);
  }
}