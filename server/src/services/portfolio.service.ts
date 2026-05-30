import { Portfolio } from "../models/Portfolio";
import { Transaction } from "../models/Transaction";
import { User } from "../models/User";

export async function getOrCreatePortfolio(userId: string) {
  let portfolio = await Portfolio.findOne({ userId });
  if (!portfolio) {
    portfolio = await Portfolio.create({ userId, holdings: [], totalInvested: 0 });
  }
  return portfolio;
}

export async function buyStock(
  userId: string,
  symbol: string,
  name: string,
  shares: number,
  price: number
) {
  const totalCost = shares * price;

  // Check user has enough balance
  const user = await User.findById(userId);
  if (!user) throw Object.assign(new Error("User not found"), { status: 404 });
  if (user.virtualBalance < totalCost) {
    throw Object.assign(new Error("Insufficient virtual balance"), { status: 400 });
  }

  // Deduct balance
  user.virtualBalance -= totalCost;
  await user.save();

  // Update portfolio
  const portfolio = await getOrCreatePortfolio(userId);
  const existing = portfolio.holdings.find((h) => h.symbol === symbol.toUpperCase());

  if (existing) {
    // Update average buy price
    const newTotalInvested = existing.totalInvested + totalCost;
    const newShares = existing.shares + shares;
    existing.avgBuyPrice = newTotalInvested / newShares;
    existing.shares = newShares;
    existing.totalInvested = newTotalInvested;
  } else {
    portfolio.holdings.push({
      symbol: symbol.toUpperCase(),
      name,
      shares,
      avgBuyPrice: price,
      totalInvested: totalCost,
    });
  }

  portfolio.totalInvested += totalCost;
  await portfolio.save();

  // Record transaction
  const transaction = await Transaction.create({
    userId,
    symbol: symbol.toUpperCase(),
    name,
    type: "BUY",
    shares,
    priceAtTime: price,
    totalValue: totalCost,
  });

  return { portfolio, transaction, newBalance: user.virtualBalance };
}

export async function sellStock(
  userId: string,
  symbol: string,
  name: string,
  shares: number,
  price: number
) {
  const totalValue = shares * price;

  const portfolio = await getOrCreatePortfolio(userId);
  const holding = portfolio.holdings.find(
    (h) => h.symbol === symbol.toUpperCase()
  );

  if (!holding) {
    throw Object.assign(new Error("You do not own this stock"), { status: 400 });
  }
  if (holding.shares < shares) {
    throw Object.assign(new Error("Not enough shares to sell"), { status: 400 });
  }

  // Update holding
  holding.shares -= shares;
  holding.totalInvested -= holding.avgBuyPrice * shares;
  portfolio.totalInvested -= holding.avgBuyPrice * shares;

  // Remove holding if shares reach 0
  if (holding.shares === 0) {
    portfolio.holdings = portfolio.holdings.filter(
      (h) => h.symbol !== symbol.toUpperCase()
    );
  }

  await portfolio.save();

  // Credit balance
  const user = await User.findById(userId);
  if (!user) throw Object.assign(new Error("User not found"), { status: 404 });
  user.virtualBalance += totalValue;
  await user.save();

  // Record transaction
  const transaction = await Transaction.create({
    userId,
    symbol: symbol.toUpperCase(),
    name,
    type: "SELL",
    shares,
    priceAtTime: price,
    totalValue,
  });

  return { portfolio, transaction, newBalance: user.virtualBalance };
}

export async function getHoldings(userId: string) {
  const portfolio = await getOrCreatePortfolio(userId);
  return portfolio.holdings;
}

export async function getTransactionHistory(userId: string) {
  return Transaction.find({ userId }).sort({ createdAt: -1 }).limit(50);
}
export async function getPerformance(userId: string) {
  const [portfolio, transactions, user] = await Promise.all([
    getOrCreatePortfolio(userId),
    Transaction.find({ userId }).sort({ createdAt: 1 }), // oldest first for replay
    User.findById(userId),
  ]);

  // ─── Current P&L using avgBuyPrice (no live prices needed server-side) ───
  // Live prices are fetched client-side via useStockQuotes — same pattern
  // as Portfolio page. Server returns invested amounts, client enriches with
  // live prices.

  const totalInvested = portfolio.totalInvested;
  const currentBalance = user?.virtualBalance ?? 0;

  // ─── Historical chart — replay transactions to get portfolio value over time ───
  // Each data point = total invested at that transaction date.
  // We use priceAtTime already stored — zero extra API calls needed.

  interface HoldingSnapshot {
    shares: number;
    avgBuyPrice: number;
    totalInvested: number;
  }

  const holdingMap = new Map<string, HoldingSnapshot>();
  const chartPoints: { date: string; value: number }[] = [];

  let runningInvested = 0;

  for (const tx of transactions) {
    const sym = tx.symbol;

    if (tx.type === "BUY") {
      const existing = holdingMap.get(sym);
      if (existing) {
        const newTotalInvested = existing.totalInvested + tx.totalValue;
        const newShares = existing.shares + tx.shares;
        holdingMap.set(sym, {
          shares: newShares,
          avgBuyPrice: newTotalInvested / newShares,
          totalInvested: newTotalInvested,
        });
      } else {
        holdingMap.set(sym, {
          shares: tx.shares,
          avgBuyPrice: tx.priceAtTime,
          totalInvested: tx.totalValue,
        });
      }
      runningInvested += tx.totalValue;
    } else {
      // SELL
      const existing = holdingMap.get(sym);
      if (existing) {
        const newShares = existing.shares - tx.shares;
        const soldInvested = existing.avgBuyPrice * tx.shares;
        runningInvested -= soldInvested;

        if (newShares <= 0) {
          holdingMap.delete(sym);
        } else {
          holdingMap.set(sym, {
            shares: newShares,
            avgBuyPrice: existing.avgBuyPrice,
            totalInvested: existing.totalInvested - soldInvested,
          });
        }
      }
    }

    // Snapshot — portfolio value at this transaction using priceAtTime
    // This gives a real curve based on actual trade prices
    let snapshotValue = 0;
    holdingMap.forEach((h) => {
      snapshotValue += h.shares * h.avgBuyPrice;
    });

    chartPoints.push({
      date: tx.createdAt.toISOString().split("T")[0],
      value: parseFloat(snapshotValue.toFixed(2)),
    });
  }

  // Deduplicate same-day points — keep last trade of each day
  const dedupedChart = chartPoints.reduce(
    (acc, point) => {
      acc[point.date] = point; // later trades overwrite earlier same-day trades
      return acc;
    },
    {} as Record<string, { date: string; value: number }>
  );

  const chart = Object.values(dedupedChart).sort((a, b) =>
    a.date.localeCompare(b.date)
  );

  // Add today as final point if there are holdings
  if (portfolio.holdings.length > 0 && chart.length > 0) {
    const today = new Date().toISOString().split("T")[0];
    if (chart[chart.length - 1].date !== today) {
      chart.push({
        date: today,
        value: parseFloat(totalInvested.toFixed(2)),
      });
    }
  }

  return {
    totalInvested,
    currentBalance,
    totalHoldings: portfolio.holdings.length,
    // P&L is calculated client-side with live prices
    // Server returns invested amounts as baseline
    chart,
  };
}