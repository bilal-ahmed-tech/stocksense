import mongoose, { Document, Schema } from "mongoose";
import bcrypt from "bcryptjs";

export type AuthProvider = "local" | "google";

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  googleId: string | null;
  authProvider: AuthProvider;
  emailVerified: boolean;
  verificationToken: string | null;
  verificationTokenExpires: Date | null;
  avatar: string | null;
  virtualBalance: number;
  refreshToken: string | null;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidate: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      minlength: 8,
      select: false,
    },
    googleId: {
      type: String,
      default: null,
      sparse: true,
      unique: true,
    },
    authProvider: {
      type: String,
      enum: ["local", "google"],
      default: "local",
    },
    emailVerified: {
      type: Boolean,
      default: true,
    },
    verificationToken: {
      type: String,
      default: null,
      select: false,
    },
    verificationTokenExpires: {
      type: Date,
      default: null,
      select: false,
    },
    avatar: {
      type: String,
      default: null,
    },
    virtualBalance: {
      type: Number,
      default: 100000,
    },
    refreshToken: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function () {
  if (!this.isModified("password") || !this.password) return;
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = function (
  candidate: string
): Promise<boolean> {
  if (!this.password) return Promise.resolve(false);
  return bcrypt.compare(candidate, this.password);
};

export const User = mongoose.model<IUser>("User", userSchema);
