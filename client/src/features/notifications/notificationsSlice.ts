import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type NotificationType = "success" | "error" | "info" | "warning";

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  createdAt: number;
}

interface NotificationsState {
  queue: Notification[];
}

const initialState: NotificationsState = {
  queue: [],
};

const notificationsSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    addNotification(
      state,
      action: PayloadAction<Omit<Notification, "id" | "createdAt">>
    ) {
      state.queue.push({
        ...action.payload,
        id: crypto.randomUUID(),
        createdAt: Date.now(),
      });
    },
    removeNotification(state, action: PayloadAction<string>) {
      state.queue = state.queue.filter((n) => n.id !== action.payload);
    },
    clearNotifications(state) {
      state.queue = [];
    },
  },
});

export const { addNotification, removeNotification, clearNotifications } =
  notificationsSlice.actions;
export const notificationsReducer = notificationsSlice.reducer;