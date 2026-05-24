import { getIO } from "../config/socket";
import { getStockQuote } from "./alphaVantage.service";
import { Watchlist } from "../models/Watchlist";
import { Portfolio } from "../models/Portfolio";
import { Alert } from "../models/Alert";
import { sendAlertEmail } from "./email.service";
import { User } from "../models/User";

let pollerInterval: ReturnType<typeof setInterval> | null = null;

async function getAllTrackedSymbols(): Promise<string[]> {
  const [watchlists, portfolios] = await Promise.all([
    Watchlist.find({}, "symbols"),
    Portfolio.find({}, "holdings.symbol"),
  ]);

  const symbols = new Set<string>();

  watchlists.forEach((w) => w.symbols.forEach((s) => symbols.add(s)));
  portfolios.forEach((p) =>
    p.holdings.forEach((h) => symbols.add(h.symbol))
  );

  return Array.from(symbols);
}

async function checkAlerts(symbol: string, price: number): Promise<void> {
  const alerts = await Alert.find({
    symbol,
    triggered: false,
    active: true,
  });

  for (const alert of alerts) {
    const triggered =
      alert.condition === "ABOVE"
        ? price >= alert.targetPrice
        : price <= alert.targetPrice;

    if (!triggered) continue;

    alert.triggered = true;
    alert.notifiedAt = new Date();
    await alert.save();

    // Emit socket event
    try {
      const io = getIO();
      io.emit("alert:triggered", {
        alertId: alert._id,
        symbol,
        price,
      });
    } catch {
      // socket not initialized yet
    }

    // Send email
    try {
      const user = await User.findById(alert.userId);
      if (user?.email) {
        await sendAlertEmail(
          user.email,
          user.name,
          symbol,
          alert.condition,
          alert.targetPrice,
          price
        );
      }
    } catch {
      // email failed silently
    }
  }
}

async function pollPrices(): Promise<void> {
  try {
    const symbols = await getAllTrackedSymbols();
    if (symbols.length === 0) return;

    const io = getIO();

    for (const symbol of symbols) {
      try {
        const quote = await getStockQuote(symbol);
        io.emit("price:update", {
          symbol: quote.symbol,
          price: quote.price,
          change: quote.change,
          changePercent: quote.changePercent,
        });
        await checkAlerts(symbol, quote.price);
      } catch {
        // skip failed symbol
      }
    }
  } catch {
    // skip failed poll
  }
}

export function startPricePoller(): void {
  if (pollerInterval) return;
  // Poll every 60 seconds
  pollerInterval = setInterval(() => {
    void pollPrices();
  }, 60 * 1000);
  console.log("Price poller started");
}

export function stopPricePoller(): void {
  if (pollerInterval) {
    clearInterval(pollerInterval);
    pollerInterval = null;
  }
}