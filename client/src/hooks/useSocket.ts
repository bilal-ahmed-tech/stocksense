import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import type { RootState } from "@/app/store";
import type { AppDispatch } from "@/app/store";
import { getSocket, disconnectSocket } from "@/lib/socket";
import { addNotification } from "@/features/notifications/notificationsSlice";
import type { PriceUpdatePayload, AlertTriggeredPayload } from "@/types";

type PriceUpdateHandler = (payload: PriceUpdatePayload) => void;

export function useSocket(onPriceUpdate?: PriceUpdateHandler) {
  const accessToken = useSelector((s: RootState) => s.auth.accessToken);
  const isAuthenticated = useSelector((s: RootState) => s.auth.isAuthenticated);
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    if (!isAuthenticated || !accessToken) return;

    const socket = getSocket(accessToken);

    socket.on("price:update", (payload: PriceUpdatePayload) => {
      onPriceUpdate?.(payload);
    });

    socket.on("alert:triggered", (payload: AlertTriggeredPayload) => {
      dispatch(
        addNotification({
          type: "info",
          title: `Alert triggered: ${payload.symbol}`,
          message: `Price reached $${payload.price.toFixed(2)}`,
        })
      );
    });

    return () => {
      socket.off("price:update");
      socket.off("alert:triggered");
    };
  }, [isAuthenticated, accessToken, dispatch, onPriceUpdate]);
}

export function useDisconnectSocket() {
  const isAuthenticated = useSelector((s: RootState) => s.auth.isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated) {
      disconnectSocket();
    }
  }, [isAuthenticated]);
}