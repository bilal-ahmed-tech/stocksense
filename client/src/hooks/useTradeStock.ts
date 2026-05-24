import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { toast } from "sonner";
import { api } from "@/lib/axios";
import { updateUser } from "@/features/auth/authSlice";
import type { AppDispatch } from "@/app/store";
import type { TradeType } from "@/types";

interface TradePayload {
  symbol: string;
  name: string;
  shares: number;
  price: number;
  type: TradeType;
}

interface TradeResult {
  newBalance: number;
}

export function useTradeStock() {
  const queryClient = useQueryClient();
  const dispatch = useDispatch<AppDispatch>();

  return useMutation({
    mutationFn: (payload: TradePayload) =>
      api
        .post<{ success: true; data: TradeResult }>(
          `/portfolio/${payload.type.toLowerCase()}`,
          {
            symbol: payload.symbol,
            name: payload.name,
            shares: payload.shares,
            price: payload.price,
          }
        )
        .then((r) => r.data.data),
    onSuccess: (data, variables) => {
      dispatch(updateUser({ virtualBalance: data.newBalance }));
      queryClient.invalidateQueries({ queryKey: ["portfolio"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["performance"] });
      toast.success(
        `${variables.type === "BUY" ? "Bought" : "Sold"} ${variables.shares} share${variables.shares === 1 ? "" : "s"} of ${variables.symbol}`
      );
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Trade failed"
      );
    },
  });
}