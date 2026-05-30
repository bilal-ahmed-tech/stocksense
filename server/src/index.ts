import dns from "node:dns";
dns.setServers(["8.8.8.8", "1.1.1.1"]);

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { createServer } from "http";
import { connectDB } from "./config/db";
import { validateEnv } from "./config/env";
import { initSocket } from "./config/socket";
import { errorHandler } from "./middleware/errorHandler";
import authRoutes from "./routes/auth.routes";
import portfolioRoutes from "./routes/portfolio.routes";
import stockRoutes from "./routes/stock.routes";
import watchlistRoutes from "./routes/watchlist.routes";
import alertRoutes from "./routes/alert.routes";
import uploadRoutes from "./routes/upload.routes";
import { startPricePoller } from "./services/pricePoller";

const env = validateEnv();

const app = express();
const httpServer = createServer(app);
app.set("trust proxy", 1);
app.use(cors({ origin: env.CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.get("/health", (_req, res) => {
  res.json({ success: true, data: { status: "ok" } });
});

app.use("/api/auth", authRoutes);
app.use("/api/portfolio", portfolioRoutes);
app.use("/api/stocks", stockRoutes);
app.use("/api/watchlist", watchlistRoutes);
app.use("/api/alerts", alertRoutes);
app.use("/api/upload", uploadRoutes);

app.use(errorHandler);

async function start() {
  await connectDB(env.MONGODB_URI);
  initSocket(httpServer);
  httpServer.listen(env.PORT, () => {
    console.log(`Server running on port ${env.PORT}`);
    startPricePoller();
  });
}

start().catch(console.error);