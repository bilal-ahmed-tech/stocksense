import type { Request, Response, NextFunction } from "express";
import { z } from "zod";
import {
  registerUser,
  loginUser,
  refreshAccessToken,
  logoutUser,
  sanitizeUser,
} from "../services/auth.service";
import { User } from "../models/User";
import { Portfolio } from "../models/Portfolio";
import { Transaction } from "../models/Transaction";
import { Watchlist } from "../models/Watchlist";
import type { AuthRequest } from "../middleware/auth.middleware";
import { Alert } from "../models/Alert";
const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" as const : "strict" as const,
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

const registerSchema = z.object({
  name: z.string().min(2).max(50),
  email: z.string().email(),
  password: z.string().min(8),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function register(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const body = registerSchema.safeParse(req.body);
    if (!body.success) {
      res.status(400).json({
        success: false,
        error: body.error.flatten().fieldErrors,
      });
      return;
    }

    const { name, email, password } = body.data;
    const { user, accessToken, refreshToken } = await registerUser(
      name,
      email,
      password,
    );

    res.cookie("refreshToken", refreshToken, REFRESH_COOKIE_OPTIONS);
    res.status(201).json({ success: true, data: { user, accessToken } });
  } catch (err) {
    next(err);
  }
}

export async function login(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const body = loginSchema.safeParse(req.body);
    if (!body.success) {
      res.status(400).json({
        success: false,
        error: body.error.flatten().fieldErrors,
      });
      return;
    }

    const { email, password } = body.data;
    const { user, accessToken, refreshToken } = await loginUser(
      email,
      password,
    );

    res.cookie("refreshToken", refreshToken, REFRESH_COOKIE_OPTIONS);
    res.status(200).json({ success: true, data: { user, accessToken } });
  } catch (err) {
    next(err);
  }
}

export async function refresh(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const token = req.cookies.refreshToken as string | undefined;
    if (!token) {
      res.status(401).json({ success: false, error: "No refresh token" });
      return;
    }

    const { accessToken } = await refreshAccessToken(token);
    res.status(200).json({ success: true, data: { accessToken } });
  } catch (err) {
    next(err);
  }
}

export async function logout(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const token = req.cookies.refreshToken as string | undefined;
    if (token) await logoutUser(token);

    res.clearCookie("refreshToken", REFRESH_COOKIE_OPTIONS);
    res.status(200).json({ success: true, data: null });
  } catch (err) {
    next(err);
  }
}

export async function getMe(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = (req as Request & { userId?: string }).userId;
    const user = await User.findById(userId).select("-password -refreshToken");
    if (!user) {
      res.status(404).json({ success: false, error: "User not found" });
      return;
    }
    res.status(200).json({ success: true, data: { user: sanitizeUser(user) } });
  } catch (err) {
    next(err);
  }
}
export async function updateMe(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { userId } = req as AuthRequest;
    const { name } = req.body as { name?: string };
    const user = await User.findByIdAndUpdate(
      userId,
      { name },
      { new: true },
    ).select("-password -refreshToken");
    res.json({ success: true, data: { name: user?.name } });
  } catch (err) {
    next(err);
  }
}

export async function changePassword(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { userId } = req as AuthRequest;
    const { currentPassword, newPassword } = req.body as {
      currentPassword: string;
      newPassword: string;
    };
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ success: false, error: "User not found" });
      return;
    }
    const valid = await user.comparePassword(currentPassword);
    if (!valid) {
      res
        .status(401)
        .json({ success: false, error: "Current password is incorrect" });
      return;
    }
    user.password = newPassword;
    await user.save();
    res.json({ success: true, data: null });
  } catch (err) {
    next(err);
  }
}

export async function resetBalance(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { userId } = req as AuthRequest;
    await User.findByIdAndUpdate(userId, { virtualBalance: 100000 });
    await Portfolio.findOneAndDelete({ userId });
    await Transaction.deleteMany({ userId });
    res.json({ success: true, data: null });
  } catch (err) {
    next(err);
  }
}

export async function deleteMe(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { userId } = req as AuthRequest;
    await User.findByIdAndDelete(userId);
    await Portfolio.findOneAndDelete({ userId });
    await Transaction.deleteMany({ userId });
    await Watchlist.findOneAndDelete({ userId });
    await Alert.deleteMany({ userId });
    res.clearCookie("refreshToken", REFRESH_COOKIE_OPTIONS);
    res.json({ success: true, data: null });
  } catch (err) {
    next(err);
  }
}
