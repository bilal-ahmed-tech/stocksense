import type { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../services/auth.service";
import { User } from "../models/User";

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

export async function requireVerifiedEmail(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { userId } = req as AuthRequest;
    const user = await User.findById(userId).select("emailVerified");
    if (!user) {
      res.status(404).json({ success: false, error: "User not found" });
      return;
    }
    // Treat missing emailVerified as true for legacy accounts
    if (user.emailVerified === false) {
      res.status(403).json({
        success: false,
        error: "Please verify your email before using this feature",
      });
      return;
    }
    next();
  } catch (err) {
    next(err);
  }
}
