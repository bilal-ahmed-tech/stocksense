import { Watchlist } from "../models/Watchlist";

export async function getOrCreateWatchlist(userId: string) {
  let watchlist = await Watchlist.findOne({ userId });
  if (!watchlist) {
    watchlist = await Watchlist.create({ userId, symbols: [] });
  }
  return watchlist;
}

export async function addToWatchlist(userId: string, symbol: string) {
  const watchlist = await getOrCreateWatchlist(userId);
  const upper = symbol.toUpperCase();
  if (!watchlist.symbols.includes(upper)) {
    watchlist.symbols.push(upper);
    await watchlist.save();
  }
  return watchlist;
}

export async function removeFromWatchlist(userId: string, symbol: string) {
  const watchlist = await getOrCreateWatchlist(userId);
  watchlist.symbols = watchlist.symbols.filter(
    (s) => s !== symbol.toUpperCase()
  );
  await watchlist.save();
  return watchlist;
}