import type { Request, Response, NextFunction } from "express";
import { z } from "zod";
import type { AuthRequest } from "../middleware/auth.middleware";
import {
  getOrCreatePortfolio,
  buyStock,
  sellStock,
  getTransactionHistory,
} from "../services/portfolio.service";
import { User } from "../models/User";

const tradeSchema = z.object({
  symbol: z.string().min(1).max(10),
  name: z.string().min(1),
  shares: z.number().positive(),
  price: z.number().positive(),
});

export async function getPortfolio(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { userId } = req as AuthRequest;
    const portfolio = await getOrCreatePortfolio(userId);
    res.json({ success: true, data: { portfolio } });
  } catch (err) {
    next(err);
  }
}

export async function buy(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { userId } = req as AuthRequest;
    const body = tradeSchema.safeParse(req.body);
    if (!body.success) {
      res.status(400).json({ success: false, error: body.error.flatten().fieldErrors });
      return;
    }

    const { symbol, name, shares, price } = body.data;
    const result = await buyStock(userId, symbol, name, shares, price);
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function sell(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { userId } = req as AuthRequest;
    const body = tradeSchema.safeParse(req.body);
    if (!body.success) {
      res.status(400).json({ success: false, error: body.error.flatten().fieldErrors });
      return;
    }

    const { symbol, name, shares, price } = body.data;
    const result = await sellStock(userId, symbol, name, shares, price);
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function getHistory(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { userId } = req as AuthRequest;
    const transactions = await getTransactionHistory(userId);
    res.json({ success: true, data: { transactions } });
  } catch (err) {
    next(err);
  }
}
export async function getPerformance(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { userId } = req as AuthRequest;
    const portfolio = await getOrCreatePortfolio(userId);
    const user = await User.findById(userId);

    const totalInvested = portfolio.totalInvested;
    const totalValue = portfolio.holdings.reduce((sum, h) => {
      return sum + h.shares * h.avgBuyPrice;
    }, 0);
    const totalPnl = totalValue - totalInvested;
    const totalPnlPercent =
      totalInvested > 0 ? (totalPnl / totalInvested) * 100 : 0;

    res.json({
      success: true,
      data: {
        performance: {
          totalValue,
          totalInvested,
          totalPnl,
          totalPnlPercent,
          dayChange: 0,
          dayChangePercent: 0,
          virtualBalance: user?.virtualBalance ?? 0,
          chart: [],
        },
      },
    });
  } catch (err) {
    next(err);
  }
}