import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import type { StockQuote } from "@/types";

export function useStock(symbol: string) {
  return useQuery({
    queryKey: ["stock", symbol],
    queryFn: () =>
      api
        .get<{ success: true; data: { quote: StockQuote } }>(
          `/stocks/${symbol}`
        )
        .then((r) => r.data.data.quote),
    enabled: !!symbol,
    staleTime: 60 * 1000,
  });
}