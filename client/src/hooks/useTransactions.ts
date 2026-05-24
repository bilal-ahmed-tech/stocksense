import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import type { Transaction } from "@/types";

export function useTransactions() {
  return useQuery({
    queryKey: ["transactions"],
    queryFn: () =>
      api
        .get<{ success: true; data: { transactions: Transaction[] } }>(
          "/portfolio/history"
        )
        .then((r) => r.data.data.transactions),
  });
}