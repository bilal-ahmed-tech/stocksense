import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/axios";
import type { Watchlist } from "@/types";

export function useWatchlist() {
  return useQuery({
    queryKey: ["watchlist"],
    queryFn: () =>
      api
        .get<{ success: true; data: { watchlist: Watchlist } }>("/watchlist")
        .then((r) => r.data.data.watchlist),
  });
}

export function useAddToWatchlist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (symbol: string) =>
      api.post(`/watchlist/${symbol}`).then((r) => r.data),
    onSuccess: (_data, symbol) => {
      queryClient.invalidateQueries({ queryKey: ["watchlist"] });
      toast.success(`${symbol} added to watchlist`);
    },
    onError: () => {
      toast.error("Failed to add to watchlist");
    },
  });
}

export function useRemoveFromWatchlist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (symbol: string) =>
      api.delete(`/watchlist/${symbol}`).then((r) => r.data),
    onSuccess: (_data, symbol) => {
      queryClient.invalidateQueries({ queryKey: ["watchlist"] });
      toast.success(`${symbol} removed from watchlist`);
    },
    onError: () => {
      toast.error("Failed to remove from watchlist");
    },
  });
}