import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import type { Alert, AlertCondition } from "@/types";

export function useAlerts() {
  return useQuery({
    queryKey: ["alerts"],
    queryFn: () =>
      api
        .get<{ success: true; data: { alerts: Alert[] } }>("/alerts")
        .then((r) => r.data.data.alerts),
  });
}

export function useCreateAlert() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: {
      symbol: string;
      condition: AlertCondition;
      targetPrice: number;
    }) => api.post("/alerts", payload).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alerts"] });
    },
  });
}

export function useToggleAlert() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (alertId: string) =>
      api.patch(`/alerts/${alertId}/toggle`).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alerts"] });
    },
  });
}

export function useDeleteAlert() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (alertId: string) =>
      api.delete(`/alerts/${alertId}`).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alerts"] });
    },
  });
}