import mongoose, { Document, Schema } from "mongoose";

export type TradeType = "BUY" | "SELL";

export interface ITransaction extends Document {
  userId: mongoose.Types.ObjectId;
  symbol: string;
  name: string;
  type: TradeType;
  shares: number;
  priceAtTime: number;
  totalValue: number;
  createdAt: Date;
}

const transactionSchema = new Schema<ITransaction>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    symbol: { type: String, required: true, uppercase: true },
    name: { type: String, required: true },
    type: { type: String, enum: ["BUY", "SELL"], required: true },
    shares: { type: Number, required: true, min: 0 },
    priceAtTime: { type: Number, required: true, min: 0 },
    totalValue: { type: Number, required: true, min: 0 },
  },
  { timestamps: true }
);

export const Transaction = mongoose.model<ITransaction>(
  "Transaction",
  transactionSchema
);