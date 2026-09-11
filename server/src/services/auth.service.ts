import crypto from "crypto";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import { User, IUser } from "../models/User";
import {
  sendVerificationEmail,
} from "./email.service";

interface TokenPayload {
  userId: string;
}

function getGoogleClient() {
  return new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
}

function createVerificationToken(): { token: string; expires: Date } {
  const token = crypto.randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
  return { token, expires };
}

async function issueSession(user: IUser) {
  const accessToken = generateAccessToken(user._id.toString());
  const refreshToken = generateRefreshToken(user._id.toString());

  user.refreshToken = refreshToken;
  await user.save();

  return { user: sanitizeUser(user), accessToken, refreshToken };
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
    // Existing accounts created before verification existed are treated as verified
    emailVerified: user.emailVerified !== false,
    authProvider: user.authProvider ?? "local",
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

  const { token, expires } = createVerificationToken();

  const user = await User.create({
    name,
    email,
    password,
    authProvider: "local",
    emailVerified: false,
    verificationToken: token,
    verificationTokenExpires: expires,
  });

  try {
    await sendVerificationEmail(user.email, user.name, token);
  } catch {
    // registration succeeds even if email fails — user can resend later
  }

  return issueSession(user);
}

export async function loginUser(email: string, password: string) {
  const user = await User.findOne({ email }).select("+password");
  if (!user || !user.password) {
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

  return issueSession(user);
}

export async function loginWithGoogle(idToken: string) {
  if (!process.env.GOOGLE_CLIENT_ID) {
    const err = new Error("Google sign-in is not configured") as Error & {
      status: number;
    };
    err.status = 503;
    throw err;
  }

  let payload;
  try {
    const ticket = await getGoogleClient().verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID!,
    });
    payload = ticket.getPayload();
  } catch {
    const err = new Error("Invalid Google token") as Error & { status: number };
    err.status = 401;
    throw err;
  }

  if (!payload?.email) {
    const err = new Error("Google account has no email") as Error & {
      status: number;
    };
    err.status = 400;
    throw err;
  }

  const googleId = payload.sub;
  const email = payload.email.toLowerCase();
  const name = payload.name || email.split("@")[0];
  const avatar = payload.picture || null;

  let user = await User.findOne({ googleId });

  if (!user) {
    const existingByEmail = await User.findOne({ email }).select("+password");

    if (existingByEmail) {
      if (existingByEmail.googleId && existingByEmail.googleId !== googleId) {
        const err = new Error("Email already linked to another account") as Error & {
          status: number;
        };
        err.status = 409;
        throw err;
      }

      existingByEmail.googleId = googleId;
      existingByEmail.authProvider = existingByEmail.password
        ? existingByEmail.authProvider
        : "google";
      existingByEmail.emailVerified = payload.email_verified ?? true;
      if (!existingByEmail.avatar && avatar) {
        existingByEmail.avatar = avatar;
      }
      user = existingByEmail;
    } else {
      user = await User.create({
        name,
        email,
        googleId,
        authProvider: "google",
        emailVerified: payload.email_verified ?? true,
        avatar,
      });
    }
  }

  return issueSession(user);
}

export async function verifyEmail(token: string) {
  const user = await User.findOne({
    verificationToken: token,
    verificationTokenExpires: { $gt: new Date() },
  }).select("+verificationToken +verificationTokenExpires");

  if (!user) {
    const err = new Error("Invalid or expired verification link") as Error & {
      status: number;
    };
    err.status = 400;
    throw err;
  }

  user.emailVerified = true;
  user.verificationToken = null;
  user.verificationTokenExpires = null;
  await user.save();

  return sanitizeUser(user);
}

export async function resendVerificationEmail(userId: string) {
  const user = await User.findById(userId).select(
    "+verificationToken +verificationTokenExpires"
  );

  if (!user) {
    const err = new Error("User not found") as Error & { status: number };
    err.status = 404;
    throw err;
  }

  if (user.emailVerified !== false) {
    const err = new Error("Email is already verified") as Error & {
      status: number;
    };
    err.status = 400;
    throw err;
  }

  if (user.authProvider === "google") {
    const err = new Error("Google accounts are already verified") as Error & {
      status: number;
    };
    err.status = 400;
    throw err;
  }

  const { token, expires } = createVerificationToken();
  user.verificationToken = token;
  user.verificationTokenExpires = expires;
  await user.save();

  await sendVerificationEmail(user.email, user.name, token);
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
