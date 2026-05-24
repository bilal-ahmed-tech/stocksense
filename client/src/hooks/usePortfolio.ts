import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import type { Portfolio } from "@/types";

export function usePortfolio() {
  return useQuery({
    queryKey: ["portfolio"],
    queryFn: () =>
      api
        .get<{ success: true; data: { portfolio: Portfolio } }>("/portfolio")
        .then((r) => r.data.data.portfolio),
  });
}