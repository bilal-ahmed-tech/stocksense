import mongoose, { Document, Schema } from "mongoose";

export interface IWatchlist extends Document {
  userId: mongoose.Types.ObjectId;
  symbols: string[];
  createdAt: Date;
  updatedAt: Date;
}

const watchlistSchema = new Schema<IWatchlist>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    symbols: [{ type: String, uppercase: true }],
  },
  { timestamps: true }
);

export const Watchlist = mongoose.model<IWatchlist>("Watchlist", watchlistSchema);