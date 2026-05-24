import type { Request, Response, NextFunction } from "express";
import { z } from "zod";
import type { AuthRequest } from "../middleware/auth.middleware";
import {
  getAlerts,
  createAlert,
  toggleAlert,
  deleteAlert,
} from "../services/alert.service";

const createAlertSchema = z.object({
  symbol: z.string().min(1).max(10),
  condition: z.enum(["ABOVE", "BELOW"]),
  targetPrice: z.number().positive(),
});

export async function getAll(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { userId } = req as AuthRequest;
    const alerts = await getAlerts(userId);
    res.json({ success: true, data: { alerts } });
  } catch (err) {
    next(err);
  }
}

export async function create(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { userId } = req as AuthRequest;
    const body = createAlertSchema.safeParse(req.body);
    if (!body.success) {
      res.status(400).json({ success: false, error: body.error.flatten().fieldErrors });
      return;
    }
    const { symbol, condition, targetPrice } = body.data;
    const alert = await createAlert(userId, symbol, condition, targetPrice);
    res.status(201).json({ success: true, data: { alert } });
  } catch (err) {
    next(err);
  }
}

export async function toggle(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { userId } = req as AuthRequest;
    const alertId = req.params["id"] as string;
    const alert = await toggleAlert(userId, alertId);
    res.json({ success: true, data: { alert } });
  } catch (err) {
    next(err);
  }
}

export async function remove(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { userId } = req as AuthRequest;
    const alertId = req.params["id"] as string;
    await deleteAlert(userId, alertId);
    res.json({ success: true, data: null });
  } catch (err) {
    next(err);
  }
}