import type { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../services/auth.service";

export interface AuthRequest extends Request {
  userId: string;
}

export function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ success: false, error: "Unauthorized" });
    return;
  }

  const token = authHeader.split(" ")[1];
  try {
    const payload = verifyAccessToken(token);
    (req as AuthRequest).userId = payload.userId;
    next();
  } catch {
    res.status(401).json({ success: false, error: "Invalid or expired token" });
  }
}