import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import type { StockSearchResult } from "@/types";

export function useStockSearch(query: string) {
  return useQuery({
    queryKey: ["stockSearch", query],
    queryFn: () =>
      api
        .get<{ success: true; data: { results: StockSearchResult[] } }>(
          `/stocks/search?q=${encodeURIComponent(query)}`
        )
        .then((r) => r.data.data.results),
    enabled: query.trim().length >= 1,
    staleTime: 5 * 60 * 1000,
  });
}