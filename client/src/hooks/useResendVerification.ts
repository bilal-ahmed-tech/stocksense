import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { api } from "@/lib/axios";

function getErrorMessage(err: unknown, fallback: string): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as { error?: string } | undefined;
    if (data?.error) return data.error;
  }
  if (err instanceof Error && err.message) return err.message;
  return fallback;
}

export function useResendVerification() {
  return useMutation({
    mutationFn: async () => {
      try {
        const res = await api.post<{ success: true; data: null }>(
          "/auth/resend-verification",
        );
        return res.data;
      } catch (err) {
        throw new Error(getErrorMessage(err, "Failed to send verification email"));
      }
    },
  });
}
