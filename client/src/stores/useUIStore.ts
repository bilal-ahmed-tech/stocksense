import { create } from "zustand";

type ModalType = "trade" | "createAlert" | "resetBalance" | "deleteAccount" | null;

interface UIState {
  sidebarOpen: boolean;
  activeModal: ModalType;
  tradeSymbol: string | null;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  openModal: (modal: ModalType, symbol?: string) => void;
  closeModal: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  activeModal: null,
  tradeSymbol: null,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  openModal: (modal, symbol) =>
    set({ activeModal: modal, tradeSymbol: symbol ?? null }),
  closeModal: () => set({ activeModal: null, tradeSymbol: null }),
}));