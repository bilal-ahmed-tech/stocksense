import { useQueries } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import type { StockQuote } from "@/types";

export function useStockQuotes(symbols: string[]) {
  const results = useQueries({
    queries: symbols.map((symbol) => ({
      queryKey: ["stock", symbol],
      queryFn: () =>
        api
          .get<{ success: true; data: { quote: StockQuote } }>(
            `/stocks/${symbol}`
          )
          .then((r) => r.data.data.quote),
      enabled: !!symbol,
      staleTime: 60 * 1000,
    })),
  });

  // Build a map of symbol → quote for easy lookup
  const quotes: Record<string, StockQuote | undefined> = {};
  const errors: Record<string, boolean> = {};

  symbols.forEach((symbol, i) => {
    quotes[symbol] = results[i].data;
    errors[symbol] = results[i].isError;
  });

  const isLoading = results.some((r) => r.isLoading);

  return { quotes, errors, isLoading };
}