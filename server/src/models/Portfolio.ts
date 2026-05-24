import mongoose, { Document, Schema } from "mongoose";

export interface IHolding {
  symbol: string;
  name: string;
  shares: number;
  avgBuyPrice: number;
  totalInvested: number;
}

export interface IPortfolio extends Document {
  userId: mongoose.Types.ObjectId;
  holdings: IHolding[];
  totalInvested: number;
  createdAt: Date;
  updatedAt: Date;
}

const holdingSchema = new Schema<IHolding>(
  {
    symbol: { type: String, required: true, uppercase: true },
    name: { type: String, required: true },
    shares: { type: Number, required: true, min: 0 },
    avgBuyPrice: { type: Number, required: true, min: 0 },
    totalInvested: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const portfolioSchema = new Schema<IPortfolio>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    holdings: [holdingSchema],
    totalInvested: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Portfolio = mongoose.model<IPortfolio>("Portfolio", portfolioSchema);