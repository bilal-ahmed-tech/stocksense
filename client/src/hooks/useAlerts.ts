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

    // Instantly flip active state before server responds
    onMutate: async (alertId) => {
      await queryClient.cancelQueries({ queryKey: ["alerts"] });
      const previous = queryClient.getQueryData<Alert[]>(["alerts"]);

      queryClient.setQueryData<Alert[]>(["alerts"], (old) =>
        old?.map((a) =>
          a._id === alertId ? { ...a, active: !a.active } : a
        )
      );

      return { previous };
    },

    // Roll back on failure
    onError: (_err, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["alerts"], context.previous);
      }
    },

    // Always sync with server after settle
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["alerts"] });
    },
  });
}

export function useDeleteAlert() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (alertId: string) =>
      api.delete(`/alerts/${alertId}`).then((r) => r.data),

    // Instantly remove from list
    onMutate: async (alertId) => {
      await queryClient.cancelQueries({ queryKey: ["alerts"] });
      const previous = queryClient.getQueryData<Alert[]>(["alerts"]);

      queryClient.setQueryData<Alert[]>(["alerts"], (old) =>
        old?.filter((a) => a._id !== alertId)
      );

      return { previous };
    },

    // Roll back on failure
    onError: (_err, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["alerts"], context.previous);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["alerts"] });
    },
  });
}