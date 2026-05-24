import type { Request, Response, NextFunction } from "express";
import type { AuthRequest } from "../middleware/auth.middleware";
import {
  getOrCreateWatchlist,
  addToWatchlist,
  removeFromWatchlist,
} from "../services/watchlist.service";

export async function getWatchlist(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { userId } = req as AuthRequest;
    const watchlist = await getOrCreateWatchlist(userId);
    res.json({ success: true, data: { watchlist } });
  } catch (err) {
    next(err);
  }
}

export async function addSymbol(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { userId } = req as AuthRequest;
    const symbol = req.params["symbol"] as string;
    const watchlist = await addToWatchlist(userId, symbol);
    res.json({ success: true, data: { watchlist } });
  } catch (err) {
    next(err);
  }
}

export async function removeSymbol(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { userId } = req as AuthRequest;
    const symbol = req.params["symbol"] as string;
    const watchlist = await removeFromWatchlist(userId, symbol);
    res.json({ success: true, data: { watchlist } });
  } catch (err) {
    next(err);
  }
}