import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import type { PortfolioPerformance } from "@/types";

export function usePerformance() {
  return useQuery({
    queryKey: ["performance"],
    queryFn: () =>
      api
        .get<{ success: true; data: { performance: PortfolioPerformance } }>(
          "/portfolio/performance"
        )
        .then((r) => r.data.data.performance),
  });
}