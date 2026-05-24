import { create } from "zustand";

export type Timeframe = "1D" | "1W" | "1M" | "1Y";
export type ChartType = "line" | "area";

interface ChartState {
  timeframe: Timeframe;
  chartType: ChartType;
  setTimeframe: (t: Timeframe) => void;
  setChartType: (t: ChartType) => void;
}

export const useChartStore = create<ChartState>((set) => ({
  timeframe: "1M",
  chartType: "area",
  setTimeframe: (timeframe) => set({ timeframe }),
  setChartType: (chartType) => set({ chartType }),
}));