import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import type { StockChartPoint } from "@/types";
import type { Timeframe } from "@/stores/useChartStore";

export function useStockChart(symbol: string, timeframe: Timeframe) {
  return useQuery({
    queryKey: ["stockChart", symbol, timeframe],
    queryFn: () =>
      api
        .get<{ success: true; data: { points: StockChartPoint[] } }>(
          `/stocks/${symbol}/chart?range=${timeframe}`
        )
        .then((r) => r.data.data.points),
    enabled: !!symbol,
    staleTime: 60 * 1000,
  });
}