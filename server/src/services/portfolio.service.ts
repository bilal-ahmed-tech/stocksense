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