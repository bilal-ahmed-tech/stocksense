import { QueryClient } from "@tanstack/react-query";
import axios from "axios";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        // Never retry on 429 (rate limit) or 404 (not found)
        if (axios.isAxiosError(error)) {
          const status = error.response?.status;
          if (status === 429 || status === 404) return false;
        }
        // Otherwise retry once
        return failureCount < 1;
      },
    },
  },
});