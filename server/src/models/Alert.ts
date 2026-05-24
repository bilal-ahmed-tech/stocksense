import mongoose, { Document, Schema } from "mongoose";

export type AlertCondition = "ABOVE" | "BELOW";

export interface IAlert extends Document {
  userId: mongoose.Types.ObjectId;
  symbol: string;
  condition: AlertCondition;
  targetPrice: number;
  triggered: boolean;
  active: boolean;
  notifiedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const alertSchema = new Schema<IAlert>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    symbol: { type: String, required: true, uppercase: true },
    condition: { type: String, enum: ["ABOVE", "BELOW"], required: true },
    targetPrice: { type: Number, required: true, min: 0 },
    triggered: { type: Boolean, default: false },
    active: { type: Boolean, default: true },
    notifiedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export const Alert = mongoose.model<IAlert>("Alert", alertSchema);