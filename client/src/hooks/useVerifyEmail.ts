import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useDispatch } from "react-redux";
import { api } from "@/lib/axios";
import { updateUser } from "@/features/auth/authSlice";
import type { AppDispatch } from "@/app/store";
import type { User } from "@/types";

function getErrorMessage(err: unknown, fallback: string): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as { error?: string } | undefined;
    if (data?.error) return data.error;
  }
  if (err instanceof Error && err.message) return err.message;
  return fallback;
}

export function useVerifyEmail() {
  const dispatch = useDispatch<AppDispatch>();

  return useMutation({
    mutationFn: async (token: string) => {
      try {
        const res = await api.post<{ success: true; data: { user: User } }>(
          "/auth/verify-email",
          { token },
        );
        return res.data.data.user;
      } catch (err) {
        throw new Error(getErrorMessage(err, "Verification failed"));
      }
    },
    onSuccess: (user) => {
      dispatch(updateUser({ emailVerified: user.emailVerified }));
    },
  });
}
