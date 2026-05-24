import { create } from "zustand";

export type SortColumn =
  | "symbol"
  | "shares"
  | "avgBuyPrice"
  | "currentPrice"
  | "pnl"
  | "pnlPercent"
  | "value";

export type SortDirection = "asc" | "desc";
export type HoldingFilter = "all" | "gain" | "loss";

interface FilterState {
  sortColumn: SortColumn;
  sortDirection: SortDirection;
  filter: HoldingFilter;
  setSortColumn: (col: SortColumn) => void;
  setSortDirection: (dir: SortDirection) => void;
  toggleSort: (col: SortColumn) => void;
  setFilter: (f: HoldingFilter) => void;
}

export const useFilterStore = create<FilterState>((set) => ({
  sortColumn: "value",
  sortDirection: "desc",
  filter: "all",
  setSortColumn: (sortColumn) => set({ sortColumn }),
  setSortDirection: (sortDirection) => set({ sortDirection }),
  toggleSort: (col) =>
    set((s) => ({
      sortColumn: col,
      sortDirection:
        s.sortColumn === col && s.sortDirection === "desc" ? "asc" : "desc",
    })),
  setFilter: (filter) => set({ filter }),
}));