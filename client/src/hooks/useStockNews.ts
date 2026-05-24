import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import type { StockNewsItem } from "@/types";

export function useStockNews(symbol: string) {
  return useQuery({
    queryKey: ["stockNews", symbol],
    queryFn: () =>
      api
        .get<{ success: true; data: { news: StockNewsItem[] } }>(
          `/stocks/${symbol}/news`
        )
        .then((r) => r.data.data.news),
    enabled: !!symbol,
    staleTime: 15 * 60 * 1000,
  });
}