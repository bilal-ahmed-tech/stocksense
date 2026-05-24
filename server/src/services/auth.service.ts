import jwt from "jsonwebtoken";
import { User, IUser } from "../models/User";

interface TokenPayload {
  userId: string;
}

export function generateAccessToken(userId: string): string {
  return jwt.sign(
    { userId } as TokenPayload,
    process.env.JWT_ACCESS_SECRET!,
    { expiresIn: "15m" }
  );
}

export function generateRefreshToken(userId: string): string {
  return jwt.sign(
    { userId } as TokenPayload,
    process.env.JWT_REFRESH_SECRET!,
    { expiresIn: "7d" }
  );
}

export function verifyAccessToken(token: string): TokenPayload {
  return jwt.verify(token, process.env.JWT_ACCESS_SECRET!) as TokenPayload;
}

export function verifyRefreshToken(token: string): TokenPayload {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET!) as TokenPayload;
}

export function sanitizeUser(user: IUser) {
  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    avatar: user.avatar,
    virtualBalance: user.virtualBalance,
    createdAt: user.createdAt,
  };
}

export async function registerUser(
  name: string,
  email: string,
  password: string
) {
  const existing = await User.findOne({ email });
  if (existing) {
    const err = new Error("Email already in use") as Error & { status: number };
    err.status = 409;
    throw err;
  }

  const user = await User.create({ name, email, password });
  const accessToken = generateAccessToken(user._id.toString());
  const refreshToken = generateRefreshToken(user._id.toString());

  user.refreshToken = refreshToken;
  await user.save();

  return { user: sanitizeUser(user), accessToken, refreshToken };
}

export async function loginUser(email: string, password: string) {
  const user = await User.findOne({ email });
  if (!user) {
    const err = new Error("Invalid email or password") as Error & {
      status: number;
    };
    err.status = 401;
    throw err;
  }

  const valid = await user.comparePassword(password);
  if (!valid) {
    const err = new Error("Invalid email or password") as Error & {
      status: number;
    };
    err.status = 401;
    throw err;
  }

  const accessToken = generateAccessToken(user._id.toString());
  const refreshToken = generateRefreshToken(user._id.toString());

  user.refreshToken = refreshToken;
  await user.save();

  return { user: sanitizeUser(user), accessToken, refreshToken };
}

export async function refreshAccessToken(token: string) {
  let payload: TokenPayload;
  try {
    payload = verifyRefreshToken(token);
  } catch {
    const err = new Error("Invalid refresh token") as Error & {
      status: number;
    };
    err.status = 401;
    throw err;
  }

  const user = await User.findById(payload.userId);
  if (!user || user.refreshToken !== token) {
    const err = new Error("Invalid refresh token") as Error & {
      status: number;
    };
    err.status = 401;
    throw err;
  }

  const accessToken = generateAccessToken(user._id.toString());
  return { accessToken };
}

export async function logoutUser(token: string) {
  const user = await User.findOne({ refreshToken: token });
  if (user) {
    user.refreshToken = null;
    await user.save();
  }
}